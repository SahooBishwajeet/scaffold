import jwt from "jsonwebtoken";
import { Config } from "../config";
import ApiError from "./apiError";

export interface IJwtPayload {
  id: string;
  role: string;
}

export const signToken = (payload: IJwtPayload): string => {
  if (!Config.JWT_SECRET) {
    throw new ApiError(
      500,
      "JWT_SECRET is not defined in environment variables"
    );
  }

  return jwt.sign(payload, Config.JWT_SECRET, {
    expiresIn: Config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): IJwtPayload => {
  if (!Config.JWT_SECRET) {
    throw new ApiError(
      500,
      "JWT_SECRET is not defined in environment variables"
    );
  }

  try {
    const decoded = jwt.verify(token, Config.JWT_SECRET) as IJwtPayload;
    return decoded;
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
};
