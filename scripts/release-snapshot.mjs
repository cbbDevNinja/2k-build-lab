import { execSync } from "node:child_process";

function run(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim();
}

function usage() {
  console.log("Usage: npm run release:snapshot -- [note] [--push]");
  console.log("Example: npm run release:snapshot -- \"before ux pass\" --push");
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const shouldPush = args.includes("--push");
const note = args.filter((a) => !a.startsWith("--")).join(" ").trim();

let status;
try {
  status = run("git status --porcelain");
} catch {
  console.error("Not a git repository or git is unavailable.");
  process.exit(1);
}

if (status) {
  console.error("Working tree is not clean. Commit or stash changes before snapshotting.");
  process.exit(1);
}

const now = new Date();
const tag = `v${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, "0")}.${String(now.getUTCDate()).padStart(2, "0")}-${String(now.getUTCHours()).padStart(2, "0")}${String(now.getUTCMinutes()).padStart(2, "0")}${String(now.getUTCSeconds()).padStart(2, "0")}`;
const commit = run("git rev-parse --short HEAD");
const message = `snapshot ${tag}${note ? ` - ${note}` : ""} (commit ${commit})`;

try {
  execSync(`git tag -a ${tag} -m ${JSON.stringify(message)}`, { stdio: "inherit" });
} catch {
  console.error("Failed to create tag.");
  process.exit(1);
}

if (shouldPush) {
  try {
    execSync(`git push origin ${tag}`, { stdio: "inherit" });
  } catch {
    console.error("Tag created locally, but push failed.");
    process.exit(1);
  }
}

console.log(`Created snapshot tag: ${tag}`);
console.log("Safe rollback commands:");
console.log(`  git switch -c rollback/${tag} ${tag}`);
console.log("  git log --oneline --decorate -n 5");
