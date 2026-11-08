// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { HttpError } from "../lib/httpError.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

// POST /api/auth/register — every new account is a regular user; the role is never taken from the request.
export const register = async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");

  const errors = [];
  if (!name) errors.push("name is required");
  if (!EMAIL_RE.test(email)) errors.push("a valid email is required");
  if (password.length < 8) errors.push("password must be at least 8 characters");
  if (errors.length) throw new HttpError(400, errors[0], errors);

  if (await User.exists({ email })) throw new HttpError(409, "An account with this email already exists");

  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: signToken(user), user: user.toPublic() });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!email || !password) throw new HttpError(400, "Email and password are required");

  const user = await User.findOne({ email }).select("+password");
  // Same message whether the email or the password is wrong.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, "Invalid email or password");
  }
  res.json({ token: signToken(user), user: user.toPublic() });
};

// GET /api/auth/me
export const me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new HttpError(404, "User not found");
  res.json(user.toPublic());
};
