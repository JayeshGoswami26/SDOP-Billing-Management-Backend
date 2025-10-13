import mongoose from "mongoose";
import config from "./index.js";
import logger from "../utils/logger.js";

export async function connectDB() {
  if (!config.mongoUri) {
    throw new Error("MONGODB_URI not set");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongoUri);

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error:", err);
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
