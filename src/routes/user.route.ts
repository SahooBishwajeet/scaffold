import { Request, Response, Router } from "express";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../models/user.model";
import ApiResponse from "../utils/apiResponse";

const router = Router();

router.get("/me", protect, (req: Request, res: Response) => {
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: req.user },
        "User profile fetched successfully"
      )
    );
});

router.get(
  "/admin-test",
  protect,
  authorizeRoles(UserRole.ADMIN),
  (req: Request, res: Response) => {
    res
      .status(200)
      .json(new ApiResponse(200, null, "Admin access granted successfully"));
  }
);

export default router;
