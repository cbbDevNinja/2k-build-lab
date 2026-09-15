import dotenv from "dotenv";

dotenv.config({ path: "server/.env" });

function toBool(value, fallback = false) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function toList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT || 8787),
  nodeEnv: process.env.NODE_ENV || "development",
  requireAuth: toBool(process.env.REQUIRE_AUTH, false),
  requireSitePassword: toBool(process.env.REQUIRE_SITE_PASSWORD, false),
  requireInviteCode: toBool(process.env.REQUIRE_INVITE_CODE, false),
  inviteCodeSecret: process.env.INVITE_CODE_SECRET || "",
  inviteCodeTtlDays: Number(process.env.INVITE_CODE_TTL_DAYS || 7),
  inviteCookieName: process.env.INVITE_COOKIE_NAME || "gbl_invite",
  siteUser: process.env.SITE_USER || "",
  sitePassword: process.env.SITE_PASSWORD || "",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  allowedOrigins: toList(process.env.ALLOWED_ORIGINS),
  nba2kApiEnabled: toBool(process.env.NBA2K_API_ENABLED, false),
  nba2kApiBaseUrl: (process.env.NBA2K_API_BASE_URL || "").replace(/\/+$/, ""),
  nba2kApiPlayersPath: process.env.NBA2K_API_PLAYERS_PATH || "/players",
  nba2kApiKey: process.env.NBA2K_API_KEY || "",
  nba2kApiKeyHeader: process.env.NBA2K_API_KEY_HEADER || "x-api-key",
  nba2kApiTimeoutMs: Number(process.env.NBA2K_API_TIMEOUT_MS || 4500),
  nba2kApiMaxRequestsPerHour: Number(process.env.NBA2K_API_MAX_REQUESTS_PER_HOUR || 450),
  nba2kSimilarityCacheTtlMs: Number(process.env.NBA2K_SIMILARITY_CACHE_TTL_MS || 21600000),
};

export function assertProdConfig() {
  if (config.requireAuth && (!config.supabaseUrl || !config.supabaseServiceRoleKey)) {
    throw new Error("REQUIRE_AUTH=true but SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are missing");
  }

  if (config.requireSitePassword && (!config.siteUser || !config.sitePassword)) {
    throw new Error("REQUIRE_SITE_PASSWORD=true but SITE_USER/SITE_PASSWORD are missing");
  }

  if (config.requireInviteCode && !config.inviteCodeSecret) {
    throw new Error("REQUIRE_INVITE_CODE=true but INVITE_CODE_SECRET is missing");
  }

  if (config.requireInviteCode && config.requireSitePassword) {
    throw new Error("Use either REQUIRE_INVITE_CODE or REQUIRE_SITE_PASSWORD, not both");
  }

  if (config.nba2kApiEnabled && (!config.nba2kApiBaseUrl || !config.nba2kApiKey)) {
    throw new Error("NBA2K_API_ENABLED=true but NBA2K_API_BASE_URL/NBA2K_API_KEY are missing");
  }
}
