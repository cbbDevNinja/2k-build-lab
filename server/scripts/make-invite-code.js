import { config } from "../src/config.js";
import { createInviteCode } from "../src/middleware/invite-code.js";

const label = process.argv[2] || "friend";
const days = Number(process.argv[3] || 7);

if (!config.inviteCodeSecret) {
  console.error("Missing INVITE_CODE_SECRET in server/.env");
  process.exit(1);
}

const code = createInviteCode(label, days);
const exp = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
console.log(code);
console.error(`label=${label} ttlDays=${days} expires=${exp}`);
