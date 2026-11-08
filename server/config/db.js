import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // force l’IPv4
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gleam";
    mongoose.set("strictQuery", true); // supprime l’avertissement Mongoose 7
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
