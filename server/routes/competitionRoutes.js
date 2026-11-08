// server/routes/competitionRoutes.js
import express from "express";
import {
  createCompetition,
  deleteCompetition,
  drawCompetition,
  enterCompetition,
  getCompetition,
  getOwnedCompetition,
  listCompetitions,
  listEntries,
  recordView,
  updateCompetition,
} from "../controllers/competitionController.js";
import auth, { optionalAuth } from "../middleware/auth.js";
import { asyncHandler as h } from "../lib/httpError.js";

const router = express.Router();

// Creator area (signed in)
router.get("/", auth, h(listCompetitions));
router.post("/", auth, h(createCompetition));
router.patch("/:id", auth, h(updateCompetition));
router.delete("/:id", auth, h(deleteCompetition));
router.get("/:id/manage", auth, h(getOwnedCompetition));
router.get("/:id/entries", auth, h(listEntries));
router.post("/:id/draw", auth, h(drawCompetition));

// Public campaign page
router.get("/:id", optionalAuth, h(getCompetition));
router.post("/:id/view", h(recordView));
router.post("/:id/enter", auth, h(enterCompetition));

export default router;
