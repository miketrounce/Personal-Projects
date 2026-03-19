export const GRID_SIZE = 16;
export const INITIAL_TICK_MS = 140;

export const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export function createInitialSnake(gridSize = GRID_SIZE) {
  const mid = Math.floor(gridSize / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid }
  ];
}

export function isOppositeDirection(currentDirection, nextDirection) {
  return (
    (currentDirection === "up" && nextDirection === "down") ||
    (currentDirection === "down" && nextDirection === "up") ||
    (currentDirection === "left" && nextDirection === "right") ||
    (currentDirection === "right" && nextDirection === "left")
  );
}

export function createRandomFoodPosition(snake, gridSize, rng = Math.random) {
  const occupied = new Set(snake.map(({ x, y }) => `${x},${y}`));
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * openCells.length);
  return openCells[index];
}

export function createInitialState(options = {}) {
  const gridSize = options.gridSize ?? GRID_SIZE;
  const snake = createInitialSnake(gridSize);
  const rng = options.rng ?? Math.random;

  return {
    gridSize,
    snake,
    direction: "right",
    food: createRandomFoodPosition(snake, gridSize, rng),
    score: 0,
    status: "ready"
  };
}

export function getNextDirection(state, requestedDirection) {
  if (!requestedDirection) {
    return state.direction;
  }

  if (
    state.snake.length > 1 &&
    isOppositeDirection(state.direction, requestedDirection)
  ) {
    return state.direction;
  }

  return requestedDirection;
}

export function stepGame(state, requestedDirection, rng = Math.random) {
  if (state.status === "game-over") {
    return state;
  }

  const direction = getNextDirection(state, requestedDirection);
  const vector = DIRECTION_VECTORS[direction];
  const currentHead = state.snake[0];
  const nextHead = {
    x: currentHead.x + vector.x,
    y: currentHead.y + vector.y
  };

  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y >= state.gridSize;

  if (hitWall) {
    return {
      ...state,
      direction,
      status: "game-over"
    };
  }

  const willEat =
    state.food &&
    nextHead.x === state.food.x &&
    nextHead.y === state.food.y;

  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);
  const hitsSelf = bodyToCheck.some(
    ({ x, y }) => x === nextHead.x && y === nextHead.y
  );

  if (hitsSelf) {
    return {
      ...state,
      direction,
      status: "game-over"
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!willEat) {
    nextSnake.pop();
  }

  const food = willEat
    ? createRandomFoodPosition(nextSnake, state.gridSize, rng)
    : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    food,
    score: state.score + (willEat ? 1 : 0),
    status: food === null ? "game-over" : "running"
  };
}

export function togglePause(state) {
  if (state.status === "game-over") {
    return state;
  }

  if (state.status === "paused") {
    return {
      ...state,
      status: "running"
    };
  }

  return {
    ...state,
    status: "paused"
  };
}
