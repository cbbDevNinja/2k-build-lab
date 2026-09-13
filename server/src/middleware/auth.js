import { config } from "../config.js";

async function supabaseUserFromToken(token) {
  const res = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: config.supabaseServiceRoleKey,
    },
  });

  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function requireAuth(req, res, next) {
  if (!config.requireAuth) {
    req.auth = { mode: "dev", userId: "local-dev" };
    return next();
  }

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  const user = await supabaseUserFromToken(token);
  if (!user?.id) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.auth = { mode: "supabase", userId: user.id, email: user.email || null };
  return next();
}
