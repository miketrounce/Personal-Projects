export const TERM_LENGTH = 8;
export const ELECTION_YEARS = [4, 8];

export const YEARLY_SHOCKS = {
  2: {
    title: "Export slowdown",
    growthEffect: -0.9,
    inflationEffect: 0.2,
    approvalEffect: -2.5,
    debtEffect: 0,
    unemploymentEffect: 0.6,
    note: "External demand softened and exporters lost momentum."
  },
  4: {
    title: "Energy price spike",
    growthEffect: -0.6,
    inflationEffect: 1.1,
    approvalEffect: -3,
    debtEffect: 0,
    unemploymentEffect: 0.4,
    note: "Higher energy costs squeezed households and firms."
  },
  6: {
    title: "Productivity jump",
    growthEffect: 1,
    inflationEffect: -0.2,
    approvalEffect: 2,
    debtEffect: -1.2,
    unemploymentEffect: -0.5,
    note: "A productivity rebound lifted output across the economy."
  },
  7: {
    title: "Risk-off bond markets",
    growthEffect: -0.7,
    inflationEffect: 0,
    approvalEffect: -2,
    debtEffect: 2.5,
    unemploymentEffect: 0.3,
    note: "Global investors demanded higher yields for new borrowing."
  }
};

export function createInitialState() {
  return {
    year: 1,
    termLength: TERM_LENGTH,
    gdp: 100,
    debt: 62,
    inflation: 2.1,
    unemployment: 5.4,
    approval: 55,
    bondYield: 3.1,
    electionResult: null,
    lastGrowth: 0,
    history: [],
    status: "running"
  };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function calculateYearOutcome(state, policy) {
  const taxRate = Number(policy.taxRate);
  const spendingRate = Number(policy.spendingRate);
  const borrowingRate = Number(policy.borrowingRate);
  const shock = YEARLY_SHOCKS[state.year] ?? null;

  const fiscalImpulse = (spendingRate - 20) * 0.18 + borrowingRate * 0.22;
  const taxDrag = (taxRate - 20) * 0.16;
  const debtRatio = (state.debt / state.gdp) * 100;
  const debtDrag = Math.max(0, debtRatio - 85) * 0.035;
  const overheating = Math.max(0, spendingRate + borrowingRate - 30) * 0.08;
  const bondStress = Math.max(0, debtRatio - 80) * 0.03 + Math.max(0, borrowingRate - 6) * 0.12;
  const baseYield = 3 + bondStress + Math.max(0, state.inflation - 2.5) * 0.18;
  const bondYield = clamp(baseYield + (shock?.debtEffect ?? 0) * 0.08, 2, 11);

  const growth = clamp(
    2.2 +
      fiscalImpulse -
      taxDrag -
      debtDrag -
      overheating -
      bondStress -
      Math.max(0, bondYield - 6) * 0.18 +
      (shock?.growthEffect ?? 0),
    -4.5,
    7.5
  );
  const inflation = clamp(
    state.inflation + overheating * 0.55 - taxDrag * 0.04 + (shock?.inflationEffect ?? 0),
    0.5,
    9.5
  );
  const nextGdp = Number((state.gdp * (1 + growth / 100)).toFixed(2));
  const revenue = nextGdp * (taxRate / 100);
  const spending = nextGdp * (spendingRate / 100);
  const borrowing = nextGdp * (borrowingRate / 100);
  const debtServiceCost = state.debt * (bondYield / 100) * 0.18;
  const nextDebt = Number(
    Math.max(
      0,
      state.debt + spending + borrowing + debtServiceCost - revenue + (shock?.debtEffect ?? 0)
    ).toFixed(2)
  );
  const unemployment = clamp(
    state.unemployment - growth * 0.28 + Math.max(0, bondYield - 6) * 0.12 + (shock?.unemploymentEffect ?? 0),
    2.5,
    14
  );
  const approval = clamp(
    state.approval +
      growth * 1.4 -
      Math.max(0, inflation - 3) * 1.1 -
      Math.max(0, unemployment - 6) * 0.9 -
      Math.max(0, debtRatio - 95) * 0.08 +
      (shock?.approvalEffect ?? 0),
    20,
    80
  );

  let note = "Steady expansion.";
  if (growth >= 4.5) {
    note = "Strong boom, but watch inflation pressure.";
  } else if (growth < 0) {
    note = "The economy slipped into contraction.";
  } else if (debtRatio > 100) {
    note = "Bond markets are starting to worry about debt.";
  }
  if (shock) {
    note = `${shock.title}: ${shock.note}`;
  }

  return {
    taxRate,
    spendingRate,
    borrowingRate,
    growth: Number(growth.toFixed(2)),
    inflation: Number(inflation.toFixed(2)),
    unemployment: Number(unemployment.toFixed(2)),
    bondYield: Number(bondYield.toFixed(2)),
    nextGdp,
    nextDebt,
    approval: Number(approval.toFixed(1)),
    shock: shock ? shock.title : null,
    note
  };
}

export function applyPolicy(state, policy) {
  if (state.status === "finished") {
    return state;
  }

  const outcome = calculateYearOutcome(state, policy);
  const nextYear = state.year + 1;
  const historyEntry = {
    year: state.year,
    ...outcome
  };
  const history = [...state.history, historyEntry];
  const finished = nextYear > state.termLength;
  const electionTriggered = ELECTION_YEARS.includes(state.year);
  const electionResult = electionTriggered
    ? outcome.approval >= 50
      ? "won"
      : "lost"
    : null;
  const defeated = electionResult === "lost" && state.year < state.termLength;

  return {
    ...state,
    year: finished || defeated ? state.year : nextYear,
    gdp: outcome.nextGdp,
    debt: outcome.nextDebt,
    inflation: outcome.inflation,
    unemployment: outcome.unemployment,
    approval: outcome.approval,
    bondYield: outcome.bondYield,
    electionResult,
    lastGrowth: outcome.growth,
    history,
    status: finished || defeated ? "finished" : "running"
  };
}

export function getScore(state) {
  return Number((state.gdp - 100).toFixed(2));
}

export function getSummaryMessage(state) {
  if (state.electionResult === "lost") {
    return "Election lost. Voters turned against your economic plan.";
  }

  if (state.electionResult === "won" && ELECTION_YEARS.includes(state.year)) {
    return "Election won. You kept your mandate for another term segment.";
  }

  if (state.status === "finished") {
    const score = getScore(state);
    if (score >= 20) {
      return "Term complete. You delivered strong GDP growth.";
    }
    if (score >= 8) {
      return "Term complete. Growth was solid, with some trade-offs.";
    }
    return "Term complete. GDP growth was modest.";
  }

  return `Year ${state.year} of ${state.termLength}. Try to balance growth, inflation, and debt.`;
}
