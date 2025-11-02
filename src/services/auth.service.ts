import UserModel, { IUser } from "../models/user.model";
import ApiError from "../utils/apiError";
import { IJwtPayload, signToken } from "../utils/jwt";

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

  return {
    user: newUser,
    token: token,
  };
};

/**
 * Logs in a user.
 * @param credentials - Email and Password of the user
 * @returns The user and a JWT token
 */
export const login = async (
  credentials: Pick<IUser, "email" | "password">
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

  return {
    user: user,
    token: token,
  };
};
