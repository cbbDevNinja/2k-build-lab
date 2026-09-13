import crypto from "crypto";
import { config } from "../config.js";

function base64urlEncode(s) {
  return Buffer.from(String(s), "utf8").toString("base64url");
}

function base64urlDecode(s) {
  return Buffer.from(String(s), "base64url").toString("utf8");
}

function sign(payloadB64, secret) {
  return crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

function timingSafeEq(a, b) {
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

export function createInviteCode(label, days = 7, nowMs = Date.now()) {
  const ttlDays = Number(days) || 7;
  const payload = {
    sub: String(label || "friend"),
    iat: Math.floor(nowMs / 1000),
    exp: Math.floor((nowMs + ttlDays * 24 * 60 * 60 * 1000) / 1000),
  };
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const sig = sign(payloadB64, config.inviteCodeSecret);
  return `${payloadB64}.${sig}`;
}

export function verifyInviteCode(code, nowSec = Math.floor(Date.now() / 1000)) {
  if (!code || typeof code !== "string" || !code.includes(".")) return null;
  const [payloadB64, sig] = code.split(".");
  if (!payloadB64 || !sig) return null;

  const expected = sign(payloadB64, config.inviteCodeSecret);
  if (!timingSafeEq(sig, expected)) return null;

  let payload;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64));
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object") return null;
  if (!payload.exp || nowSec > Number(payload.exp)) return null;
  return payload;
}

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  const out = Object.create(null);
  if (!raw) return out;
  const parts = raw.split(";");
  for (const p of parts) {
    const i = p.indexOf("=");
    if (i < 0) continue;
    const k = p.slice(0, i).trim();
    const v = p.slice(i + 1).trim();
    if (!k) continue;
    out[k] = decodeURIComponent(v);
  }
  return out;
}

function setInviteCookie(res, code, expSec) {
  const ttlSec = Math.max(1, expSec - Math.floor(Date.now() / 1000));
  const secure = config.nodeEnv === "production" ? "; Secure" : "";
  const cookie = `${config.inviteCookieName}=${encodeURIComponent(code)}; Path=/; Max-Age=${ttlSec}; HttpOnly; SameSite=Lax${secure}`;
  res.setHeader("Set-Cookie", cookie);
}

function clearInviteCookie(res) {
  const secure = config.nodeEnv === "production" ? "; Secure" : "";
  const cookie = `${config.inviteCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
  res.setHeader("Set-Cookie", cookie);
}

export function mountInviteRoutes(app) {
  app.get("/unlock", (req, res) => {
    if (!config.requireInviteCode) {
      return res.status(404).send("Invite mode is not enabled");
    }
    const code = String(req.query.code || "");
    const payload = verifyInviteCode(code);
    if (!payload) {
      return res.status(401).send("Invalid or expired invite code");
    }
    setInviteCookie(res, code, Number(payload.exp));
    return res.redirect("/");
  });

  app.post("/unlock", (req, res) => {
    if (!config.requireInviteCode) {
      return res.status(404).json({ error: "Invite mode is not enabled" });
    }
    const code = String((req.body && req.body.code) || "");
    const payload = verifyInviteCode(code);
    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired invite code" });
    }
    setInviteCookie(res, code, Number(payload.exp));
    return res.json({ ok: true, expiresAt: payload.exp, label: payload.sub || "friend" });
  });

  app.post("/lock", (_req, res) => {
    clearInviteCookie(res);
    return res.json({ ok: true });
  });
}

export function requireInviteCode(req, res, next) {
  if (!config.requireInviteCode) return next();
  const cookies = parseCookies(req);
  const code = cookies[config.inviteCookieName] || "";
  const payload = verifyInviteCode(code);
  if (!payload) {
    clearInviteCookie(res);
    return res.status(401).send('Invite required. Open a valid /unlock?code=... link.');
  }
  req.invite = { label: payload.sub || "friend", exp: payload.exp };
  return next();
}
