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
} from "./economy.js?v=20260319-4";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL
} from "./supabase-config.js?v=20260319-4";

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
const appViews = document.querySelectorAll(".app-view");
const navItems = document.querySelectorAll(".nav-item");
const homeView = document.querySelector("#home-view");
const leaderboardView = document.querySelector("#leaderboard-view");
const openLeaderboardButton = document.querySelector("#open-leaderboard-button");
const leaderboardSearchInput = document.querySelector("#leaderboard-search");
const leaderboardHighlightsElement = document.querySelector("#leaderboard-highlights");
const statsElement = document.querySelector("#stats");
const statusElement = document.querySelector("#status");
const historyElement = document.querySelector("#history");
const analysisElement = document.querySelector("#analysis");
const macroChartElement = document.querySelector("#macro-chart");
const socialChartElement = document.querySelector("#social-chart");
const leaderboardElement = document.querySelector("#leaderboard");
const leaderboardStatusElement = document.querySelector("#leaderboard-status");
const policyForm = document.querySelector("#policy-form");
const traderForm = document.querySelector("#trader-form");
const submitForm = document.querySelector("#submit-form");
const submitButton = document.querySelector("#submit-button");
const submitStatusElement = document.querySelector("#submit-status");
const playerNameInput = document.querySelector("#player-name");
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
let leaderboardEnabled = false;
let dailyChallengeEnabled = false;
const todayKey = new Date().toISOString().slice(0, 10);
let openingTimer = null;
let transitionTimer = null;
let currentView = "home";
let leaderboardEntries = [];

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
      (targetId === null
        ? item.dataset.target === "hero-card" || item.dataset.target === "leaderboard-view"
        : item.dataset.target === targetId);
    item.classList.toggle("active", isActive);
  });
}

function showView(viewName) {
  currentView = viewName;
  appViews.forEach((view) => {
    const isActive = view.id === `${viewName}-view`;
    view.classList.toggle("active-view", isActive);
    view.classList.toggle("hidden-view", !isActive);
  });
}

function navigateTo(viewName, targetId = null) {
  showView(viewName);
  setActiveNav(viewName, targetId);

  if (viewName === "home" && targetId) {
    const target = document.querySelector(`#${targetId}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    leaderboardStatusElement.textContent =
      "Leaderboard is disabled until Supabase is configured.";
    submitStatusElement.textContent =
      "Add your Supabase project URL and anon key to enable score sharing.";
    submitButton.disabled = true;
    return;
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  leaderboardEnabled = true;
  submitButton.disabled = state.status !== "finished";
  await loadLeaderboard();
}

async function loadLeaderboard() {
  if (!leaderboardEnabled) {
    leaderboardElement.innerHTML =
      '<tr><td colspan="5">Leaderboard unavailable.</td></tr>';
    return;
  }

  leaderboardStatusElement.textContent = "Loading latest scores...";
  const { data, error } = await supabase
    .from("economy_sim_scores")
    .select("player_name, score, gdp, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    leaderboardStatusElement.textContent = "Could not load leaderboard.";
    leaderboardElement.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
    return;
  }

  leaderboardEntries = data;
  renderLeaderboard();
}

function formatSubmittedDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

function renderLeaderboard() {
  const query = leaderboardSearchInput.value.trim().toLowerCase();
  const filteredEntries = leaderboardEntries.filter((entry) =>
    entry.player_name.toLowerCase().includes(query)
  );

  leaderboardStatusElement.textContent =
    leaderboardEntries.length === 0
      ? "No scores yet."
      : `Last update: ${new Date().toLocaleString()}`;

  leaderboardElement.innerHTML =
    filteredEntries.length === 0
      ? '<tr><td colspan="5">No matching players yet.</td></tr>'
      : filteredEntries
          .map(
            (entry, index) => `<tr>
              <td class="rank-cell">#${index + 1}</td>
              <td class="name-cell">
                <span class="player-badge">${entry.player_name.slice(0, 1).toUpperCase()}</span>
                <span>${entry.player_name}</span>
              </td>
              <td>${Number(entry.score).toFixed(1)}</td>
              <td>${Number(entry.gdp).toFixed(1)}</td>
              <td>${formatSubmittedDate(entry.created_at)}</td>
            </tr>`
          )
          .join("");

  leaderboardHighlightsElement.innerHTML =
    leaderboardEntries.length === 0
      ? "<p class=\"tile-copy\">No top players yet.</p>"
      : leaderboardEntries
          .slice(0, 3)
          .map(
            (entry, index) => `<div class="highlight-item">
              <strong>#${index + 1} ${entry.player_name}</strong>
              <span>${Number(entry.score).toFixed(1)} pts</span>
            </div>`
          )
          .join("");
}

async function submitScore(event) {
  event.preventDefault();

  if (!leaderboardEnabled) {
    submitStatusElement.textContent =
      "Supabase is not configured yet, so score submission is disabled.";
    return;
  }

  if (state.status !== "finished") {
    submitStatusElement.textContent = "Finish a run before submitting a score.";
    return;
  }

  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    submitStatusElement.textContent = "Enter your name before submitting.";
    return;
  }

  submitStatusElement.textContent = "Submitting score...";
  submitButton.disabled = true;

  const { error } = await supabase.from("economy_sim_scores").insert({
    player_name: playerName,
    score: getScore(state),
    gdp: state.gdp,
    debt: state.debt,
    inflation: state.inflation,
    unemployment: state.unemployment,
    years_completed: state.history.length
  });

  if (error) {
    submitStatusElement.textContent = `Could not submit score: ${error.message}`;
    submitButton.disabled = false;
    return;
  }

  submitStatusElement.textContent = "Score submitted.";
  await loadLeaderboard();
  submitButton.disabled = false;
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

  if (leaderboardEnabled) {
    submitButton.disabled = !finished;
    if (finished) {
      submitStatusElement.textContent =
        "Run finished. Enter your name to submit.";
    } else {
      submitStatusElement.textContent =
        state.mode === "trader"
          ? "Finish your trading run to submit your score."
          : "Finish a run to submit your score.";
    }
  }
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

submitForm.addEventListener("submit", submitScore);
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
leaderboardSearchInput.addEventListener("input", renderLeaderboard);
navItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    navigateTo(item.dataset.view, item.dataset.target);
  });
});
openLeaderboardButton.addEventListener("click", () => {
  navigateTo("leaderboard", "leaderboard-view");
});

populateModeSelect();
populateCountrySelect();
applyPolicyDefaults();
resetTradeDefaults();
syncPolicyOutputs();
showView(currentView);
render();
playOpeningOverlay();
initializeSupabase();
