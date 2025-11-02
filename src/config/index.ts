import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  // --- Basic App Config ---
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  IS_PRODUCTION: process.env.NODE_ENV === "production",

  // --- Database ---
  DB_URI: process.env.DB_URI || "mongodb://localhost:27017/backend_template",

  // --- Security ---
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // --- Mail Service (Nodemailer) ---
  // MAIL_HOST: process.env.MAIL_HOST,
  // MAIL_PORT: parseInt(process.env.MAIL_PORT || '587', 10),
  // MAIL_USER: process.env.MAIL_USER,
  // MAIL_PASS: process.env.MAIL_PASS,
};

export const Config = Object.freeze(config);
