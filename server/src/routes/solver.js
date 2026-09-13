import { Router } from "express";
import { z } from "zod";
import { evaluateBuild } from "../protected/build-logic.js";
import { solverRateLimit } from "../middleware/rate.js";
import { requireAuth } from "../middleware/auth.js";

const BodySchema = z.object({
  position: z.number().int().min(0).max(4).optional(),
  heightIn: z.number().int().min(69).max(88).optional(),
  weightLb: z.number().int().min(145).max(290).optional(),
  wingspanIn: z.number().int().min(72).max(96).optional(),
  attributes: z.array(z.number()).length(21),
  finalAttributes: z.array(z.number()).length(21).optional(),
  bodyHb: z.number().int().min(0).max(30),
  bodyCaps: z.array(z.number()).length(21),
  capBreakers: z.number().int().min(0).max(15).optional(),
});

export function solverRouter() {
  const r = Router();

  r.post("/evaluate", solverRateLimit, requireAuth, async (req, res) => {
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid payload",
        details: parsed.error.flatten(),
      });
    }

    try {
      const out = await evaluateBuild(parsed.data);
      return res.json({ ok: true, auth: req.auth, result: out });
    } catch (err) {
      return res.status(400).json({
        error: err instanceof Error ? err.message : "Could not evaluate build",
      });
    }
  });

  return r;
}
