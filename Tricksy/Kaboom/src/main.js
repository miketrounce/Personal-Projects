import {
  CHEMICALS,
  HEAT_LEVELS,
  TOTAL_ROUNDS,
  applyMix,
  createInitialState,
  getObjectiveForRound
} from "./kaboom.js";

const primarySelect = document.querySelector("#primary-chemical");
const secondarySelect = document.querySelector("#secondary-chemical");
const heatLevelInput = document.querySelector("#heat-level");
const heatOutput = document.querySelector("#heat-output");
const mixButton = document.querySelector("#mix-button");
const restartButton = document.querySelector("#restart-button");
const objectiveTitle = document.querySelector("#objective-title");
const objectiveCopy = document.querySelector("#objective-copy");
const roundChip = document.querySelector("#round-chip");
const reactionTitle = document.querySelector("#reaction-title");
const reactionCopy = document.querySelector("#reaction-copy");
const effectTag = document.querySelector("#effect-tag");
const heatTag = document.querySelector("#heat-tag");
const scoreTag = document.querySelector("#score-tag");
const scoreValue = document.querySelector("#score-value");
const safetyValue = document.querySelector("#safety-value");
const streakValue = document.querySelector("#streak-value");
const statusValue = document.querySelector("#status-value");
const chemicalList = document.querySelector("#chemical-list");
const logList = document.querySelector("#log-list");
const burst = document.querySelector("#burst");

let state = createInitialState();

function renderChemicalOptions() {
  const options = CHEMICALS.map(
    (chemical) => `<option value="${chemical.id}">${chemical.name}</option>`
  ).join("");

  primarySelect.innerHTML = options;
  secondarySelect.innerHTML = options;
  primarySelect.value = CHEMICALS[0].id;
  secondarySelect.value = CHEMICALS[1].id;
}

function renderChemicalList() {
  chemicalList.innerHTML = CHEMICALS.map(
    (chemical) => `<li><strong>${chemical.name}</strong> — ${chemical.note}</li>`
  ).join("");
}

function getStatusLabel() {
  switch (state.status) {
    case "mixed":
      return "Mixing";
    case "game-over":
      return "Lab closed";
    default:
      return "Ready";
  }
}

function getBurstClassName() {
  if (!state.latestReaction) {
    return "burst";
  }

  return `burst effect-${state.latestReaction.effect}`;
}

function renderObjective() {
  const objective = getObjectiveForRound(state.round);
  objectiveTitle.textContent = objective.title;
  objectiveCopy.textContent = objective.description;
  roundChip.textContent = `Round ${Math.min(state.round, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS}`;
}

function renderReaction() {
  if (!state.latestReaction) {
    reactionTitle.textContent = "Waiting for the first mix";
    reactionCopy.textContent =
      "Your reaction result will show up here with all the ridiculous science drama attached.";
    effectTag.textContent = "Effect: none";
    heatTag.textContent = "Heat: medium";
    scoreTag.textContent = "+0 points";
    burst.className = "burst";
    return;
  }

  reactionTitle.textContent = state.latestReaction.title;
  reactionCopy.textContent = state.latestReaction.summary;
  effectTag.textContent = `Effect: ${state.latestReaction.effect}`;
  heatTag.textContent = `Heat: ${state.latestReaction.heatLabel}`;
  scoreTag.textContent = `+${state.latestReaction.scoreGained} points`;
  burst.className = getBurstClassName();
}

function renderScoreboard() {
  scoreValue.textContent = String(state.totalScore);
  safetyValue.textContent = String(state.safety);
  streakValue.textContent = String(state.bestStreak);
  statusValue.textContent = getStatusLabel();
}

function renderLog() {
  if (state.log.length === 0) {
    logList.innerHTML = "<li>No reactions yet. The lab is suspiciously calm.</li>";
    return;
  }

  logList.innerHTML = state.log
    .map(
      (entry) =>
        `<li><strong>Round ${entry.round}: ${entry.title}</strong><br />${entry.summary} (+${entry.scoreGained})</li>`
    )
    .join("");
}

function renderHeat() {
  heatOutput.textContent = HEAT_LEVELS[Number(heatLevelInput.value)];
}

function render() {
  renderObjective();
  renderReaction();
  renderScoreboard();
  renderLog();
  renderHeat();
}

function mixChemicals() {
  state = applyMix(state, {
    primaryChemical: primarySelect.value,
    secondaryChemical: secondarySelect.value,
    heatLevel: Number(heatLevelInput.value)
  });

  render();
}

function restartRun() {
  state = createInitialState();
  render();
}

mixButton.addEventListener("click", mixChemicals);
restartButton.addEventListener("click", restartRun);
heatLevelInput.addEventListener("input", renderHeat);

renderChemicalOptions();
renderChemicalList();
render();
