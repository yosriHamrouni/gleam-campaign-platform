// server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // bcrypt hash — never returned by the API.
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
  return { id: this._id, name: this.name, email: this.email, role: this.role, createdAt: this.createdAt };
};

const User = mongoose.model("User", userSchema);
export default User;
