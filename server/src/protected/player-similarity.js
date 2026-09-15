import { config } from "../config.js";

const ATTR_KEYS = [
  ["closeShot", "close_shot", "close"],
  ["drivingLayup", "driving_layup", "layup"],
  ["drivingDunk", "driving_dunk", "dunk"],
  ["standingDunk", "standing_dunk"],
  ["postControl", "post_control", "post"],
  ["midRangeShot", "midRange", "mid_range", "mid"],
  ["threePointShot", "threePoint", "three_point", "three", "threePt"],
  ["freeThrow", "free_throw", "ft"],
  ["passAccuracy", "pass_accuracy", "pass"],
  ["ballHandle", "ball_handle", "handle"],
  ["speedWithBall", "speed_with_ball", "swb"],
  ["interiorDefense", "interior_defense", "interiorD"],
  ["perimeterDefense", "perimeter_defense", "perimeterD"],
  ["steal"],
  ["block"],
  ["offensiveRebound", "offensive_rebound", "offReb"],
  ["defensiveRebound", "defensive_rebound", "defReb"],
  ["speed"],
  ["agility", "acceleration", "accel"],
  ["strength"],
  ["vertical"],
];

const ATTR_LABELS = [
  "Close Shot", "Driving Layup", "Driving Dunk", "Standing Dunk", "Post Control",
  "Mid-Range", "Three-Point", "Free Throw", "Pass Accuracy", "Ball Handle",
  "Speed With Ball", "Interior Defense", "Perimeter Defense", "Steal", "Block",
  "Offensive Rebound", "Defensive Rebound", "Speed", "Agility", "Strength", "Vertical",
];

const ROLE_WEIGHTS = {
  PG: [0.7, 1.25, 1.05, 0.3, 0.2, 0.9, 0.95, 0.5, 1.15, 1.35, 1.3, 0.3, 0.9, 0.55, 0.2, 0.2, 0.2, 1.25, 1.15, 0.45, 1.0],
  SG: [0.7, 1.1, 1.0, 0.3, 0.2, 1.0, 1.15, 0.5, 0.95, 1.25, 1.2, 0.35, 1.0, 0.7, 0.25, 0.25, 0.25, 1.2, 1.1, 0.55, 1.0],
  SF: [0.85, 1.0, 1.0, 0.45, 0.35, 1.0, 1.0, 0.5, 0.85, 0.95, 0.9, 0.75, 1.0, 0.8, 0.75, 0.7, 0.8, 1.0, 0.95, 0.85, 0.95],
  PF: [0.9, 0.85, 0.9, 0.9, 0.9, 0.8, 0.8, 0.4, 0.75, 0.65, 0.55, 1.0, 0.75, 0.55, 1.0, 1.0, 1.1, 0.85, 0.75, 1.15, 0.9],
  C: [0.95, 0.75, 0.8, 1.0, 1.15, 0.65, 0.65, 0.35, 0.7, 0.45, 0.3, 1.15, 0.55, 0.4, 1.15, 1.1, 1.2, 0.65, 0.5, 1.2, 0.75],
};

const POSITION_NAMES = ["PG", "SG", "SF", "PF", "C"];
const PHYSICAL_KEYS = ["height", "weight", "wingspan"];
const MOVEMENT_WEIGHTS = { 9: 1.4, 10: 1.4, 17: 1.1, 18: 1.1, 20: 0.8 };

const protoCatalog = [
  { name: "Tyrese Haliburton", position: "PG", attrs: [55, 72, 55, 30, 35, 86, 89, 75, 92, 88, 84, 45, 72, 65, 40, 35, 45, 82, 82, 45, 72] },
  { name: "Desmond Bane", position: "SG", attrs: [62, 74, 65, 35, 45, 86, 88, 72, 78, 84, 78, 52, 84, 75, 45, 48, 55, 80, 78, 63, 74] },
  { name: "Jayson Tatum", position: "SF", attrs: [70, 80, 84, 45, 65, 85, 84, 70, 80, 82, 78, 60, 82, 72, 60, 60, 72, 81, 80, 70, 78] },
  { name: "Bam Adebayo", position: "PF", attrs: [78, 78, 80, 75, 72, 72, 64, 65, 72, 70, 62, 82, 76, 62, 82, 80, 84, 76, 72, 86, 82] },
  { name: "Nikola Jokic", position: "C", attrs: [86, 76, 72, 84, 88, 84, 80, 78, 90, 78, 60, 82, 65, 58, 72, 88, 92, 62, 55, 90, 68] },
];

const requestTimestamps = [];
let cachedCatalog = null;
let cachedAtMs = 0;

function cleanOldRequests(now) {
  const hourAgo = now - 60 * 60 * 1000;
  while (requestTimestamps.length && requestTimestamps[0] < hourAgo) {
    requestTimestamps.shift();
  }
}

function canRequestExternal(now) {
  cleanOldRequests(now);
  return requestTimestamps.length < config.nba2kApiMaxRequestsPerHour;
}

function recordExternalRequest(now) {
  requestTimestamps.push(now);
}

