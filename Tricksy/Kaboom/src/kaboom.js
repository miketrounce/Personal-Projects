export const TOTAL_ROUNDS = 6;

export const HEAT_LEVELS = ["Low", "Medium", "High"];

export const CHEMICALS = [
  {
    id: "acid",
    name: "Fizz Acid",
    note: "Sharp, fizzy, and guaranteed to upset quiet mixtures."
  },
  {
    id: "base",
    name: "Puff Base",
    note: "Calming in theory, suspiciously foamy in practice."
  },
  {
    id: "glitter",
    name: "Glitter Dust",
    note: "Scientifically unnecessary, emotionally essential."
  },
  {
    id: "metal",
    name: "Metal Shavings",
    note: "Adds sparks, clangs, and terrible decisions."
  },
  {
    id: "goo",
    name: "Slime Syrup",
    note: "Sticky, stretchy, and deeply unserious."
  },
  {
    id: "frost",
    name: "Frost Salt",
    note: "Brings chill, crunch, and accidental ice sculptures."
  }
];

export const OBJECTIVES = [
  {
    title: "Open with a showy fizz",
    description: "Make the lab crowd laugh with a bubbling, noisy first mix.",
    goalEffect: "foam"
  },
  {
    title: "Create a sparkly crowd-pleaser",
    description: "Aim for a ridiculous glitter-heavy reaction.",
    goalEffect: "sparkle"
  },
  {
    title: "Cause a dramatic launch",
    description: "The judges want a pop, a bang, or a clean whoosh upward.",
    goalEffect: "launch"
  },
  {
    title: "Freeze something completely unplanned",
    description: "Accidentally produce a comic ice disaster.",
    goalEffect: "freeze"
  },
  {
    title: "Go full slime goblin",
    description: "Reward the audience with a stretchy sticky mess.",
    goalEffect: "slime"
  },
  {
    title: "Finish with a chaos masterpiece",
    description: "Anything loud, absurd, and crowd-winning will do.",
    goalEffect: "chaos"
  }
];

const REACTIONS = {
  "acid+base": {
    title: "Foam Fountain",
    effect: "foam",
    baseChaos: 12,
    baseSafety: -4,
    summary: "The beaker erupts in a fizzy foam tower and drenches the bench."
  },
  "acid+glitter": {
    title: "Disco Belch",
    effect: "sparkle",
    baseChaos: 13,
    baseSafety: -5,
    summary: "A shimmering chemical burp showers the lab in glittery mist."
  },
  "acid+metal": {
    title: "Spark Spit",
    effect: "launch",
    baseChaos: 15,
    baseSafety: -12,
    summary: "The mix spits sparks and sends metal confetti across the room."
  },
  "acid+goo": {
    title: "Sour Sludge",
    effect: "slime",
    baseChaos: 11,
    baseSafety: -6,
    summary: "The goo swells into a sticky pudding that slowly tries to escape."
  },
  "acid+frost": {
    title: "Frozen Pop",
    effect: "freeze",
    baseChaos: 13,
    baseSafety: -7,
    summary: "A crackling cold cloud locks the beaker in cartoon frost."
  },
  "base+glitter": {
    title: "Confetti Cough",
    effect: "sparkle",
    baseChaos: 10,
    baseSafety: -2,
    summary: "Soft bubbles puff glitter confetti into the air like a party sneeze."
  },
  "base+metal": {
    title: "Clang Cloud",
    effect: "launch",
    baseChaos: 11,
    baseSafety: -8,
    summary: "A dusty pop rattles the flask with tiny metallic clinks."
  },
  "base+goo": {
    title: "Blob Choir",
    effect: "slime",
    baseChaos: 9,
    baseSafety: -3,
    summary: "Wobbling blobs stack up and squeak like a jelly barbershop quartet."
  },
  "base+frost": {
    title: "Minty Hiccup",
    effect: "freeze",
    baseChaos: 8,
    baseSafety: -1,
    summary: "A polite icy puff coats the table in frosty powder."
  },
  "glitter+metal": {
    title: "Sparkle Shrapnel",
    effect: "chaos",
    baseChaos: 16,
    baseSafety: -14,
    summary: "Bright shards of glitter and sparks ricochet in every direction."
  },
  "glitter+goo": {
    title: "Party Slime",
    effect: "slime",
    baseChaos: 12,
    baseSafety: -4,
    summary: "The mixture becomes a neon slime that refuses to stop wiggling."
  },
  "glitter+frost": {
    title: "Snow Globe Panic",
    effect: "freeze",
    baseChaos: 10,
    baseSafety: -3,
    summary: "Sparkly ice spins around the flask like a haunted snow globe."
  },
  "metal+goo": {
    title: "Treacle Trebuchet",
    effect: "launch",
    baseChaos: 14,
    baseSafety: -10,
    summary: "A gloppy catapult launches syrupy globs clear over the burner."
  },
  "metal+frost": {
    title: "Cold Bang",
    effect: "freeze",
    baseChaos: 14,
    baseSafety: -9,
    summary: "The metal snaps, the air cracks, and a cold boom shakes the room."
  },
  "goo+frost": {
    title: "Slush Monster",
    effect: "slime",
    baseChaos: 11,
    baseSafety: -4,
    summary: "Half slime, half snow cone, the mixture crawls toward freedom."
  }
};

