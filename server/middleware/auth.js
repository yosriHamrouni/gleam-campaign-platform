// server/middleware/auth.js
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const readToken = (req) => {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
};

const decode = (token) => {
  const payload = jwt.verify(token, env.jwtSecret);
  return { id: payload.id, role: payload.role };
};

// Rejects the request unless it carries a valid token.
export default function auth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: "Missing Authorization token" });
  try {
    req.user = decode(token);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Attaches req.user when a valid token is present; anonymous requests pass through.
export function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = decode(token);
    } catch {
      // An expired token on a public route is treated as anonymous.
    }
  }
  next();
}
