import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);

    console.log(
      `🟢 MongoDB Connected: ${conn.connection.host}`
    );
  } catch (error) {
    console.error("🔴 MongoDB connection failed:", error.message);
    process.exit(1); // Exit process if DB fails
  }
};
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});
