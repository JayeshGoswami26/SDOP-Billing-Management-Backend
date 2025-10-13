import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || "",
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  jwt: {
    secret: process.env.JWT_SECRET || "878ba60cf7fe67a3a28f9552df4149035635daa2e7f7ee31212ec5a19d3c4d3",
    expiresIn: process.env.JWT_EXPIRES_IN || "90d",
  },
};

export default config;
