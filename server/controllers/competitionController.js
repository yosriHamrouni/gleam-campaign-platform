// server/controllers/competitionController.js
import mongoose from "mongoose";
import Competition from "../models/Competition.js";
import Entry from "../models/Entry.js";
import { env } from "../config/env.js";
import { HttpError } from "../lib/httpError.js";
import {
  computeEntries,
  drawWinners,
  makeShortCode,
  slugify,
  validateCompetitionInput,
} from "../lib/competitionRules.js";

const shareUrlFor = (c) => `${env.clientUrl}/c/${c._id}`;

const withShareUrl = (c) => ({ ...c.toJSON(), shareUrl: shareUrlFor(c) });

// Loads a competition the current user may manage (its creator, or an admin).
async function loadOwned(id, user) {
  const competition = await Competition.findById(id);
  if (!competition) throw new HttpError(404, "Competition not found");
  const isOwner = String(competition.createdBy) === String(user.id);
  if (!isOwner && user.role !== "admin") throw new HttpError(403, "You can only manage your own competitions");
  return competition;
}

// Recomputes participants / totalEntries from the Entry collection, so counters can't drift.
async function refreshCounters(competitionId) {
  const [agg] = await Entry.aggregate([
    { $match: { competition: new mongoose.Types.ObjectId(String(competitionId)) } },
    { $group: { _id: null, participants: { $sum: 1 }, totalEntries: { $sum: "$entries" } } },
  ]);
  return Competition.findByIdAndUpdate(
    competitionId,
    { participants: agg?.participants || 0, totalEntries: agg?.totalEntries || 0 },
    { new: true }
  );
}

// GET /api/competitions — the signed-in creator's competitions (?status=active|scheduled|ended|drawn)
export const listCompetitions = async (req, res) => {
  const filter = req.user.role === "admin" && req.query.all === "1" ? {} : { createdBy: req.user.id };
  const competitions = await Competition.find(filter).sort({ createdAt: -1 });
  const { status } = req.query;
  const items = competitions.filter((c) => !status || c.status === status).map(withShareUrl);
  res.json(items);
};

// GET /api/competitions/:id/manage — full document for its creator.
export const getOwnedCompetition = async (req, res) => {
  const competition = await loadOwned(req.params.id, req.user);
  res.json(withShareUrl(competition));
};

// GET /api/competitions/:id — public campaign page; includes the caller's own entry when signed in.
export const getCompetition = async (req, res) => {
  const competition = await Competition.findById(req.params.id).populate("createdBy", "name");
  if (!competition) throw new HttpError(404, "Competition not found");

  const json = competition.toJSON();
  const payload = {
    id: json.id,
    title: json.title,
    description: json.description,
    prize: json.prize,
    type: json.type,
    coverImage: json.coverImage,
    startDate: json.startDate,
    endDate: json.endDate,
    status: json.status,
    winnersCount: json.winnersCount,
    participants: json.participants,
    totalEntries: json.totalEntries,
    actions: json.actions.map(({ _id, type, value, points, label }) => ({ id: _id, type, value, points, label })),
    host: competition.createdBy?.name || null,
    winners: json.winners.map((w) => ({ name: w.name })),
    drawnAt: json.drawnAt,
    shareUrl: shareUrlFor(competition),
    isOwner: false,
    myEntry: null,
  };

  if (req.user) {
    payload.isOwner = String(competition.createdBy?._id) === String(req.user.id);
    const entry = await Entry.findOne({ competition: competition._id, user: req.user.id });
    if (entry) payload.myEntry = { completedActions: entry.completedActions.map(String), entries: entry.entries };
  }
  res.json(payload);
};

// POST /api/competitions
export const createCompetition = async (req, res) => {
  const { value, errors } = validateCompetitionInput(req.body);
  if (errors.length) throw new HttpError(400, "Please fix the highlighted fields", errors);

  const competition = await Competition.create({
    ...value,
    createdBy: req.user.id,
    slug: slugify(value.title),
    shortCode: makeShortCode(),
  });
  res.status(201).json(withShareUrl(competition));
};