function getHeatBucket(heatLevel) {
  return HEAT_LEVELS[heatLevel] ?? HEAT_LEVELS[1];
}

function toReactionKey(primaryChemical, secondaryChemical) {
  return [primaryChemical, secondaryChemical].sort().join("+");
}

function resolveDuplicateReaction(primaryChemical, heatLevel) {
  const label = getHeatBucket(heatLevel);
  return {
    title: `${label} Self-Mix`,
    effect: heatLevel === 2 ? "chaos" : heatLevel === 0 ? "freeze" : "foam",
    chaos: 6 + heatLevel * 4,
    safetyDelta: -2 - heatLevel * 3,
    summary: `Doubling up on ${primaryChemical} creates a ${label.toLowerCase()} overreaction with zero lab discipline.`,
    heatLabel: label
  };
}

export function resolveReaction(primaryChemical, secondaryChemical, heatLevel) {
  if (primaryChemical === secondaryChemical) {
    return resolveDuplicateReaction(primaryChemical, heatLevel);
  }

  const reaction = REACTIONS[toReactionKey(primaryChemical, secondaryChemical)];
  const heatLabel = getHeatBucket(heatLevel);

  if (!reaction) {
    return {
      title: `${heatLabel} Mystery Puff`,
      effect: "chaos",
      chaos: 10 + heatLevel * 2,
      safetyDelta: -5 - heatLevel * 2,
      summary: "Nobody understands what happened, but something definitely bounced off the ceiling.",
      heatLabel
    };
  }

  const heatChaos = heatLevel === 0 ? -2 : heatLevel === 2 ? 4 : 0;
  const heatSafety = heatLevel === 0 ? 2 : heatLevel === 2 ? -5 : 0;

  return {
    title: heatLevel === 2 ? `Overclocked ${reaction.title}` : reaction.title,
    effect: reaction.effect,
    chaos: Math.max(4, reaction.baseChaos + heatChaos),
    safetyDelta: reaction.baseSafety + heatSafety,
    summary:
      heatLevel === 2
        ? `${reaction.summary} Then the extra heat makes the whole thing deeply unnecessary.`
        : reaction.summary,
    heatLabel
  };
}

export function scoreReaction(reaction, objective) {
  const baseScore = reaction.effect === objective.goalEffect ? 14 : 6;
  const chaosBonus = Math.floor(reaction.chaos / 3);
  const finaleBonus = objective.goalEffect === "chaos" ? 4 : 0;

  return baseScore + chaosBonus + finaleBonus;
}

export function createInitialState() {
  return {
    round: 1,
    totalScore: 0,
    safety: 100,
    streak: 0,
    bestStreak: 0,
    status: "ready",
    latestReaction: null,
    log: []
  };
}

export function getObjectiveForRound(round) {
  return OBJECTIVES[Math.min(round - 1, OBJECTIVES.length - 1)];
}

export function applyMix(state, mix) {
  if (state.status === "game-over") {
    return state;
  }

  const reaction = resolveReaction(
    mix.primaryChemical,
    mix.secondaryChemical,
    mix.heatLevel
  );
  const objective = getObjectiveForRound(state.round);
  const scoreGained = scoreReaction(reaction, objective);
  const objectiveMatched =
    reaction.effect === objective.goalEffect || objective.goalEffect === "chaos";
  const streak = objectiveMatched ? state.streak + 1 : 0;
  const safety = Math.max(0, state.safety + reaction.safetyDelta);
  const nextRound = state.round + 1;
  const gameOver = safety <= 0 || state.round >= TOTAL_ROUNDS;
  const logEntry = {
    round: state.round,
    title: reaction.title,
    summary: reaction.summary,
    scoreGained
  };

  return {
    round: gameOver ? state.round : nextRound,
    totalScore: state.totalScore + scoreGained,
    safety,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    status: gameOver ? "game-over" : "mixed",
    latestReaction: {
      ...reaction,
      scoreGained,
      objectiveMatched
    },
    log: [logEntry, ...state.log].slice(0, TOTAL_ROUNDS)
  };
}
