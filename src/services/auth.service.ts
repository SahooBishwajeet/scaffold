import crypto from "crypto";
import UserModel, { IUser } from "../models/user.model";
import ApiError from "../utils/apiError";
import { IJwtPayload, signToken } from "../utils/jwt";
import {
  sendLoginAlertEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "./mail.service";

interface IAuthResponse {
  user: Omit<IUser, "comparePassword">;
  token: string;
}

/**
 * Registers a new user.
 * @param userData - Name, Email and Password of the user to be registered
 * @returns The new user and a JWT token
 */
export const register = async (
  userData: Pick<IUser, "name" | "email" | "password">
): Promise<IAuthResponse> => {
  const { name, email, password } = userData;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const newUser = new UserModel({
    name,
    email,
    password,
  });

  await newUser.save();

  const payload: IJwtPayload = {
    id: newUser.id,
    role: newUser.role,
  };
  const token = signToken(payload);

  // -- Send welcome email --
  sendWelcomeEmail(newUser.email, newUser.name);

  return {
    user: newUser,
    token: token,
  };
};

/**
 * Logs in a user.
 * @param credentials - Email and Password of the user
 * @param loginInfo - IP address and User-Agent of the login request
 * @returns The user and a JWT token
 */
export const login = async (
  credentials: Pick<IUser, "email" | "password">,
  loginInfo: { ip: string; userAgent: string }
): Promise<IAuthResponse> => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await UserModel.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const payload: IJwtPayload = {
    id: user.id,
    role: user.role,
  };
  const token = signToken(payload);

  // -- Send login alert email --
  sendLoginAlertEmail(user.email, loginInfo.ip, loginInfo.userAgent);

  return {
    user: user,
    token: token,
  };
};

/**
 * Sends a password reset email to the user.
 * @param email - Email of the user requesting password reset
 */
export const forgotPasswordService = async (email: string): Promise<void> => {
  const user = await UserModel.findOne({
    email,
  });

  if (!user) {
    return;
  }

  const plainToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(plainToken)
    .digest("hex");

  const validityDuration = 10 * 60 * 1000; // 10 minutes

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + validityDuration);

  try {
    await user.save();

    sendPasswordResetEmail(user.email, plainToken);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    throw new ApiError(500, "Error sending password reset email");
  }
};

/** Resets the user's password using a valid reset token.
 * @param token - Password reset token
 * @param newPassword - New password to be set
 * @returns The user and a JWT token
 */
export const resetPasswordService = async (
  token: string,
  newPassword: string
): Promise<IAuthResponse> => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }, // Token is not expired
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const payload: IJwtPayload = {
    id: user.id,
    role: user.role,
  };
  const loginToken = signToken(payload);

  return {
    user: user,
    token: loginToken,
  };
};
