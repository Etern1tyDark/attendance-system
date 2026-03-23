import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getRequiredEnv = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV?.trim() || "development",
  port: parseNumber(process.env.PORT, 3001),
  mongoDbUri: getRequiredEnv("MONGODB_URI"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || "1h",
  clientUrl: process.env.CLIENT_URL?.trim() || "http://localhost:3000",
  bcryptSaltRounds: parseNumber(process.env.BCRYPT_SALT_ROUNDS, 10),
  adminName: process.env.ADMIN_NAME?.trim() || "System Administrator",
  adminEmail: process.env.ADMIN_EMAIL?.trim() || "",
  adminPassword: process.env.ADMIN_PASSWORD?.trim() || "",
};

export default env;
