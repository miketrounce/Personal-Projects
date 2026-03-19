import {
  applyPolicy,
  createInitialState,
  getScore,
  getSummaryMessage
} from "./economy.js";

const statsElement = document.querySelector("#stats");
const statusElement = document.querySelector("#status");
const historyElement = document.querySelector("#history");
const form = document.querySelector("#policy-form");
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

function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
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

function render() {
  renderStats();
  renderHistory();
  statusElement.textContent = getSummaryMessage(state);
  const disabled = state.status === "finished";
  advanceButton.disabled = disabled;
  Object.values(fields).forEach((field) => {
    field.disabled = disabled;
  });
}

Object.values(fields).forEach((field) => {
  field.addEventListener("input", syncOutputs);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  state = applyPolicy(state, getPolicyFromForm());
  render();
});

restartButton.addEventListener("click", () => {
  state = createInitialState();
  syncOutputs();
  render();
});

syncOutputs();
render();
