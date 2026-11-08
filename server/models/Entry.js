// server/models/Entry.js
// One document per participant per competition: re-submitting updates it
// instead of counting the same person twice.
import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: "Competition", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // _ids of the competition actions this participant completed.
    completedActions: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    entries: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

entrySchema.index({ competition: 1, user: 1 }, { unique: true });

const Entry = mongoose.model("Entry", entrySchema);
export default Entry;
