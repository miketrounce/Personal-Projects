import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  createRandomFoodPosition,
  stepGame
} from "../src/snake.js";

test("snake moves one cell in the current direction", () => {
  const state = {
    ...createInitialState({ gridSize: 8, rng: () => 0 }),
    status: "running",
    snake: [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 }
    ],
    direction: "right",
    food: { x: 7, y: 7 }
  };

  const nextState = stepGame(state);

  assert.deepEqual(nextState.snake, [
    { x: 4, y: 3 },
    { x: 3, y: 3 },
    { x: 2, y: 3 }
  ]);
  assert.equal(nextState.status, "running");
});

test("snake grows and score increments after eating food", () => {
  const state = {
    ...createInitialState({ gridSize: 8, rng: () => 0 }),
    status: "running",
    snake: [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 }
    ],
    direction: "right",
    food: { x: 4, y: 3 }
  };

  const nextState = stepGame(state, "right", () => 0);

  assert.equal(nextState.score, 1);
  assert.equal(nextState.snake.length, 4);
  assert.deepEqual(nextState.snake[0], { x: 4, y: 3 });
  assert.notDeepEqual(nextState.food, { x: 4, y: 3 });
});

test("wall collisions end the game", () => {
  const state = {
    ...createInitialState({ gridSize: 5, rng: () => 0 }),
    status: "running",
    snake: [
      { x: 4, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 2 }
    ],
    direction: "right",
    food: { x: 0, y: 0 }
  };

  const nextState = stepGame(state);

  assert.equal(nextState.status, "game-over");
});

test("self collisions end the game", () => {
  const state = {
    ...createInitialState({ gridSize: 6, rng: () => 0 }),
    status: "running",
    snake: [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 2, y: 3 }
    ],
    direction: "up",
    food: { x: 0, y: 0 }
  };

  const nextState = stepGame(state, "right");

  assert.equal(nextState.status, "game-over");
});

test("food placement skips occupied cells", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 }
  ];

  const food = createRandomFoodPosition(snake, 2, () => 0);

  assert.deepEqual(food, { x: 1, y: 1 });
});
