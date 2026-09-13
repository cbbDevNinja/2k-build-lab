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
}