function num(v) {
  if (v == null || String(v).trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function normalizeAttr(v) {
  if (!Number.isFinite(v)) return NaN;
  return Math.max(0, Math.min(1, (v - 25) / 74));
}

function cosine(a, b, weights) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  let used = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i];
    const bv = b[i];
    if (!Number.isFinite(av) || !Number.isFinite(bv)) continue;
    const weight = weights?.[i] || 1;
    dot += weight * av * bv;
    na += weight * av * av;
    nb += weight * bv * bv;
    used += 1;
  }
  if (!used || !na || !nb) return { score: 0, coverage: 0, consideredAttributes: used };
  return {
    score: dot / (Math.sqrt(na) * Math.sqrt(nb)),
    coverage: used / a.length,
    consideredAttributes: used,
  };
}

function movementSimilarity(a, b) {
  let distance = 0;
  let totalWeight = 0;
  let used = 0;
  for (const [indexText, weight] of Object.entries(MOVEMENT_WEIGHTS)) {
    const index = Number(indexText);
    if (!Number.isFinite(a[index]) || !Number.isFinite(b[index])) continue;
    distance += weight * Math.abs(a[index] - b[index]);
    totalWeight += weight;
    used += 1;
  }
  return {
    score: totalWeight ? Math.max(0, 1 - distance / totalWeight) : null,
    considered: used,
  };
}

function absoluteCloseness(a, b, weights) {
  let weightedDistance = 0;
  let totalWeight = 0;
  let used = 0;
  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) continue;
    const weight = weights?.[i] || 1;
    weightedDistance += weight * Math.abs(a[i] - b[i]);
    totalWeight += weight;
    used += 1;
  }
  return {
    score: totalWeight ? Math.max(0, 1 - weightedDistance / totalWeight) : 0,
    consideredAttributes: used,
  };
}

function getByAliases(obj, aliases) {
  if (!obj || typeof obj !== "object") return NaN;
  for (const key of aliases) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = num(obj[key]);
      if (Number.isFinite(value)) return value;
    }
  }
  return NaN;
}

