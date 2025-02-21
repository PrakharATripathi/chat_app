import mongoose from "mongoose";
import { mongodb_uri } from "../constant/constant.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongodb_uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    console.log(`Connection options: ${JSON.stringify(conn.connection.options)}`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
    console.error("Error details:", error.message);
  }
};