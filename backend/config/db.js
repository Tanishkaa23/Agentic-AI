
import mongoose from "mongoose";
import dns from "dns";
import {config} from "dotenv";
config()
dns.setServers(["8.8.8.8"])
export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  await mongoose.connect(mongoUri);

  console.log("MongoDB connected successfully");
}