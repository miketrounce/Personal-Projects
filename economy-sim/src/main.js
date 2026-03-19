import {
  applyPolicy,
  createInitialState,
  getScore,
  getSummaryMessage
} from "./economy.js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js";

const statsElement = document.querySelector("#stats");
const statusElement = document.querySelector("#status");
const historyElement = document.querySelector("#history");
const macroChartElement = document.querySelector("#macro-chart");
const socialChartElement = document.querySelector("#social-chart");
const leaderboardElement = document.querySelector("#leaderboard");
const leaderboardStatusElement = document.querySelector("#leaderboard-status");
const form = document.querySelector("#policy-form");
const submitForm = document.querySelector("#submit-form");
const submitButton = document.querySelector("#submit-button");
const submitStatusElement = document.querySelector("#submit-status");
const playerNameInput = document.querySelector("#player-name");
const restartButton = document.querySelector("#restart-button");
const advanceButton = document.querySelector("#advance-button");

const fields = {
  taxRate: document.querySelector("#tax-rate"),
  spendingRate: document.querySelector("#spending-rate"),
  borrowingRate: document.querySelector("#borrowing-rate")
};

const outputs = {
  taxRate: document.querySelector("#tax-output"),
  spendingRate: document.querySelector("#spending-output"),
  borrowingRate: document.querySelector("#borrowing-output")
};

let state = createInitialState();
let supabase = null;
let leaderboardEnabled = false;

function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
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
    leaderboardElement.innerHTML = "<li>Leaderboard unavailable.</li>";
    return;
  }

  leaderboardStatusElement.textContent = "Loading latest scores...";
  const { data, error } = await supabase
    .from("economy_sim_scores")
    .select("player_name, score, gdp, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    leaderboardStatusElement.textContent = "Could not load leaderboard.";
    leaderboardElement.innerHTML = `<li>${error.message}</li>`;
    return;
  }

  leaderboardStatusElement.textContent = "Top 10 GDP gains across all players.";
  leaderboardElement.innerHTML =
    data.length === 0
      ? "<li>No scores yet. Be the first to submit one.</li>"
      : data
          .map(
            (entry, index) =>
              `<li><strong>#${index + 1} ${entry.player_name}</strong> scored ${Number(
                entry.score
              ).toFixed(1)} GDP points and finished at GDP ${Number(entry.gdp).toFixed(1)}.</li>`
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

function syncOutputs() {
  outputs.taxRate.textContent = `${fields.taxRate.value}%`;
  outputs.spendingRate.textContent = `${fields.spendingRate.value}%`;
  outputs.borrowingRate.textContent = `${fields.borrowingRate.value}%`;
}

function getPolicyFromForm() {
  return {
    taxRate: Number(fields.taxRate.value),
    spendingRate: Number(fields.spendingRate.value),
    borrowingRate: Number(fields.borrowingRate.value)
  };
}

function renderStats() {
  const debtRatio = ((state.debt / state.gdp) * 100).toFixed(1);
  const stats = [
    ["Year", `${state.year} / ${state.termLength}`],
    ["GDP", state.gdp.toFixed(1)],
    ["Debt", state.debt.toFixed(1)],
    ["Debt / GDP", `${debtRatio}%`],
    ["Inflation", formatPercent(state.inflation)],
    ["Unemployment", formatPercent(state.unemployment)],
    ["Bond yield", formatPercent(state.bondYield)],
    ["Approval", formatPercent(state.approval)],
    ["Last growth", formatPercent(state.lastGrowth)],
    ["GDP gained", state.status === "finished" ? getScore(state).toFixed(1) : `${getScore(state).toFixed(1)} so far`]
  ];

  statsElement.innerHTML = stats
    .map(
      ([label, value]) =>
        `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`
    )
    .join("");
}

function renderHistory() {
  if (state.history.length === 0) {
    historyElement.innerHTML = "<li>No policy decisions yet. Set your first budget.</li>";
    return;
  }

  historyElement.innerHTML = state.history
    .map((entry) => {
      const warningClass =
        entry.nextDebt / entry.nextGdp > 1 ? "warning" : "";

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
  const basePoints = points;

  const maxValue = Math.max(
    ...basePoints.flatMap((point) => series.map((item) => point[item.key])),
    1
  );
  const xScale = basePoints.length > 1 ? 520 / (basePoints.length - 1) : 0;
  const yScale = 160 / maxValue;
  const axisLabels = basePoints
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
          basePoints.map((point) => point[item.key]),
          xScale,
          yScale
        )}" fill="none" stroke="${item.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`
    )
    .join("");
  const markers = series
    .map((item) =>
      basePoints
        .map((point, index) => {
          const x = 56 + index * xScale;
          const y = 196 - point[item.key] * yScale;
          return `<circle cx="${x}" cy="${y}" r="4" fill="${item.color}" />`;
        })
        .join("")
    )
    .join("");

  const highLabel = maxValue >= 20 ? Math.round(maxValue).toString() : maxValue.toFixed(1);

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

function render() {
  const chartPoints = [
    {
      gdp: 100,
      debt: 62,
      inflation: 2.1,
      unemployment: 5.4
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
  statusElement.textContent = getSummaryMessage(state);
  const disabled = state.status === "finished";
  advanceButton.disabled = disabled;
  Object.values(fields).forEach((field) => {
    field.disabled = disabled;
  });
  if (leaderboardEnabled) {
    submitButton.disabled = state.status !== "finished";
    if (state.status === "finished") {
      submitStatusElement.textContent = "Run finished. Enter your name to submit.";
    }
  }
}

Object.values(fields).forEach((field) => {
  field.addEventListener("input", syncOutputs);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  state = applyPolicy(state, getPolicyFromForm());
  render();
});

submitForm.addEventListener("submit", submitScore);

restartButton.addEventListener("click", () => {
  state = createInitialState();
  syncOutputs();
  render();
});

syncOutputs();
render();
initializeSupabase();