// PATCH /api/competitions/:id — actions are locked once someone has entered.
export const updateCompetition = async (req, res) => {
  const competition = await loadOwned(req.params.id, req.user);
  if (competition.drawnAt) throw new HttpError(409, "Winners have been drawn; the competition can no longer be edited");

  const { value, errors } = validateCompetitionInput(
    { startDate: competition.startDate, endDate: competition.endDate, ...req.body },
    { partial: true }
  );
  if (errors.length) throw new HttpError(400, "Please fix the highlighted fields", errors);
  if (value.actions && competition.participants > 0) {
    throw new HttpError(409, "Actions cannot change after people have entered");
  }

  Object.assign(competition, value);
  if (value.title) competition.slug = slugify(value.title);
  await competition.save();
  res.json(withShareUrl(competition));
};

// DELETE /api/competitions/:id
export const deleteCompetition = async (req, res) => {
  const competition = await loadOwned(req.params.id, req.user);
  await Entry.deleteMany({ competition: competition._id });
  await competition.deleteOne();
  res.status(204).end();
};

// POST /api/competitions/:id/view — counts a page view for the engagement rate.
export const recordView = async (req, res) => {
  const updated = await Competition.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } }, { new: true });
  if (!updated) throw new HttpError(404, "Competition not found");
  res.status(204).end();
};

// POST /api/competitions/:id/enter  { completedActions: [actionId] }
// One entry document per participant: entering again updates it rather than adding a new one.
export const enterCompetition = async (req, res) => {
  const competition = await Competition.findById(req.params.id);
  if (!competition) throw new HttpError(404, "Competition not found");
  if (competition.status !== "active") throw new HttpError(409, `This competition is ${competition.status}`);
  if (String(competition.createdBy) === String(req.user.id)) {
    throw new HttpError(403, "You cannot enter your own competition");
  }

  const { completedActions, entries } = computeEntries(competition.actions, req.body?.completedActions);
  if (entries < 1) throw new HttpError(400, "Complete at least one action to enter");

  const entry = await Entry.findOneAndUpdate(
    { competition: competition._id, user: req.user.id },
    { completedActions, entries },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const updated = await refreshCounters(competition._id);

  res.json({
    myEntry: { completedActions: entry.completedActions.map(String), entries: entry.entries },
    participants: updated.participants,
    totalEntries: updated.totalEntries,
  });
};

// GET /api/competitions/:id/entries — participant list for the creator.
export const listEntries = async (req, res) => {
  const competition = await loadOwned(req.params.id, req.user);
  const entries = await Entry.find({ competition: competition._id })
    .populate("user", "name email")
    .sort({ entries: -1, createdAt: 1 });
  res.json(
    entries.map((e) => ({
      id: e._id,
      name: e.user?.name || "Deleted user",
      email: e.user?.email || null,
      entries: e.entries,
      completedActions: e.completedActions.length,
      enteredAt: e.createdAt,
      updatedAt: e.updatedAt,
    }))
  );
};

// POST /api/competitions/:id/draw  { early?: boolean }
// Weighted random draw by entries; a competition is drawn once.
export const drawCompetition = async (req, res) => {
  const competition = await loadOwned(req.params.id, req.user);
  if (competition.drawnAt) throw new HttpError(409, "Winners have already been drawn");
  if (competition.status === "scheduled") throw new HttpError(409, "The competition has not started yet");
  if (competition.status === "active" && !req.body?.early) {
    throw new HttpError(409, "The competition is still running; confirm an early draw to continue");
  }

  const entries = await Entry.find({ competition: competition._id }).populate("user", "name");
  const pool = entries.filter((e) => e.user).map((e) => ({ user: e.user._id, name: e.user.name, entries: e.entries }));
  if (pool.length === 0) throw new HttpError(400, "Nobody has entered this competition");

  competition.winners = drawWinners(pool, competition.winnersCount);
  competition.drawnAt = new Date();
  if (competition.endDate > competition.drawnAt) competition.endDate = competition.drawnAt;
  await competition.save();
  res.json(withShareUrl(competition));
};
