// server/models/Competition.js
import mongoose from "mongoose";

const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, default: "standard" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  entryFee: { type: Number, default: 0 },
  coverImage: { type: String, default: null },
  actions: [
    {
      type: { type: String },
      value: { type: String },
      points: { type: Number, default: 10 },
      label: { type: String },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  slug: { type: String, default: null },
  shortCode: { type: String, default: null },
  participants: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  totalEntries: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Competition = mongoose.model("Competition", competitionSchema);
export default Competition;
