import { Router } from "express";
import { getNotebooksForUser } from "../controllers/notebook.controller";
import * as userController from "../controllers/user.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../models/user.model";

const router = Router();

router.use(protect);

// --- User-specific route ---
router.get("/me", userController.getMe);
router.put("/me", userController.updateMyProfile);
router.delete("/me", userController.deleteMyAccount);
router.put("/me/password", userController.changeMyPassword);

// --- Admin-only routes ---
router.use(authorizeRoles(UserRole.ADMIN));

router.get("/", userController.getAllUsers);
router.get("/deleted", userController.getDeletedUsers);

router.get("/:userId/notebooks", getNotebooksForUser);

router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

router.put("/:id/restore", userController.restoreUser);

export default router;