function parseLength(value) {
  if (typeof value === "number") return value;
  const text = String(value || "").trim();
  const feet = text.match(/(\d+)\s*['′]/);
  const inches = text.match(/(?:['′]\s*)(\d+(?:\.\d+)?)\s*["″]?/);
  if (feet) return Number(feet[1]) * 12 + (inches ? Number(inches[1]) : 0);
  return num(text.replace(/[^0-9.]/g, ""));
}

function parseWeight(value) {
  return num(String(value || "").replace(/[^0-9.]/g, ""));
}

function physicalSimilarity(build, player) {
  const playerValues = [parseLength(player.height), parseWeight(player.weight), parseLength(player.wingspan)];
  const buildValues = [num(build.heightIn), num(build.weightLb), num(build.wingspanIn)];
  const ranges = [12, 80, 18];
  let total = 0;
  let used = 0;
  for (let i = 0; i < PHYSICAL_KEYS.length; i++) {
    if (!Number.isFinite(playerValues[i]) || !Number.isFinite(buildValues[i])) continue;
    total += Math.max(0, 1 - Math.abs(playerValues[i] - buildValues[i]) / ranges[i]);
    used += 1;
  }
  return { score: used ? total / used : null, considered: used };
}

function positionSimilarity(buildPosition, player) {
  if (!Number.isInteger(buildPosition) || buildPosition < 0 || buildPosition > 4) return null;
  const buildPos = POSITION_NAMES[buildPosition];
  const positions = Array.isArray(player.positions) ? player.positions : player.position ? [player.position] : [];
  if (!positions.length) return null;
  if (positions.includes(buildPos)) return 1;
  const guard = ["PG", "SG"].includes(buildPos) && positions.some((p) => ["PG", "SG"].includes(p));
  const wing = ["SF", "PF"].includes(buildPos) && positions.some((p) => ["SF", "PF"].includes(p));
  return guard || wing ? 0.65 : 0;
}

function capBreakerDependence(build) {
  const base = Array.isArray(build.attributes) ? build.attributes : [];
  const final = Array.isArray(build.finalAttributes) ? build.finalAttributes : base;
  if (base.length !== 21 || final.length !== 21) return null;
  let gained = 0;
  for (let i = 0; i < 21; i++) gained += Math.max(0, Number(final[i]) - Number(base[i]));
  return Math.max(0, Math.min(1, gained / 35));
}

function playerToVector(player) {
  if (Array.isArray(player?.attrs) && player.attrs.length === 21) {
    return player.attrs.map((v) => normalizeAttr(num(v)));
  }
  if (Array.isArray(player?.attributes) && player.attributes.length === 21) {
    return player.attributes.map((v) => normalizeAttr(num(v)));
  }
  const attrs = player.attributes && typeof player.attributes === "object" ? player.attributes : player;
  return ATTR_KEYS.map((aliases) => normalizeAttr(getByAliases(attrs, aliases)));
}

function playerToRawVector(player) {
  if (Array.isArray(player?.attrs) && player.attrs.length === 21) {
    return player.attrs.map((v) => num(v));
  }
  if (Array.isArray(player?.attributes) && player.attributes.length === 21) {
    return player.attributes.map((v) => num(v));
  }
  const attrs = player.attributes && typeof player.attributes === "object" ? player.attributes : player;
  return ATTR_KEYS.map((aliases) => getByAliases(attrs, aliases));
}

function attributeBreakdown(buildAttributes, player) {
  const buildValues = buildAttributes.map((v) => num(v));
  const playerValues = playerToRawVector(player);
  return ATTR_LABELS.map((label, index) => {
    const buildValue = buildValues[index];
    const playerValue = playerValues[index];
    return {
      label,
      build: Number.isFinite(buildValue) ? buildValue : null,
      player: Number.isFinite(playerValue) ? playerValue : null,
      difference: Number.isFinite(buildValue) && Number.isFinite(playerValue) ? buildValue - playerValue : null,
      matches: Number.isFinite(buildValue) && Number.isFinite(playerValue) && buildValue === playerValue,
    };
  });
}

function buildVector(attributes) {
  return attributes.map((v) => normalizeAttr(num(v)));
}

function scoreAgainstCatalog(build, catalog, topN = 5) {
  const attributes = build.attributes;
  const b = buildVector(attributes);
  const role = POSITION_NAMES[build.position];
  const weights = ROLE_WEIGHTS[role] || null;
  const scored = [];

  for (const player of catalog) {
    const p = playerToVector(player);
    const { score, coverage, consideredAttributes } = cosine(b, p, weights);
    const closeness = absoluteCloseness(b, p, weights);
    const movement = movementSimilarity(b, p);
    const physical = physicalSimilarity(build, player);
    const positionFit = positionSimilarity(build.position, player);
    const capDependence = capBreakerDependence(build);
    const generalAttributes = (score * 0.45) + (closeness.score * 0.55);
    const components = [
      { value: movement.score, weight: 0.5 },
      { value: physical.score, weight: 0.25 },
      { value: positionFit, weight: 0.15 },
      { value: generalAttributes, weight: 0.1 },
    ].filter((x) => x.value !== null);
    const totalWeight = components.reduce((sum, x) => sum + x.weight, 0);
    const profileScore = components.reduce((sum, x) => sum + x.value * x.weight, 0) / totalWeight;
    scored.push({
      name: player.name || player.playerName || "Unknown",
      position: player.positions?.join("/") || player.position || player.pos || "",
      team: player.team || player.teamName || "",
      similarity: +(profileScore * 100).toFixed(2),
      attributeSimilarity: +(((score * 0.45) + (closeness.score * 0.55)) * 100).toFixed(2),
      profileShapeSimilarity: +(score * 100).toFixed(2),
      exactAttributeSimilarity: +(closeness.score * 100).toFixed(2),
      movementSimilarity: movement.score === null ? null : +(movement.score * 100).toFixed(2),
      movementAttributes: movement.considered,
      physicalSimilarity: physical.score === null ? null : +(physical.score * 100).toFixed(2),
      positionFit: positionFit === null ? null : +(positionFit * 100).toFixed(2),
      capBreakerDependence: capDependence === null ? null : +(capDependence * 100).toFixed(2),
      confidence: +(Math.min(1, consideredAttributes / 21) * 100).toFixed(1),
      coverage: +(coverage * 100).toFixed(1),
      consideredAttributes,
      attributes: attributeBreakdown(attributes, player),
    });
  }

  scored.sort((x, y) => y.similarity - x.similarity);
  return scored.slice(0, Math.max(1, Math.min(10, topN)));
}

async function fetchExternalCatalog() {
  if (!config.nba2kApiEnabled) {
    return { ok: false, reason: "disabled" };
  }

  const now = Date.now();
  if (cachedCatalog && now - cachedAtMs < config.nba2kSimilarityCacheTtlMs) {
    return { ok: true, source: "cache", data: cachedCatalog };
  }

  if (!canRequestExternal(now)) {
    return { ok: false, reason: "hourly-limit" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.nba2kApiTimeoutMs);

  const headers = { Accept: "application/json" };
  headers[config.nba2kApiKeyHeader] = config.nba2kApiKey;

  try {
    recordExternalRequest(now);
    const separator = config.nba2kApiPlayersPath.includes("?") ? "&" : "?";
    const res = await fetch(`${config.nba2kApiBaseUrl}${config.nba2kApiPlayersPath}${separator}teamType=curr`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, reason: `http-${res.status}` };
    }

    const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
    if (!list.length) {
      return { ok: false, reason: "empty" };
    }

    cachedCatalog = list;
    cachedAtMs = Date.now();
    return { ok: true, source: "external", data: list };
  } catch {
    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timer);
  }
}

export async function computeSimilarity({ build, topN }) {
  const ext = await fetchExternalCatalog();
  if (ext.ok) {
    return {
      source: ext.source,
      matches: scoreAgainstCatalog(build, ext.data, topN),
      modelVersion: "similarity-v2-composite",
    };
  }

  return {
    source: "fallback",
    fallbackReason: ext.reason,
    matches: scoreAgainstCatalog(build, protoCatalog, topN),
    modelVersion: "similarity-v2-composite",
  };
}
