import { Router } from "express";
import * as notebookController from "../controllers/notebook.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../models/user.model";

const router = Router();

router.use(protect);

// -- User-specific route --
router.post("/", notebookController.createNotebook);
router.get("/", notebookController.getMyNotebooks);

router.get("/:id", notebookController.getMyNotebookById);
router.put("/:id", notebookController.updateMyNotebookById);
router.delete("/:id", notebookController.deleteMyNotebookById);

// --- Admin-only routes ---
router.use(authorizeRoles(UserRole.ADMIN));

router.get("/all/notebooks", notebookController.getAllNotebooks);
router.get("/all/deleted", notebookController.getDeletedNotebooks);
router.put("/:id/restore", notebookController.restoreNotebook);

router.put("/admin/:id", notebookController.adminUpdateNotebook);
router.delete("/admin/:id", notebookController.adminDeleteNotebook);

export default router;
