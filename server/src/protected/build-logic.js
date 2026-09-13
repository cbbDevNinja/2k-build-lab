const ATTR_COUNT = 21;
const ORDER = [1, 4, 0, 5, 6, 7, 9, 8, 15, 16, 11, 12, 14, 13, 3, 2, 17, 10, 20, 19, 18];
const WALL = 99;

const WEIGHTS = [
  1.25, 1.15, 1.35, 0.9, 0.7,
  1.2, 1.3, 0.4,
  1.1, 1.2, 1.05,
  1.0, 1.15, 1.1, 0.95,
  0.9, 0.9,
  1.05, 1.0, 0.95, 0.9,
];

let TABLES = null;

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

async function loadTables() {
  if (TABLES) return TABLES;
  if (typeof globalThis.atob !== "function") {
    globalThis.atob = (s) => Buffer.from(String(s), "base64").toString("binary");
  }
  await import("../../../js/goated-build-lab.tables.js");
  TABLES = globalThis.GBL_BUILD_TABLES || null;
  if (!TABLES) {
    throw new Error("Missing build table payload on server");
  }
  return TABLES;
}

function ratingOf(vals, hb, tables) {
  const fr = Math.fround;
  let best = -1;
  const Wt = tables.Wt;
  const SCt = tables.SCt;
  const LERP = tables.LERP;

  for (let pt = 0; pt < 15; pt++) {
    const o = (hb * 15 + pt) * 21;
    let num = 0;
    let den = 0;
    for (let c = 0; c < 21; c++) {
      const v = vals[ORDER[c]];
      const e = fr(Wt[o + c] * SCt[c * 100 + v]);
      num = fr(num + fr(e * v));
      den = fr(den + e);
    }
    let r = den > 0 ? fr(num / den) : 25;
    if (r < 25) r = 25;
    if (r > best) best = r;
  }

  const e0 = LERP[hb * 4];
  const e1 = LERP[hb * 4 + 1];
  const e2 = LERP[hb * 4 + 2];
  const e3 = LERP[hb * 4 + 3];
  let out = fr(e2 + fr(fr(fr(e3 - e2) * fr(best - e0)) / fr(e1 - e0)));
  if (out < e2) out = e2;
  return out;
}

function overallOf(vals, hb, caps, tables) {
  let r = ratingOf(vals, hb, tables);
  if (r >= 84 && r <= WALL && r !== Math.floor(r)) {
    const fl = Math.floor(r);
    let bump = true;
    const w = vals.slice();
    for (let i = 0; i < 21; i++) {
      if (vals[i] >= (caps ? caps[i] : 99)) continue;
      w[i] = vals[i] + 1;
      const same = Math.floor(ratingOf(w, hb, tables)) === fl;
      w[i] = vals[i];
      if (same) {
        bump = false;
        break;
      }
    }
    if (bump) r = Math.ceil(r);
  }
  return Math.floor(r);
}

export async function evaluateBuild({ attributes, finalAttributes, bodyHb, bodyCaps }) {
  if (!Array.isArray(attributes) || attributes.length !== ATTR_COUNT) {
    throw new Error(`attributes must be an array of ${ATTR_COUNT} numbers`);
  }
  if (finalAttributes != null && (!Array.isArray(finalAttributes) || finalAttributes.length !== ATTR_COUNT)) {
    throw new Error(`finalAttributes must be an array of ${ATTR_COUNT} numbers when provided`);
  }
  if (!Number.isInteger(bodyHb) || bodyHb < 0 || bodyHb > 30) {
    throw new Error("bodyHb must be an integer in [0, 30]");
  }
  if (!Array.isArray(bodyCaps) || bodyCaps.length !== ATTR_COUNT) {
    throw new Error(`bodyCaps must be an array of ${ATTR_COUNT} numbers`);
  }

  const tables = await loadTables();
  const alloc = attributes.map((v) => clamp(Number(v) || 25, 25, 99));
  const fin = (finalAttributes || attributes).map((v) => clamp(Number(v) || 25, 25, 99));
  const caps = bodyCaps.map((v) => clamp(Number(v) || 99, 25, 99));

  const rawAlloc = ratingOf(alloc, bodyHb, tables);
  const overallAlloc = Math.min(99, overallOf(alloc, bodyHb, caps, tables));
  const rawFinal = ratingOf(fin, bodyHb, tables);

  const ranked = alloc
    .map((v, i) => ({ i, headroom: Math.max(0, caps[i] - v), roi: WEIGHTS[i] * Math.max(0, caps[i] - v) }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5)
    .map((x) => ({
      attributeIndex: x.i,
      suggestedGain: Math.min(5, x.headroom),
      estimatedImpact: +((Math.min(5, x.headroom) * WEIGHTS[x.i]) / 2).toFixed(2),
    }));

  return {
    overallPotential: overallAlloc,
    engine: {
      rawAlloc: +rawAlloc.toFixed(4),
      overallAlloc,
      rawFinal: +rawFinal.toFixed(4),
      atWall: rawAlloc >= WALL - 0.02,
    },
    recommendations: ranked,
    modelVersion: "server-engine-v1",
  };
}
