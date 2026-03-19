export const TERM_LENGTH = 8;
export const ELECTION_YEARS = [4, 8];
export const DEFAULT_COUNTRY_ID = "brazil";
export const DEFAULT_MODE = "president";
export const DEFAULT_CHALLENGE_DATE = "2026-01-01";

export const GAME_MODES = {
  president: {
    id: "president",
    name: "Politician",
    summary:
      "Take control of one economy, set policy yourself, and try to run the country well over a full term."
  },
  trader: {
    id: "trader",
    name: "Trader",
    summary:
      "Run a macro hedge fund and try to make money trading bonds and FX as economies evolve around you."
  }
};

export const COUNTRY_PRESETS = {
  brazil: {
    id: "brazil",
    name: "Brazil",
    summary:
      "Commodity strength helps growth, but inflation and fiscal credibility need careful handling.",
    gdp: 100,
    debt: 78,
    inflation: 4.8,
    unemployment: 7.9,
    approval: 54,
    bondYield: 6.6,
    policyDefaults: {
      taxRate: 24,
      spendingRate: 23,
      borrowingRate: 4
    },
    modifiers: {
      growthBias: 0.4,
      inflationBias: 0.45,
      debtDragOffset: 8,
      shockSensitivity: 1.1,
      approvalResilience: -0.2
    }
  },
  indonesia: {
    id: "indonesia",
    name: "Indonesia",
    summary:
      "A younger, faster-growing economy with solid momentum, but subsidy and price pressures can build quickly.",
    gdp: 100,
    debt: 42,
    inflation: 3.1,
    unemployment: 5.3,
    approval: 58,
    bondYield: 4.8,
    policyDefaults: {
      taxRate: 20,
      spendingRate: 21,
      borrowingRate: 3
    },
    modifiers: {
      growthBias: 0.75,
      inflationBias: 0.15,
      debtDragOffset: 18,
      shockSensitivity: 0.9,
      approvalResilience: 0.5
    }
  },
  serbia: {
    id: "serbia",
    name: "Serbia",
    summary:
      "A smaller open economy that can grow quickly, but external shocks and inflation swings hit hard.",
    gdp: 100,
    debt: 56,
    inflation: 5.6,
    unemployment: 8.7,
    approval: 52,
    bondYield: 5.7,
    policyDefaults: {
      taxRate: 21,
      spendingRate: 22,
      borrowingRate: 3
    },
    modifiers: {
      growthBias: 0.2,
      inflationBias: 0.55,
      debtDragOffset: 4,
      shockSensitivity: 1.25,
      approvalResilience: -0.4
    }
  },
  china: {
    id: "china",
    name: "China",
    summary:
      "Large-scale investment can support output, but leverage and a weaker property cycle make debt risks more visible.",
    gdp: 100,
    debt: 92,
    inflation: 1.4,
    unemployment: 5.1,
    approval: 60,
    bondYield: 3.4,
    policyDefaults: {
      taxRate: 19,
      spendingRate: 24,
      borrowingRate: 5
    },
    modifiers: {
      growthBias: 0.55,
      inflationBias: -0.2,
      debtDragOffset: -10,
      shockSensitivity: 0.95,
      approvalResilience: 0.2
    }
  }
};

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

export const DAILY_CHALLENGE_SCENARIOS = [
  {
    id: "brazil-inflation-firefight",
    title: "Brazil Inflation Firefight",
    summary:
      "Growth is still alive, but inflation and yields are running hot. Can you stabilize the situation before voters lose patience?",
    countryId: "brazil",
    mode: "president",
    overrides: {
      debt: 86,
      inflation: 6.4,
      unemployment: 7.1,
      approval: 49,
      bondYield: 7.4
    }
  },
  {
    id: "indonesia-growth-sprint",
    title: "Indonesia Growth Sprint",
    summary:
      "Momentum is strong and markets are calm. Push for a standout term without letting overheating undo the run.",
    countryId: "indonesia",
    mode: "president",
    overrides: {
      debt: 39,
      inflation: 2.8,
      unemployment: 4.8,
      approval: 63,
      bondYield: 4.2
    }
  },
  {
    id: "serbia-currency-watch",
    title: "Serbia Currency Watch",
    summary:
      "The market is nervous and external shocks are coming. Trade bonds and FX through a volatile stretch and stay alive.",
    countryId: "serbia",
    mode: "trader",
    overrides: {
      debt: 61,
      inflation: 6.2,
      unemployment: 8.3,
      approval: 50,
      bondYield: 6.4
    }
  },
  {
    id: "china-bond-turn",
    title: "China Bond Turn",
    summary:
      "Growth has slowed, leverage is heavy, and markets are waiting for the next move. Read the rates and FX path better than the crowd.",
    countryId: "china",
    mode: "trader",
    overrides: {
      debt: 101,
      inflation: 1.2,
      unemployment: 5.5,
      approval: 57,
      bondYield: 3.9
    }
  }
];

