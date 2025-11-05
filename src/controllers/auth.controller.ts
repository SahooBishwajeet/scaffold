import { Request, Response } from "express";
import {
  forgotPasswordService,
  login as loginUserService,
  register as registerUserService,
  resetPasswordService,
} from "../services/auth.service";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * @desc   Register a new user
 * @route  POST /api/v1/auth/register
 * @access Public
 */
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const { user, token } = await registerUserService({
      name,
      email,
      password,
    });

    res
      .status(201)
      .json(
        new ApiResponse(201, { user, token }, "User registered successfully")
      );
  }
);

/**
 * @desc   Login user
 * @route  POST /api/v1/auth/login
 * @access Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const loginInfo = {
    ip: req.ip || "Unknown IP",
    userAgent: req.headers["user-agent"] || "Unknown User-Agent",
  };

  const { user, token } = await loginUserService(
    { email, password },
    loginInfo
  );

  res
    .status(200)
    .json(new ApiResponse(200, { user, token }, "User logged in successfully"));
});

/**
 * @desc   Forgot Password
 * @route  POST /api/v1/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    await forgotPasswordService(email);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "If that email address is in our database, we will send you an email to reset your password"
        )
      );
  }
);

/**
 * @desc   Reset Password
 * @route  POST /api/v1/auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(400, "Token and new password are required");
    }

    const { user, token: loginToken } = await resetPasswordService(
      token,
      newPassword
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user, token: loginToken },
          "Password has been reset successfully"
        )
      );
  }
);
