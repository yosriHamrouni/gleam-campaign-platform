// server/app.js — the Express app, separate from server.js so it can be imported without listening.
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import competitionRoutes from "./routes/competitionRoutes.js";
import { errorHandler, notFound } from "./middleware/errors.js";

const app = express();

app.use(cors({ origin: env.isProduction ? env.clientUrl : true }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/competitions", competitionRoutes);

app.use("/api", notFound);
app.use(errorHandler);

export default app;
