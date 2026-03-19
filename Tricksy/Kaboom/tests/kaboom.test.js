import test from "node:test";
import assert from "node:assert/strict";

import {
  TOTAL_ROUNDS,
  applyMix,
  createInitialState,
  getObjectiveForRound,
  resolveReaction,
  scoreReaction
} from "../src/kaboom.js";

test("reaction resolution is deterministic for the same mix", () => {
  const reactionA = resolveReaction("acid", "base", 1);
  const reactionB = resolveReaction("base", "acid", 1);

  assert.deepEqual(reactionA, reactionB);
});

test("scoring rewards matching the current objective", () => {
  const objective = getObjectiveForRound(1);
  const reaction = resolveReaction("acid", "base", 1);

  assert.equal(objective.goalEffect, "foam");
  assert.ok(scoreReaction(reaction, objective) >= 18);
});

test("applyMix advances rounds and updates score and safety", () => {
  const nextState = applyMix(createInitialState(), {
    primaryChemical: "acid",
    secondaryChemical: "metal",
    heatLevel: 2
  });

  assert.equal(nextState.round, 2);
  assert.ok(nextState.totalScore > 0);
  assert.ok(nextState.safety < 100);
  assert.equal(nextState.log.length, 1);
});

test("game ends after the final round", () => {
  let state = createInitialState();

  for (let round = 0; round < TOTAL_ROUNDS; round += 1) {
    state = applyMix(state, {
      primaryChemical: "acid",
      secondaryChemical: "base",
      heatLevel: 1
    });
  }

  assert.equal(state.status, "game-over");
});
