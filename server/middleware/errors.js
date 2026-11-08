// server/middleware/errors.js
import mongoose from "mongoose";

export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: "Invalid id" });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ message: "Duplicate value" });
  }
  const status = err.status || 500;
  if (status >= 500) console.error("[API ERROR]", err);
  res.status(status).json({
    message: status >= 500 ? "Internal server error" : err.message,
    ...(err.details ? { errors: err.details } : {}),
  });
};
