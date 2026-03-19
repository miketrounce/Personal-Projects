import {
  applyPolicy,
  applyTrade,
  COUNTRY_PRESETS,
  createInitialState,
  DEFAULT_COUNTRY_ID,
  DEFAULT_MODE,
  GAME_MODES,
  getDailyChallenge,
  getRunAnalysis,
  getScore,
  getSummaryMessage
} from "./economy.js?v=20260319-6";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL
} from "./supabase-config.js?v=20260319-6";

const openingOverlay = document.querySelector("#opening-overlay");
const openingCopyElement = document.querySelector("#opening-copy");
const skipOpeningButton = document.querySelector("#skip-opening-button");
const turnOverlay = document.querySelector("#turn-overlay");
const turnKickerElement = document.querySelector("#turn-kicker");
const turnTitleElement = document.querySelector("#turn-title");
const turnCopyElement = document.querySelector("#turn-copy");
const turnChipAElement = document.querySelector("#turn-chip-a");
const turnChipBElement = document.querySelector("#turn-chip-b");
const turnChipCElement = document.querySelector("#turn-chip-c");
const navItems = document.querySelectorAll(".nav-item");
const openLeaderboardButton = document.querySelector("#open-leaderboard-button");
const statsElement = document.querySelector("#stats");
const statusElement = document.querySelector("#status");
const historyElement = document.querySelector("#history");
const analysisElement = document.querySelector("#analysis");
const macroChartElement = document.querySelector("#macro-chart");
const socialChartElement = document.querySelector("#social-chart");
const policyForm = document.querySelector("#policy-form");
const traderForm = document.querySelector("#trader-form");
const restartButton = document.querySelector("#restart-button");
const traderRestartButton = document.querySelector("#restart-button-trader");
const advanceButton = document.querySelector("#advance-button");
const tradeButton = document.querySelector("#trade-button");
const controlsEyebrow = document.querySelector("#controls-eyebrow");
const controlsTitle = document.querySelector("#controls-title");
const modeSelect = document.querySelector("#mode-select");
const modeSummaryElement = document.querySelector("#mode-summary");
const countrySelect = document.querySelector("#country-select");
const countrySummaryElement = document.querySelector("#country-summary");
const challengeSummaryElement = document.querySelector("#challenge-summary");
const dailyChallengeToggle = document.querySelector("#daily-challenge-toggle");
const traderHintElement = document.querySelector("#trader-hint");

const policyFields = {
  taxRate: document.querySelector("#tax-rate"),
  spendingRate: document.querySelector("#spending-rate"),
  borrowingRate: document.querySelector("#borrowing-rate")
};

const policyOutputs = {
  taxRate: document.querySelector("#tax-output"),
  spendingRate: document.querySelector("#spending-output"),
  borrowingRate: document.querySelector("#borrowing-output")
};

const tradeFields = {
  bondPosition: document.querySelector("#bond-position"),
  currencyPosition: document.querySelector("#currency-position")
};

let state = createInitialState(DEFAULT_COUNTRY_ID, DEFAULT_MODE);
let supabase = null;
let dailyChallengeEnabled = false;
const todayKey = new Date().toISOString().slice(0, 10);
let openingTimer = null;
let transitionTimer = null;

function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

function formatSignedValue(value, digits = 1) {
  const number = Number(value);
  const sign = number > 0 ? "+" : "";
  return `${sign}${number.toFixed(digits)}`;
}

function formatMoney(value) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

function setActiveNav(targetView, targetId = null) {
  navItems.forEach((item) => {
    const isActive =
      item.dataset.view === targetView &&
      (targetId === null ? item.dataset.target === "play-panel" : item.dataset.target === targetId);
    item.classList.toggle("active", isActive);
  });
}

