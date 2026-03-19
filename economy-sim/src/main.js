import {
  applyPolicy,
  createInitialState,
  getScore,
  getSummaryMessage
} from "./economy.js";

const statsElement = document.querySelector("#stats");
const statusElement = document.querySelector("#status");
const historyElement = document.querySelector("#history");
const chartElement = document.querySelector("#chart");
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

function buildLine(points, xScale, yScale) {
  return points
    .map((point, index) => {
      const x = 56 + index * xScale;
      const y = 196 - point * yScale;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function renderChart() {
  const series = [
    { key: "gdp", color: "#29594f", label: "GDP" },
    { key: "debt", color: "#9a4d2f", label: "Debt" },
    { key: "inflation", color: "#3f6db1", label: "Inflation" },
    { key: "unemployment", color: "#8f6bb3", label: "Unemployment" }
  ];

  const basePoints = [
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

  const maxValue = Math.max(
    ...basePoints.flatMap((point) => [
      point.gdp,
      point.debt,
      point.inflation * 10,
      point.unemployment * 10
    ]),
    100
  );
  const normalizedPoints = basePoints.map((point) => ({
    gdp: point.gdp,
    debt: point.debt,
    inflation: point.inflation * 10,
    unemployment: point.unemployment * 10
  }));

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
          normalizedPoints.map((point) => point[item.key]),
          xScale,
          yScale
        )}" fill="none" stroke="${item.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`
    )
    .join("");

  chartElement.innerHTML = `
    <rect x="0" y="0" width="640" height="240" rx="16" fill="#fffaf1"></rect>
    ${gridLines}
    <line x1="56" y1="196" x2="576" y2="196" stroke="#bcae97" stroke-width="1.5" />
    <line x1="56" y1="36" x2="56" y2="196" stroke="#bcae97" stroke-width="1.5" />
    ${paths}
    ${axisLabels}
    <text x="24" y="40" font-size="11" fill="#6d6458">High</text>
    <text x="26" y="196" font-size="11" fill="#6d6458">Low</text>
  `;
}

function render() {
  renderStats();
  renderChart();
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
