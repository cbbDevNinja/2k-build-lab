const IDX = {
  closeShot: 0,
  layup: 1,
  dunk: 2,
  post: 4,
  mid: 5,
  three: 6,
  pass: 8,
  handle: 9,
  swb: 10,
  perimeter: 12,
  steal: 13,
  speed: 17,
  agility: 18,
  strength: 19,
  vertical: 20,
};

const ROLE_NAMES = ["PG", "SG", "SF", "PF", "C"];

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function norm(v) {
  return clamp((Number(v) - 25) / 74, 0, 1);
}

function pick(vals, index) {
  return Number(vals[index]) || 25;
}

function pct(n) {
  return +(n * 100).toFixed(1);
}

function groupScores(attributes) {
  const groups = {
    finishing: [0, 1, 2, 3, 4],
    shooting: [5, 6, 7],
    playmaking: [8, 9, 10],
    defense: [11, 12, 13, 14],
    rebounding: [15, 16],
    physicals: [17, 18, 19, 20],
  };

  const out = {};
  for (const [name, idxs] of Object.entries(groups)) {
    let sum = 0;
    for (const i of idxs) sum += norm(attributes[i]);
    out[name] = sum / idxs.length;
  }
  return out;
}

function roleWasteFlags(position, attributes) {
  const standingDunk = pick(attributes, 3);
  const postControl = pick(attributes, IDX.post);
  const offensiveRebound = pick(attributes, 15);

  if (position === 0 || position === 1) {
    return [
      standingDunk > 65 ? "Standing Dunk is high for a guard day-one profile" : null,
      postControl > 60 ? "Post Control is high for a guard day-one profile" : null,
      offensiveRebound > 60 ? "Off Reb is high for a guard day-one profile" : null,
    ].filter(Boolean);
  }

  if (position === 4) {
    const ballHandle = pick(attributes, IDX.handle);
    return [ballHandle > 85 ? "Ball Handle above 85 is usually expensive for a center day-one profile" : null].filter(Boolean);
  }

  return [];
}

export function certifyDayOneBuild({ attributes, overallPotential, position }) {
  const v = attributes.map((n) => clamp(Number(n) || 25, 25, 99));

  const shotGate =
    pick(v, IDX.three) >= 80 ||
    pick(v, IDX.mid) >= 82 ||
    pick(v, IDX.layup) >= 80 ||
    pick(v, IDX.dunk) >= 80;

  const ballGate = pick(v, IDX.handle) >= 75 && pick(v, IDX.swb) >= 72 && pick(v, IDX.pass) >= 70;
  const defenseGate = pick(v, IDX.perimeter) >= 75 && pick(v, IDX.speed) >= 78 && pick(v, IDX.agility) >= 75;
  const physicalGate = pick(v, IDX.speed) >= 78 && pick(v, IDX.agility) >= 75 && pick(v, IDX.vertical) >= 65;

  const scores = groupScores(v);
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topScore = ranked[0][1];
  const secondScore = ranked[1][1];
  const roleIdentityGate = topScore >= 0.58 && topScore - secondScore >= 0.06;

  const wasteFlags = roleWasteFlags(Number.isInteger(position) ? position : -1, v);
  const budgetGate = wasteFlags.length === 0;

  const gates = [
    {
      key: "overall_cap",
      label: "85 OVR cap gate",
      pass: Number(overallPotential) <= 85,
      detail: `overallPotential=${overallPotential}`,
    },
    {
      key: "shot",
      label: "Scoring action gate",
      pass: shotGate,
      detail: `3PT=${pick(v, IDX.three)}, MID=${pick(v, IDX.mid)}, LAY=${pick(v, IDX.layup)}, DUNK=${pick(v, IDX.dunk)}`,
    },
    {
      key: "ball_security",
      label: "Ball security gate",
      pass: ballGate,
      detail: `BH=${pick(v, IDX.handle)}, SWB=${pick(v, IDX.swb)}, PASS=${pick(v, IDX.pass)}`,
    },
    {
      key: "defense",
      label: "Defensive survivability gate",
      pass: defenseGate,
      detail: `PER D=${pick(v, IDX.perimeter)}, SPD=${pick(v, IDX.speed)}, AGI=${pick(v, IDX.agility)}`,
    },
    {
      key: "physical",
      label: "Physical floor gate",
      pass: physicalGate,
      detail: `SPD=${pick(v, IDX.speed)}, AGI=${pick(v, IDX.agility)}, VERT=${pick(v, IDX.vertical)}`,
    },
    {
      key: "role_identity",
      label: "Role identity gate",
      pass: roleIdentityGate,
      detail: `top=${ranked[0][0]} ${pct(topScore)}%, second=${ranked[1][0]} ${pct(secondScore)}%`,
    },
    {
      key: "budget_efficiency",
      label: "Budget efficiency gate",
      pass: budgetGate,
      detail: budgetGate ? "No obvious day-one waste flags" : wasteFlags.join("; "),
    },
  ];

  const passed = gates.every((g) => g.pass);
  const role = Number.isInteger(position) && position >= 0 && position < ROLE_NAMES.length ? ROLE_NAMES[position] : "Unknown";

  return {
    passed,
    role,
    gates,
    strengths: ranked.slice(0, 2).map(([name, score]) => ({ area: name, score: pct(score) })),
    riskAreas: gates.filter((g) => !g.pass).map((g) => g.label),
    notes: [
      "Badge-free certification: this check does not use badges.",
      "Deterministic pre-game check: no telemetry required.",
    ],
    modelVersion: "day-one-cert-v1",
  };
}
