import rateLimit from "express-rate-limit";

export const solverRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many solver requests. Try again in a minute." },
});
