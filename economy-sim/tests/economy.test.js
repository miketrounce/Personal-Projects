import test from "node:test";
import assert from "node:assert/strict";

import {
  applyPolicy,
  applyTrade,
  calculateTradeOutcome,
  calculateYearOutcome,
  COUNTRY_PRESETS,
  createInitialState,
  getDailyChallenge,
  getRunAnalysis,
  getScore
} from "../src/economy.js";

test("country presets set different starting conditions", () => {
  const china = createInitialState("china");
  const indonesia = createInitialState("indonesia");

  assert.equal(china.countryName, "China");
  assert.equal(indonesia.countryName, "Indonesia");
  assert.notEqual(china.debt, indonesia.debt);
  assert.deepEqual(
    indonesia.policyDefaults,
    COUNTRY_PRESETS.indonesia.policyDefaults
  );
});

test("stimulus-heavy policy raises GDP in the next year", () => {
  const state = createInitialState();

  const nextState = applyPolicy(state, {
    taxRate: 18,
    spendingRate: 25,
    borrowingRate: 6
  });

  assert.ok(nextState.gdp > state.gdp);
  assert.equal(nextState.history.length, 1);
  assert.equal(nextState.year, 2);
});

test("very high taxes reduce growth", () => {
  const state = createInitialState();
  const lowTaxOutcome = calculateYearOutcome(state, {
    taxRate: 18,
    spendingRate: 20,
    borrowingRate: 2
  });
  const highTaxOutcome = calculateYearOutcome(state, {
    taxRate: 40,
    spendingRate: 20,
    borrowingRate: 2
  });

  assert.ok(lowTaxOutcome.growth > highTaxOutcome.growth);
});

test("repeated borrowing increases debt", () => {
  let state = createInitialState();

  for (let year = 0; year < 3; year += 1) {
    state = applyPolicy(state, {
      taxRate: 18,
      spendingRate: 28,
      borrowingRate: 10
    });
  }

  assert.ok(state.debt > state.initialDebt);
});

test("yearly shocks are deterministic and affect the outcome", () => {
  const state = {
    ...createInitialState(),
    year: 4
  };

  const outcome = calculateYearOutcome(state, {
    taxRate: 22,
    spendingRate: 22,
    borrowingRate: 3
  });

  assert.equal(outcome.shock, "Energy price spike");
  assert.ok(outcome.inflation > state.inflation);
});

test("low approval at an election year ends the game early", () => {
  const state = {
    ...createInitialState(),
    year: 4,
    approval: 35,
    debt: 130,
    inflation: 6.8,
    unemployment: 8.2
  };

  const nextState = applyPolicy(state, {
    taxRate: 40,
    spendingRate: 14,
    borrowingRate: 0
  });

  assert.equal(nextState.status, "finished");
  assert.equal(nextState.electionResult, "lost");
});

test("game finishes after the final year in president mode", () => {
  let state = {
    ...createInitialState("indonesia"),
    approval: 72
  };

  for (let year = 0; year < state.termLength; year += 1) {
    state = applyPolicy(state, {
      taxRate: 20,
      spendingRate: 21,
      borrowingRate: 3
    });
  }

  assert.equal(state.status, "finished");
  assert.equal(state.history.length, state.termLength);
});

test("score reflects GDP gained above the starting level in president mode", () => {
  const state = {
    ...createInitialState(),
    gdp: 114.25
  };

  assert.equal(getScore(state), 14.25);
});

test("higher shock sensitivity makes the same shock hurt more", () => {
  const china = {
    ...createInitialState("china"),
    year: 4
  };
  const serbia = {
    ...createInitialState("serbia"),
    year: 4
  };

  const chinaOutcome = calculateYearOutcome(china, {
    taxRate: 22,
    spendingRate: 22,
    borrowingRate: 3
  });
  const serbiaOutcome = calculateYearOutcome(serbia, {
    taxRate: 22,
    spendingRate: 22,
    borrowingRate: 3
  });

  assert.ok(serbiaOutcome.inflation > chinaOutcome.inflation);
});

test("trader mode starts with a portfolio and different objective", () => {
  const state = createInitialState("brazil", "trader");

  assert.equal(state.mode, "trader");
  assert.equal(state.portfolioValue, 100);
  assert.equal(getScore(state), 0);
});

test("trade outcomes are deterministic for a given year and position", () => {
  const state = createInitialState("indonesia", "trader");

  const outcomeA = calculateTradeOutcome(state, {
    bondPosition: "long",
    currencyPosition: "long"
  });
  const outcomeB = calculateTradeOutcome(state, {
    bondPosition: "long",
    currencyPosition: "long"
  });

  assert.deepEqual(outcomeA, outcomeB);
});

test("successful trader calls can increase portfolio value", () => {
  const state = createInitialState("indonesia", "trader");

  const nextState = applyTrade(state, {
    bondPosition: "long",
    currencyPosition: "long"
  });

  assert.ok(nextState.portfolioValue !== state.portfolioValue);
  assert.equal(nextState.history.length, 1);
  assert.equal(nextState.year, 2);
});

test("trader mode finishes after the final year", () => {
  let state = createInitialState("brazil", "trader");

  for (let year = 0; year < state.termLength; year += 1) {
    state = applyTrade(state, {
      bondPosition: "flat",
      currencyPosition: "flat"
    });
  }

  assert.equal(state.status, "finished");
  assert.equal(state.history.length, state.termLength);
});

test("daily challenge is deterministic for a given date", () => {
  const challengeA = getDailyChallenge("2026-03-19");
  const challengeB = getDailyChallenge("2026-03-19");

  assert.deepEqual(challengeA, challengeB);
});

test("daily challenge state locks to the scenario mode and country", () => {
  const challenge = getDailyChallenge("2026-03-19");
  const state = createInitialState("brazil", "president", {
    dailyChallenge: true,
    challengeDate: "2026-03-19"
  });

  assert.equal(state.dailyChallenge, true);
  assert.equal(state.mode, challenge.mode);
  assert.equal(state.countryId, challenge.countryId);
  assert.equal(state.challenge.title, challenge.title);
});

test("post-run analysis returns cards after a president run", () => {
  let state = {
    ...createInitialState("indonesia"),
    approval: 72
  };

  for (let year = 0; year < 3; year += 1) {
    state = applyPolicy(state, {
      taxRate: 20,
      spendingRate: 21,
      borrowingRate: 3
    });
  }

  const analysis = getRunAnalysis(state);

  assert.equal(analysis.length, 4);
  assert.equal(analysis[0].label, "Best year");
});

test("post-run analysis returns trade insights after a trader run", () => {
  let state = createInitialState("serbia", "trader");
  state = applyTrade(state, {
    bondPosition: "long",
    currencyPosition: "short"
  });

  const analysis = getRunAnalysis(state);

  assert.equal(analysis.length, 4);
  assert.equal(analysis[0].label, "Best trade");
});
