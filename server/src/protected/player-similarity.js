import { config } from "../config.js";

const ATTR_KEYS = [
  ["closeShot", "close_shot", "close"],
  ["drivingLayup", "driving_layup", "layup"],
  ["drivingDunk", "driving_dunk", "dunk"],
  ["standingDunk", "standing_dunk"],
  ["postControl", "post_control", "post"],
  ["midRange", "mid_range", "mid"],
  ["threePoint", "three_point", "three", "threePt"],
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
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function normalizeAttr(v) {
  if (!Number.isFinite(v)) return NaN;
  return Math.max(0, Math.min(1, (v - 25) / 74));
}

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  let used = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i];
    const bv = b[i];
    if (!Number.isFinite(av) || !Number.isFinite(bv)) continue;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
    used += 1;
  }
  if (!used || !na || !nb) return { score: 0, coverage: 0 };
  return {
    score: dot / (Math.sqrt(na) * Math.sqrt(nb)),
    coverage: used / a.length,
  };
}

function getByAliases(obj, aliases) {
  if (!obj || typeof obj !== "object") return NaN;
  for (const key of aliases) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return num(obj[key]);
    }
  }
  return NaN;
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

function buildVector(attributes) {
  return attributes.map((v) => normalizeAttr(num(v)));
}

function scoreAgainstCatalog(attributes, catalog, topN = 5) {
  const b = buildVector(attributes);
  const scored = [];

  for (const player of catalog) {
    const p = playerToVector(player);
    const { score, coverage } = cosine(b, p);
    scored.push({
      name: player.name || player.playerName || "Unknown",
      position: player.position || player.pos || "",
      team: player.team || player.teamName || "",
      similarity: +(score * 100).toFixed(2),
      coverage: +(coverage * 100).toFixed(1),
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
    const res = await fetch(`${config.nba2kApiBaseUrl}${config.nba2kApiPlayersPath}`, {
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

export async function computeSimilarity({ attributes, topN }) {
  const ext = await fetchExternalCatalog();
  if (ext.ok) {
    return {
      source: ext.source,
      matches: scoreAgainstCatalog(attributes, ext.data, topN),
      modelVersion: "similarity-v1",
    };
  }

  return {
    source: "fallback",
    fallbackReason: ext.reason,
    matches: scoreAgainstCatalog(attributes, protoCatalog, topN),
    modelVersion: "similarity-v1",
  };
}