function navigateTo(targetId = null) {
  setActiveNav("home", targetId);
  if (targetId) {
    const target = document.querySelector(`#${targetId}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function showOverlay(element) {
  element.classList.add("visible");
  element.setAttribute("aria-hidden", "false");
}

function hideOverlay(element) {
  element.classList.remove("visible");
  element.setAttribute("aria-hidden", "true");
}

function clearOpeningTimer() {
  if (openingTimer !== null) {
    window.clearTimeout(openingTimer);
    openingTimer = null;
  }
}

function clearTransitionTimer() {
  if (transitionTimer !== null) {
    window.clearTimeout(transitionTimer);
    transitionTimer = null;
  }
}

function dismissOpeningOverlay() {
  clearOpeningTimer();
  hideOverlay(openingOverlay);
}

function buildOpeningCopy() {
  if (dailyChallengeEnabled) {
    const challenge = getDailyChallenge(todayKey);
    return `Today's live briefing is ${challenge.title}. ${challenge.summary}`;
  }

  return state.mode === "trader"
    ? `Your hedge fund desk is live in ${state.countryName}. Read the tape, trade bonds and FX, and build the strongest P&L.`
    : `You are taking charge of ${state.countryName}. Shape policy, guide the economy, and try to deliver the strongest term on the board.`;
}

function playOpeningOverlay() {
  openingCopyElement.textContent = buildOpeningCopy();
  showOverlay(openingOverlay);
  clearOpeningTimer();
  openingTimer = window.setTimeout(dismissOpeningOverlay, 3200);
}

function getTransitionScene(entry) {
  if (state.mode === "trader") {
    return {
      kicker: `Year ${entry.year} Market Close`,
      title:
        entry.pnlAmount >= 0
          ? "Trade Book Closed Higher"
          : "The Tape Turned Against You",
      copy: entry.headline,
      chips: [
        `Bonds ${formatSignedValue(entry.bondMove)}%`,
        `FX ${formatSignedValue(entry.currencyMove)}%`,
        `P&L ${formatMoney(entry.pnlAmount)}`
      ]
    };
  }

  return {
    kicker: `Year ${entry.year} Policy Brief`,
    title:
      entry.growth >= 3.5
        ? "Expansion Picked Up"
        : entry.growth < 0
          ? "The Economy Slipped"
          : "A Tense Balancing Act",
    copy: entry.note,
    chips: [
      `Growth ${formatSignedValue(entry.growth)}%`,
      `Inflation ${entry.inflation.toFixed(1)}%`,
      `Debt ${entry.nextDebt.toFixed(1)}`
    ]
  };
}

function playTurnOverlay(entry) {
  const scene = getTransitionScene(entry);
  turnKickerElement.textContent = scene.kicker;
  turnTitleElement.textContent = scene.title;
  turnCopyElement.textContent = scene.copy;
  turnChipAElement.textContent = scene.chips[0];
  turnChipBElement.textContent = scene.chips[1];
  turnChipCElement.textContent = scene.chips[2];
  showOverlay(turnOverlay);
  clearTransitionTimer();
  transitionTimer = window.setTimeout(() => hideOverlay(turnOverlay), 1650);
}

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

async function initializeSupabase() {
  if (!isSupabaseConfigured()) {
    return;
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function syncPolicyOutputs() {
  policyOutputs.taxRate.textContent = `${policyFields.taxRate.value}%`;
  policyOutputs.spendingRate.textContent = `${policyFields.spendingRate.value}%`;
  policyOutputs.borrowingRate.textContent = `${policyFields.borrowingRate.value}%`;
}

function getPolicyFromForm() {
  return {
    taxRate: Number(policyFields.taxRate.value),
    spendingRate: Number(policyFields.spendingRate.value),
    borrowingRate: Number(policyFields.borrowingRate.value)
  };
}

function getTradeFromForm() {
  return {
    bondPosition: tradeFields.bondPosition.value,
    currencyPosition: tradeFields.currencyPosition.value
  };
}

function applyPolicyDefaults() {
  policyFields.taxRate.value = String(state.policyDefaults.taxRate);
  policyFields.spendingRate.value = String(state.policyDefaults.spendingRate);
  policyFields.borrowingRate.value = String(state.policyDefaults.borrowingRate);
}

function resetTradeDefaults() {
  tradeFields.bondPosition.value = "long";
  tradeFields.currencyPosition.value = "flat";
}

function populateModeSelect() {
  modeSelect.innerHTML = Object.values(GAME_MODES)
    .map((mode) => `<option value="${mode.id}">${mode.name}</option>`)
    .join("");
  modeSelect.value = state.mode ?? DEFAULT_MODE;
}

function populateCountrySelect() {
  countrySelect.innerHTML = Object.values(COUNTRY_PRESETS)
    .map((country) => `<option value="${country.id}">${country.name}</option>`)
    .join("");
  countrySelect.value = state.countryId ?? DEFAULT_COUNTRY_ID;
}

function renderAnalysis() {
  analysisElement.innerHTML = getRunAnalysis(state)
    .map(
      (item) => `<article class="analysis-card">
        <p class="analysis-label">${item.label}</p>
        <h3>${item.value}</h3>
        <p>${item.note}</p>
      </article>`
    )
    .join("");
}

function renderStats() {
  const debtRatio = ((state.debt / state.gdp) * 100).toFixed(1);
  const commonStats = [
    ["Mode", GAME_MODES[state.mode].name],
    ["Country", state.countryName],
    ["Year", `${state.year} / ${state.termLength}`],
    ["GDP", state.gdp.toFixed(1)],
    ["Debt / GDP", `${debtRatio}%`],
    ["Inflation", formatPercent(state.inflation)],
    ["Unemployment", formatPercent(state.unemployment)],
    ["Bond yield", formatPercent(state.bondYield)],
    ["Last growth", formatPercent(state.lastGrowth)]
  ];

  const modeSpecificStats =
    state.mode === "trader"
      ? [
          ["Portfolio", state.portfolioValue.toFixed(2)],
          ["Last P&L", formatMoney(state.lastPnl)],
          ["Win streak", String(state.winStreak)],
          ["Best trade", formatMoney(state.bestTrade)],
          ["Score", `${formatMoney(getScore(state))} so far`]
        ]
      : [
          ["Debt", state.debt.toFixed(1)],
          ["Approval", formatPercent(state.approval)],
          [
            "GDP gained",
            state.status === "finished"
              ? getScore(state).toFixed(1)
              : `${getScore(state).toFixed(1)} so far`
          ]
        ];

  const stats = [...commonStats, ...modeSpecificStats];

  statsElement.innerHTML = stats
    .map(
      ([label, value]) =>
        `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`
    )
    .join("");
}

function renderHistory() {
  if (state.history.length === 0) {
    historyElement.innerHTML =
      state.mode === "trader"
        ? "<li>No trades yet. Pick your first bond and FX stance.</li>"
        : "<li>No policy decisions yet. Set your first budget.</li>";
    return;
  }

  if (state.mode === "trader") {
    historyElement.innerHTML = state.history
      .map(
        (entry) => `<li>
          <strong>Year ${entry.year}</strong>: ${entry.headline}
          <div>Bonds ${formatSignedValue(entry.bondMove)}%, currency ${formatSignedValue(entry.currencyMove)}%, portfolio ${formatMoney(entry.pnlAmount)}.</div>
          <div>Trade call: ${entry.bondPosition} bonds, ${entry.currencyPosition} currency.</div>
          <div>${entry.note}</div>
        </li>`
      )
      .join("");
    return;
  }

  historyElement.innerHTML = state.history
    .map((entry) => {
      const warningClass = entry.nextDebt / entry.nextGdp > 1 ? "warning" : "";

      return `<li>
        <strong>Year ${entry.year}</strong>: GDP growth ${entry.growth.toFixed(1)}%, inflation ${entry.inflation.toFixed(1)}%, debt ${entry.nextDebt.toFixed(1)}.
        <div>Unemployment ${entry.unemployment.toFixed(1)}%, bond yield ${entry.bondYield.toFixed(1)}%.</div>
        <div class="${warningClass}">${entry.note}</div>
      </li>`;
    })
    .join("");
}

function buildLine(points, xScale, yScale) {
  return points
    .map((point, index) => {
      const x = 56 + index * xScale;
      const y = 196 - point * yScale;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function renderChart(chartElement, series, points) {
  const maxValue = Math.max(
    ...points.flatMap((point) => series.map((item) => point[item.key])),
    1
  );
  const xScale = points.length > 1 ? 520 / (points.length - 1) : 0;
  const yScale = 160 / maxValue;
  const axisLabels = points
    .map((_, index) => {
      const x = 56 + index * xScale;
      return `<text x="${x}" y="220" text-anchor="middle" font-size="11" fill="#6d6458">Y${index}</text>`;
    })
    .join("");
  const gridLines = [0, 1, 2, 3, 4]
    .map((step) => {
      const y = 36 + step * 40;
      return `<line x1="56" y1="${y}" x2="576" y2="${y}" stroke="#e8dece" stroke-width="1" />`;
    })
    .join("");
  const paths = series
    .map(
      (item) =>
        `<path d="${buildLine(
          points.map((point) => point[item.key]),
          xScale,
          yScale
        )}" fill="none" stroke="${item.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`
    )
    .join("");
  const markers = series
    .map((item) =>
      points
        .map((point, index) => {
          const x = 56 + index * xScale;
          const y = 196 - point[item.key] * yScale;
          return `<circle cx="${x}" cy="${y}" r="4" fill="${item.color}" />`;
        })
        .join("")
    )
    .join("");
  const highLabel =
    maxValue >= 20 ? Math.round(maxValue).toString() : maxValue.toFixed(1);

  chartElement.innerHTML = `
    <rect x="0" y="0" width="640" height="240" rx="16" fill="#fffaf1"></rect>
    ${gridLines}
    <line x1="56" y1="196" x2="576" y2="196" stroke="#bcae97" stroke-width="1.5" />
    <line x1="56" y1="36" x2="56" y2="196" stroke="#bcae97" stroke-width="1.5" />
    ${paths}
    ${markers}
    ${axisLabels}
    <text x="18" y="40" font-size="11" fill="#6d6458">${highLabel}</text>
    <text x="28" y="196" font-size="11" fill="#6d6458">0</text>
  `;
}

function syncModeUI() {
  const traderMode = state.mode === "trader";
  policyForm.hidden = traderMode;
  traderForm.hidden = !traderMode;
  modeSelect.disabled = dailyChallengeEnabled;
  countrySelect.disabled = dailyChallengeEnabled;
  dailyChallengeToggle.setAttribute("aria-pressed", String(dailyChallengeEnabled));
  dailyChallengeToggle.textContent = dailyChallengeEnabled ? "On" : "Off";
  dailyChallengeToggle.classList.toggle("active", dailyChallengeEnabled);
  controlsEyebrow.textContent = traderMode ? "Trading" : "Decisions";
  controlsTitle.textContent = traderMode
    ? "Pick your trades for the next year"
    : "Set policy for the next year";
  traderHintElement.textContent = traderMode
    ? "Run the macro book: pick a bond view, pick an FX view, and let the world move."
    : traderHintElement.textContent;
}

function render() {
  const chartPoints = [
    {
      gdp: state.initialGdp,
      debt: state.initialDebt,
      inflation: state.initialInflation,
      unemployment: state.initialUnemployment
    },
    ...state.history.map((entry) => ({
      gdp: entry.nextGdp,
      debt: entry.nextDebt,
      inflation: entry.inflation,
      unemployment: entry.unemployment
    }))
  ];

  renderStats();
  renderChart(
    macroChartElement,
    [
      { key: "gdp", color: "#29594f" },
      { key: "debt", color: "#9a4d2f" }
    ],
    chartPoints
  );
  renderChart(
    socialChartElement,
    [
      { key: "inflation", color: "#3f6db1" },
      { key: "unemployment", color: "#8f6bb3" }
    ],
    chartPoints
  );
  renderHistory();
  renderAnalysis();
  syncModeUI();
  statusElement.textContent = getSummaryMessage(state);
  modeSelect.value = state.mode;
  countrySelect.value = state.countryId;
  modeSummaryElement.textContent = GAME_MODES[state.mode].summary;
  countrySummaryElement.textContent = state.countrySummary;
  const challenge = getDailyChallenge(todayKey);
  challengeSummaryElement.textContent = dailyChallengeEnabled
    ? `${challenge.title}: ${challenge.summary}`
    : `Daily challenge refreshes each day with one fixed country, variant, and opening setup for everyone.`;
  const finished = state.status === "finished";
  advanceButton.disabled = finished;
  tradeButton.disabled = finished;
  Object.values(policyFields).forEach((field) => {
    field.disabled = finished;
  });
  Object.values(tradeFields).forEach((field) => {
    field.disabled = finished;
  });
}

function resetState() {
  state = createInitialState(countrySelect.value, modeSelect.value, {
    dailyChallenge: dailyChallengeEnabled,
    challengeDate: todayKey
  });
  applyPolicyDefaults();
  resetTradeDefaults();
  syncPolicyOutputs();
  render();
}

Object.values(policyFields).forEach((field) => {
  field.addEventListener("input", syncPolicyOutputs);
});

policyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state = applyPolicy(state, getPolicyFromForm());
  render();
  const latestEntry = state.history.at(-1);
  if (latestEntry) {
    playTurnOverlay(latestEntry);
  }
});

traderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state = applyTrade(state, getTradeFromForm());
  render();
  const latestEntry = state.history.at(-1);
  if (latestEntry) {
    playTurnOverlay(latestEntry);
  }
});

restartButton.addEventListener("click", resetState);
traderRestartButton.addEventListener("click", resetState);
modeSelect.addEventListener("change", resetState);
countrySelect.addEventListener("change", resetState);
dailyChallengeToggle.addEventListener("click", () => {
  dailyChallengeEnabled = !dailyChallengeEnabled;
  resetState();
  playOpeningOverlay();
});
skipOpeningButton.addEventListener("click", dismissOpeningOverlay);
navItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    if (item.dataset.view === "leaderboard-page") {
      return;
    }
    event.preventDefault();
    navigateTo(item.dataset.target);
  });
});
openLeaderboardButton.addEventListener("click", () => {
  window.location.href = "./leaderboard/";
});

populateModeSelect();
populateCountrySelect();
applyPolicyDefaults();
resetTradeDefaults();
syncPolicyOutputs();
setActiveNav("home", "play-panel");
render();
playOpeningOverlay();
initializeSupabase();
