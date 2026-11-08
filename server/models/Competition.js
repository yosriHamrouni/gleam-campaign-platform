// server/models/Competition.js
import mongoose from "mongoose";
import { ACTION_TYPES, COMPETITION_TYPES } from "../lib/competitionRules.js";

const actionSchema = new mongoose.Schema({
  type: { type: String, enum: ACTION_TYPES, required: true },
  // What the participant acts on: a handle, channel name or URL.
  value: { type: String, required: true, trim: true, maxlength: 300 },
  // Entries this action is worth.
  points: { type: Number, default: 1, min: 1, max: 100 },
  label: { type: String, trim: true, maxlength: 120 },
});

const winnerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    entries: Number,
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    type: { type: String, enum: COMPETITION_TYPES, default: "standard" },
    prize: { type: String, trim: true, maxlength: 200, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    coverImage: { type: String, trim: true, default: null },
    winnersCount: { type: Number, default: 1, min: 1, max: 100 },
    actions: { type: [actionSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    slug: { type: String, default: null },
    shortCode: { type: String, default: null, index: true },
    // Denormalised counters, recomputed from the Entry collection.
    participants: { type: Number, default: 0 },
    totalEntries: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    winners: { type: [winnerSchema], default: [] },
    drawnAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

competitionSchema.virtual("status").get(function status() {
  if (this.drawnAt) return "drawn";
  const now = Date.now();
  if (this.startDate && now < this.startDate.getTime()) return "scheduled";
  if (this.endDate && now > this.endDate.getTime()) return "ended";
  return "active";
});

const Competition = mongoose.model("Competition", competitionSchema);
export default Competition;
