import { Router } from "express";
import * as noteController from "../controllers/note.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../models/user.model";

const router = Router();

router.use(protect);

// -- User-specific route --
router.get("/", noteController.getAllMyNotes);
router.post("/search", noteController.searchMyNotes);

router.get("/:noteId", noteController.getMyNoteById);
router.put("/:noteId", noteController.updateMyNote);
router.delete("/:noteId", noteController.deleteMyNote);

router.put("/:noteId/move", noteController.moveMyNote);

// --- Admin-only routes ---
router.use(authorizeRoles(UserRole.ADMIN));

router.get("/all/notes", noteController.getAllNotes);
router.get("/all/deleted", noteController.getDeletedNotes);
router.put("/:noteId/restore", noteController.restoreNote);

router.post("/admin/search", noteController.adminSearchAllNotes);

router.get("/admin/:noteId", noteController.adminGetNoteById);
router.put("/admin/:noteId", noteController.adminUpdateNote);
router.delete("/admin/:noteId", noteController.adminDeleteNote);

export default router;
