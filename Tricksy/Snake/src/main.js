import {
  GRID_SIZE,
  INITIAL_TICK_MS,
  createInitialState,
  stepGame,
  togglePause
} from "./snake.js";

const board = document.querySelector("#board");
const scoreValue = document.querySelector("#score");
const statusValue = document.querySelector("#status");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const directionButtons = document.querySelectorAll("[data-direction]");

let state = createInitialState();
let queuedDirection = null;
let tickHandle = null;

board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
board.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;

function getCellClassName(x, y) {
  const isFood = state.food && state.food.x === x && state.food.y === y;
  const snakeIndex = state.snake.findIndex(
    (segment) => segment.x === x && segment.y === y
  );

  if (snakeIndex === 0) {
    return "cell snake head";
  }

  if (snakeIndex > 0) {
    return "cell snake";
  }

  if (isFood) {
    return "cell food";
  }

  return "cell";
}

function getStatusLabel() {
  switch (state.status) {
    case "running":
      return "Running";
    case "paused":
      return "Paused";
    case "game-over":
      return "Game Over";
    default:
      return "Ready";
  }
}

function render() {
  const cells = [];

  for (let y = 0; y < state.gridSize; y += 1) {
    for (let x = 0; x < state.gridSize; x += 1) {
      cells.push(`<div class="${getCellClassName(x, y)}"></div>`);
    }
  }

  board.innerHTML = cells.join("");
  scoreValue.textContent = String(state.score);
  statusValue.textContent = getStatusLabel();
  pauseButton.textContent = state.status === "paused" ? "Resume" : "Pause";
}

function queueDirection(direction) {
  queuedDirection = direction;
  if (state.status === "ready") {
    state = {
      ...state,
      status: "running"
    };
    render();
  }
}

function tick() {
  if (state.status !== "running") {
    return;
  }

  state = stepGame(state, queuedDirection);
  queuedDirection = null;
  render();
}

function startLoop() {
  if (tickHandle !== null) {
    window.clearInterval(tickHandle);
  }

  tickHandle = window.setInterval(tick, INITIAL_TICK_MS);
}

function restartGame() {
  state = createInitialState();
  queuedDirection = null;
  render();
}

function handleKeydown(event) {
  const directionByKey = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    W: "up",
    s: "down",
    S: "down",
    a: "left",
    A: "left",
    d: "right",
    D: "right"
  };

  if (event.code === "Space") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  const direction = directionByKey[event.key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  queueDirection(direction);
}

document.addEventListener("keydown", handleKeydown);
pauseButton.addEventListener("click", () => {
  state = togglePause(state);
  render();
});
restartButton.addEventListener("click", restartGame);

directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    queueDirection(button.dataset.direction);
  });
});

startLoop();
render();
