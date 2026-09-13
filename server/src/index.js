import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config, assertProdConfig } from "./config.js";
import { solverRouter } from "./routes/solver.js";
import { mountInviteRoutes, requireInviteCode } from "./middleware/invite-code.js";

assertProdConfig();

const app = express();
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function requireSitePassword(req, res, next) {
  if (!config.requireSitePassword) return next();

  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Friends Only"');
    return res.status(401).send("Authentication required");
  }

  const encoded = auth.slice(6);
  let decoded = "";
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    res.setHeader("WWW-Authenticate", 'Basic realm="Friends Only"');
    return res.status(401).send("Bad credentials");
  }

  const sep = decoded.indexOf(":");
  const user = sep >= 0 ? decoded.slice(0, sep) : "";
  const pass = sep >= 0 ? decoded.slice(sep + 1) : "";
  if (user !== config.siteUser || pass !== config.sitePassword) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Friends Only"');
    return res.status(401).send("Invalid credentials");
  }

  return next();
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "200kb" }));

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (!config.allowedOrigins.length) return cb(null, true);
      return cb(config.allowedOrigins.includes(origin) ? null : new Error("CORS blocked"), true);
    },
    credentials: true,
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "goated-solver-api", env: config.nodeEnv });
});

mountInviteRoutes(app);
app.use(requireInviteCode);
app.use(requireSitePassword);

app.use("/api/solver", solverRouter());

app.use(express.static(rootDir));
app.get("/", (_req, res) => {
  res.sendFile(path.join(rootDir, "goated-build-lab.free.html"));
});

app.use((err, _req, res, _next) => {
  const msg = err instanceof Error ? err.message : "Server error";
  res.status(500).json({ error: msg });
});

app.listen(config.port, () => {
  console.log(`Solver API listening on http://localhost:${config.port}`);
});
