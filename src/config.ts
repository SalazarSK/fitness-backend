import dotenv from "dotenv";
import path from "path";

const envFile =
  process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev";
dotenv.config({ path: path.resolve(__dirname, "..", envFile) });

function getEnvVariable(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(getEnvVariable("PORT")),
  jwtSecret: getEnvVariable("JWT_SECRET"),
};
