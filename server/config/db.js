// server/config/db.js
import mongoose from "mongoose";
import { env } from "./env.js";

const connectDB = async (uri = env.mongoUri) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
};

export default connectDB;