const DEFAULT_MODIFIERS = {
  growthBias: 0,
  inflationBias: 0,
  debtDragOffset: 0,
  shockSensitivity: 1,
  approvalResilience: 0
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createBaseState(countryId, mode) {
  const preset = COUNTRY_PRESETS[countryId] ?? COUNTRY_PRESETS[DEFAULT_COUNTRY_ID];

  return {
    mode,
    countryId: preset.id,
    countryName: preset.name,
    countrySummary: preset.summary,
    year: 1,
    termLength: TERM_LENGTH,
    initialGdp: preset.gdp,
    initialDebt: preset.debt,
    initialInflation: preset.inflation,
    initialUnemployment: preset.unemployment,
    gdp: preset.gdp,
    debt: preset.debt,
    inflation: preset.inflation,
    unemployment: preset.unemployment,
    approval: preset.approval,
    bondYield: preset.bondYield,
    policyDefaults: { ...preset.policyDefaults },
    modifiers: { ...preset.modifiers },
    history: [],
    lastGrowth: 0,
    status: "running"
  };
}

function applyStateOverrides(state, overrides = {}) {
  return {
    ...state,
    ...overrides,
    initialGdp: overrides.gdp ?? state.initialGdp,
    initialDebt: overrides.debt ?? state.initialDebt,
    initialInflation: overrides.inflation ?? state.initialInflation,
    initialUnemployment: overrides.unemployment ?? state.initialUnemployment
  };
}

function hashDateKey(dateKey) {
  return dateKey.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

export function getDailyChallenge(dateKey = DEFAULT_CHALLENGE_DATE) {
  const index = hashDateKey(dateKey) % DAILY_CHALLENGE_SCENARIOS.length;
  const scenario = DAILY_CHALLENGE_SCENARIOS[index];

  return {
    ...scenario,
    dateKey
  };
}

export function createInitialState(
  countryId = DEFAULT_COUNTRY_ID,
  mode = DEFAULT_MODE,
  options = {}
) {
  const useDailyChallenge = options.dailyChallenge ?? false;
  const challengeDate = options.challengeDate ?? DEFAULT_CHALLENGE_DATE;
  const challenge = useDailyChallenge ? getDailyChallenge(challengeDate) : null;
  const resolvedCountryId = challenge?.countryId ?? countryId;
  const resolvedMode = challenge?.mode ?? mode;
  const baseState = createBaseState(resolvedCountryId, resolvedMode);
  const challengeState = challenge
    ? applyStateOverrides(baseState, challenge.overrides)
    : baseState;

  if (resolvedMode === "trader") {
    return {
      ...challengeState,
      electionResult: null,
      portfolioValue: 100,
      lastPnl: 0,
      bestTrade: 0,
      winStreak: 0,
      dailyChallenge: useDailyChallenge,
      challenge
    };
  }

  return {
    ...challengeState,
    electionResult: null,
    dailyChallenge: useDailyChallenge,
    challenge
  };
}

export function isOppositeDirection(currentDirection, nextDirection) {
  return (
    (currentDirection === "up" && nextDirection === "down") ||
    (currentDirection === "down" && nextDirection === "up") ||
    (currentDirection === "left" && nextDirection === "right") ||
    (currentDirection === "right" && nextDirection === "left")
  );
}

export function calculateYearOutcome(state, policy) {
  const taxRate = Number(policy.taxRate);
  const spendingRate = Number(policy.spendingRate);
  const borrowingRate = Number(policy.borrowingRate);
  const shock = YEARLY_SHOCKS[state.year] ?? null;
  const modifiers = state.modifiers ?? DEFAULT_MODIFIERS;
  const shockScale = modifiers.shockSensitivity ?? 1;
  const shockGrowthEffect = (shock?.growthEffect ?? 0) * shockScale;
  const shockInflationEffect = (shock?.inflationEffect ?? 0) * shockScale;
  const shockApprovalEffect = (shock?.approvalEffect ?? 0) * shockScale;
  const shockDebtEffect = (shock?.debtEffect ?? 0) * shockScale;
  const shockUnemploymentEffect =
    (shock?.unemploymentEffect ?? 0) * shockScale;

  const fiscalImpulse = (spendingRate - 20) * 0.18 + borrowingRate * 0.22;
  const taxDrag = (taxRate - 20) * 0.16;
  const debtRatio = (state.debt / state.gdp) * 100;
  const debtDrag =
    Math.max(0, debtRatio - (85 + (modifiers.debtDragOffset ?? 0))) * 0.035;
  const overheating = Math.max(0, spendingRate + borrowingRate - 30) * 0.08;
  const bondStress =
    Math.max(0, debtRatio - 80) * 0.03 +
    Math.max(0, borrowingRate - 6) * 0.12;
  const baseYield =
    3 +
    bondStress +
    Math.max(0, state.inflation - 2.5) * 0.18 +
    (state.bondYield - 4) * 0.15;
  const bondYield = clamp(baseYield + shockDebtEffect * 0.08, 2, 11);

  const growth = clamp(
    2.2 +
      (modifiers.growthBias ?? 0) +
      fiscalImpulse -
      taxDrag -
      debtDrag -
      overheating -
      bondStress -
      Math.max(0, bondYield - 6) * 0.18 +
      shockGrowthEffect,
    -4.5,
    7.5
  );
  const inflation = clamp(
    state.inflation +
      (modifiers.inflationBias ?? 0) +
      overheating * 0.55 -
      taxDrag * 0.04 +
      shockInflationEffect,
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
      state.debt + spending + borrowing + debtServiceCost - revenue + shockDebtEffect
    ).toFixed(2)
  );
  const unemployment = clamp(
    state.unemployment -
      growth * 0.28 +
      Math.max(0, bondYield - 6) * 0.12 +
      shockUnemploymentEffect,
    2.5,
    14
  );
  const approval = clamp(
    state.approval +
      growth * 1.4 -
      Math.max(0, inflation - 3) * 1.1 -
      Math.max(0, unemployment - 6) * 0.9 -
      Math.max(0, debtRatio - 95) * 0.08 +
      (modifiers.approvalResilience ?? 0) +
      shockApprovalEffect,
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
  if (state.status === "finished" || state.mode !== "president") {
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

function createAutopilotPolicy(state) {
  const shock = YEARLY_SHOCKS[state.year] ?? null;
  const cycle = ((state.year + state.countryId.length) % 4) - 1.5;
  const debtRatio = (state.debt / state.gdp) * 100;

  const taxRate = clamp(
    state.policyDefaults.taxRate + cycle * 1.4 + (state.inflation > 5 ? 1.2 : 0),
    10,
    45
  );
  const spendingRate = clamp(
    state.policyDefaults.spendingRate +
      (shock?.growthEffect ?? 0) * -0.9 +
      (state.approval < 50 ? 1.3 : 0),
    10,
    35
  );
  const borrowingRate = clamp(
    state.policyDefaults.borrowingRate +
      (shock?.growthEffect ?? 0) * -0.7 -
      Math.max(0, debtRatio - 90) * 0.03,
    0,
    12
  );

  return {
    taxRate: Number(taxRate.toFixed(1)),
    spendingRate: Number(spendingRate.toFixed(1)),
    borrowingRate: Number(borrowingRate.toFixed(1))
  };
}

function positionMultiplier(position) {
  if (position === "long") {
    return 1;
  }

  if (position === "short") {
    return -1;
  }

  return 0;
}

export function calculateTradeOutcome(state, trade) {
  const autopilotPolicy = createAutopilotPolicy(state);
  const macro = calculateYearOutcome(state, autopilotPolicy);
  const debtRatio = (macro.nextDebt / macro.nextGdp) * 100;
  const shockBonus = macro.shock ? 0.8 : 0;
  const bondMove = clamp(
    (state.bondYield - macro.bondYield) * 2.4 +
      macro.growth * 0.25 -
      Math.max(0, macro.inflation - 4) * 0.7 +
      shockBonus,
    -12,
    12
  );
  const currencyMove = clamp(
    macro.growth * 0.95 -
      Math.max(0, macro.inflation - 4) * 1.15 -
      Math.max(0, debtRatio - 90) * 0.07 +
      (macro.approval - 50) * 0.06,
    -12,
    12
  );

  const bondExposure = positionMultiplier(trade.bondPosition);
  const currencyExposure = positionMultiplier(trade.currencyPosition);
  const bondPnlPercent = bondExposure * bondMove * 0.95;
  const currencyPnlPercent = currencyExposure * currencyMove * 0.85;
  const comboBonus =
    bondExposure !== 0 &&
    currencyExposure !== 0 &&
    Math.sign(bondPnlPercent) > 0 &&
    Math.sign(currencyPnlPercent) > 0
      ? 1.4
      : 0;
  const pnlPercent = clamp(
    bondPnlPercent + currencyPnlPercent + comboBonus,
    -18,
    18
  );
  const pnlAmount = Number(
    ((state.portfolioValue * pnlPercent) / 100).toFixed(2)
  );
  const nextPortfolioValue = Number(
    (state.portfolioValue + pnlAmount).toFixed(2)
  );

  let headline = "Markets drifted without a clear theme.";
  const strongestMove =
    Math.abs(bondMove) >= Math.abs(currencyMove) ? "bond" : "currency";

  if (macro.shock) {
    headline = `${macro.shock} hit the tape and traders had to react fast.`;
  } else if (strongestMove === "bond" && Math.abs(bondMove) > 4) {
    headline =
      bondMove > 0
        ? "A bond rally took over the market."
        : "Bonds sold off hard as yields jumped.";
  } else if (strongestMove === "currency" && Math.abs(currencyMove) > 4) {
    headline =
      currencyMove > 0
        ? "The currency caught a strong bid."
        : "The currency weakened sharply against the dollar.";
  }

  const note =
    pnlAmount > 0
      ? comboBonus > 0
        ? "Both trades worked and the combo bonus kicked in."
        : "Your call was on the right side of the move."
      : pnlAmount < 0
        ? "The market moved against you this year."
        : "You survived the year flat.";

  return {
    autopilotPolicy,
    ...macro,
    bondMove: Number(bondMove.toFixed(2)),
    currencyMove: Number(currencyMove.toFixed(2)),
    bondPosition: trade.bondPosition,
    currencyPosition: trade.currencyPosition,
    pnlPercent: Number(pnlPercent.toFixed(2)),
    pnlAmount,
    nextPortfolioValue,
    comboBonus: Number(comboBonus.toFixed(2)),
    headline,
    note
  };
}

export function applyTrade(state, trade) {
  if (state.status === "finished" || state.mode !== "trader") {
    return state;
  }

  const outcome = calculateTradeOutcome(state, trade);
  const nextYear = state.year + 1;
  const historyEntry = {
    year: state.year,
    ...outcome
  };
  const history = [...state.history, historyEntry];
  const finished = nextYear > state.termLength;

  return {
    ...state,
    year: finished ? state.year : nextYear,
    gdp: outcome.nextGdp,
    debt: outcome.nextDebt,
    inflation: outcome.inflation,
    unemployment: outcome.unemployment,
    approval: outcome.approval,
    bondYield: outcome.bondYield,
    lastGrowth: outcome.growth,
    history,
    portfolioValue: outcome.nextPortfolioValue,
    lastPnl: outcome.pnlAmount,
    bestTrade: Math.max(state.bestTrade, outcome.pnlAmount),
    winStreak: outcome.pnlAmount > 0 ? state.winStreak + 1 : 0,
    status: finished ? "finished" : "running"
  };
}

export function getScore(state) {
  if (state.mode === "trader") {
    return Number((state.portfolioValue - 100).toFixed(2));
  }

  return Number((state.gdp - state.initialGdp).toFixed(2));
}

export function getRunAnalysis(state) {
  if (state.history.length === 0) {
    return [
      {
        label: "Opening",
        value: "No turns yet",
        note: "Play a run to unlock best year, turning point, and risk readouts."
      }
    ];
  }

  if (state.mode === "trader") {
    const bestYear = state.history.reduce((best, entry) =>
      entry.pnlAmount > best.pnlAmount ? entry : best
    );
    const worstYear = state.history.reduce((worst, entry) =>
      entry.pnlAmount < worst.pnlAmount ? entry : worst
    );
    const turningPoint = state.history.reduce((largest, entry) =>
      Math.abs(entry.pnlAmount) > Math.abs(largest.pnlAmount) ? entry : largest
    );

    return [
      {
        label: "Best trade",
        value: `Year ${bestYear.year}: ${bestYear.pnlAmount >= 0 ? "+" : ""}${bestYear.pnlAmount.toFixed(2)}`,
        note: bestYear.headline
      },
      {
        label: "Worst hit",
        value: `Year ${worstYear.year}: ${worstYear.pnlAmount >= 0 ? "+" : ""}${worstYear.pnlAmount.toFixed(2)}`,
        note: worstYear.note
      },
      {
        label: "Turning point",
        value: `Year ${turningPoint.year}`,
        note: `The biggest swing came from ${turningPoint.bondPosition} bonds and ${turningPoint.currencyPosition} currency.`
      },
      {
        label: "Read",
        value: state.winStreak >= 2 ? "Momentum trader" : "Volatile tape",
        note:
          state.bestTrade > 6
            ? "You found at least one big macro call."
            : "A steadier edge would help the score compound."
      }
    ];
  }

  const bestYear = state.history.reduce((best, entry) =>
    entry.growth > best.growth ? entry : best
  );
  const worstYear = state.history.reduce((worst, entry) =>
    entry.growth < worst.growth ? entry : worst
  );
  const turningPoint = state.history.reduce((largest, entry) =>
    Math.abs(entry.growth) > Math.abs(largest.growth) ? entry : largest
  );
  const maxDebtRatio = state.history.reduce(
    (highest, entry) => Math.max(highest, (entry.nextDebt / entry.nextGdp) * 100),
    (state.initialDebt / state.initialGdp) * 100
  );

  return [
    {
      label: "Best year",
      value: `Year ${bestYear.year}: ${bestYear.growth.toFixed(1)}% growth`,
      note: bestYear.note
    },
    {
      label: "Worst year",
      value: `Year ${worstYear.year}: ${worstYear.growth.toFixed(1)}% growth`,
      note: worstYear.note
    },
    {
      label: "Turning point",
      value: `Year ${turningPoint.year}`,
      note: `This was the biggest swing in the run at ${turningPoint.growth.toFixed(1)}% growth.`
    },
    {
      label: "Risk check",
      value: `${maxDebtRatio.toFixed(1)}% max debt / GDP`,
      note:
        maxDebtRatio > 100
          ? "Markets were pushed into a real debt scare."
          : "Debt stayed within a manageable range."
    }
  ];
}

export function getSummaryMessage(state) {
  if (state.dailyChallenge && state.challenge) {
    const prefix = `Daily Challenge: ${state.challenge.title}.`;

    if (state.status === "finished") {
      return `${prefix} Run complete.`;
    }

    return `${prefix} ${state.mode === "trader" ? "Trade the daily setup." : "Beat the daily setup."}`;
  }

  if (state.mode === "trader") {
    if (state.status === "finished") {
      const score = getScore(state);

      if (score >= 30) {
        return "Term complete. You traded the macro swings brilliantly.";
      }
      if (score >= 10) {
        return "Term complete. You booked a solid run in the market.";
      }
      if (score > 0) {
        return "Term complete. You finished in the black.";
      }

      return "Term complete. The market was a tough opponent this time.";
    }

    return `Year ${state.year} of ${state.termLength}. Read the macro setup and pick your bond and FX trades.`;
  }

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
