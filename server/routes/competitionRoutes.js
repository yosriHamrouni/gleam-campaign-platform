// server/routes/competitionRoutes.js
import express from "express";
import { getCompetitions, createCompetition, getCompetitionById, participateInCompetition } from "../controllers/competitionController.js";

const router = express.Router();

// 🟢 GET all competitions
router.get("/", getCompetitions);

// 🟢 POST new competition
router.post("/", createCompetition);

// GET competition by id
router.get("/:id", getCompetitionById);

// POST participate in a competition
router.post("/:id/participate", participateInCompetition);

export default router;
