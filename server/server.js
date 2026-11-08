// server/server.js
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import competitionRoutes from "./routes/competitionRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Healthcheck route
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// API routes
app.use("/api/competitions", competitionRoutes);
app.use("/api/auth", authRoutes);

// Connect to MongoDB
await connectDB();

// Port configuration
const PORT = process.env.PORT || 3009;

// Start server with port conflict handling
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    const newPort = PORT + 1;
    console.warn(`⚠️ Port ${PORT} already in use. Retrying on ${newPort}...`);
    app.listen(newPort, () =>
      console.log(`✅ Server running on http://localhost:${newPort}`)
    );
  } else {
    throw err;
  }
});
