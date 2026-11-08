// server/config/env.js
// Central place for configuration read from the environment (.env in development).
import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

const DEV_JWT_SECRET = "dev-only-secret-change-me";
if (isProduction && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production");
}
if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET not set — using an insecure development secret.");
}

export const env = {
  isProduction,
  port: Number(process.env.PORT) || 3009,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gleam",
  jwtSecret: process.env.JWT_SECRET || DEV_JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // Public URL of the React app, used to build share links and for CORS.
  clientUrl: (process.env.CLIENT_URL || "http://localhost:3008").replace(/\/$/, ""),
};
