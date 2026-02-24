import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (payload, expiresIn = "1h") => {
  if (!process.env.SECRET_KEY) {
    throw new Error("JWT secret key is not defined in .env");
  }

  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
};