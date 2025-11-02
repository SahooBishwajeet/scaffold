import { Request, Response } from "express";
import {
  login as loginUserService,
  register as registerUserService,
} from "../services/auth.service";
import ApiResponse from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// @desc   Register a new user
// @route  POST /api/v1/auth/register
// @access Public
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

// @desc   Login user
// @route  POST /api/v1/auth/login
// @access Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, token } = await loginUserService({ email, password });

  res
    .status(200)
    .json(new ApiResponse(200, { user, token }, "User logged in successfully"));
});
