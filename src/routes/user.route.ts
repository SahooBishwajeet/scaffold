import { Router } from "express";
import * as noteController from "../controllers/note.controller";
import * as notebookController from "../controllers/notebook.controller";
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
router.get("/search", userController.adminSearchUsers);

router.get("/:userId/notebooks", notebookController.getNotebooksForUser);
router.get("/:userId/notes", noteController.getNotesForUser);
router.post("/:userId/notes/search", noteController.adminSearchNotesForUser);
router.post(
  "/:userId/notebooks/search",
  notebookController.adminSearchNotebooksForUser
);

router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

router.put("/:id/restore", userController.restoreUser);

export default router;
