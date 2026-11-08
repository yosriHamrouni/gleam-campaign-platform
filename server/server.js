// server/server.js — connects to MongoDB, then starts the API.
import app from "./app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";

try {
  await connectDB();
} catch (err) {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
}

const server = app.listen(env.port, () => {
  console.log(`✅ API running on http://localhost:${env.port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${env.port} is already in use. Set PORT in .env or stop the other process.`);
    process.exit(1);
  }
  throw err;
});
