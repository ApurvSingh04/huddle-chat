import { getEnv } from "../utils/get-env.js";

export const Env = {
  PORT: getEnv("PORT", "5000"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1h"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:3000"),

  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
  GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),
  AI_USER_ID: getEnv("AI_USER_ID"),
}; 