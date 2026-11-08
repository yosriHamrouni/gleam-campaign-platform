// server/routes/authRoutes.js
import express from "express";
import { login, register, me } from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import { asyncHandler } from "../lib/httpError.js";

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", auth, asyncHandler(me));

export default router;
