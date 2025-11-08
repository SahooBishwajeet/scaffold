import { Router } from "express";
import * as noteController from "../controllers/note.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../models/user.model";

const router = Router();

router.use(protect);

// -- Admin-only routes (Static) --

/**
 * @swagger
 * /notes/all/notes:
 *   get:
 *     summary: Get all notes (Admin)
 *     description: Fetches a list of all non-deleted notes from all users.
 *     tags: [Note (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: A list of all notes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "All notes fetched" }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  "/all/notes",
  authorizeRoles(UserRole.ADMIN),
  noteController.getAllNotes
);

/**
 * @swagger
 * /notes/all/deleted:
 *   get:
 *     summary: Get all soft-deleted notes (Admin)
 *     description: Fetches a list of all soft-deleted notes from all users.
 *     tags: [Note (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: A list of all soft-deleted notes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Deleted notes fetched" }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  "/all/deleted",
  authorizeRoles(UserRole.ADMIN),
  noteController.getDeletedNotes
);

/**
 * @swagger
 * /notes/admin/search:
 *   post:
 *     summary: Search all notes (Admin)
 *     description: Performs a complex search on all notes from all users.
 *     tags: [Note (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchBody'
 *     responses:
 *       "200":
 *         description: A list of matching notes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Admin search results fetched" }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       "400":
 *         $ref: '#/components/responses/BadRequestError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  "/admin/search",
  authorizeRoles(UserRole.ADMIN),
  noteController.adminSearchAllNotes
);

// -- User routes (Static) --

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all of the user's notes
 *     description: Fetches a list of all non-deleted notes belonging to the currently authenticated user, across all notebooks.
 *     tags: [Note (Self)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: A list of all the user's notes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "All notes fetched successfully" }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", noteController.getAllMyNotes);

/**
 * @swagger
 * /notes/search:
 *   post:
 *     summary: Search a user's notes
 *     description: Performs a complex search on the logged-in user's notes across all notebooks.
 *     tags: [Note (Self)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchBody'
 *     responses:
 *       "200":
 *         description: A list of matching notes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Search results fetched" }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       "400":
 *         $ref: '#/components/responses/BadRequestError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/search", noteController.searchMyNotes);

/**
 * @swagger
 * /notes/{noteId}/move:
 *   put:
 *     summary: Move a note to a different notebook
 *     description: Atomically moves a note from its current notebook to a new one.
 *     tags: [Note (Self)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NoteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoveNoteBody'
 *     responses:
 *       "200":
 *         description: Note moved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Note moved successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       "400":
 *         description: Bad request (e.g., newNotebookId is missing)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "404":
 *         description: Note or target notebook not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put("/:noteId/move", noteController.moveMyNote);

// -- Admin-only routes (Parameterized) --

/**
 * @swagger
 * /notes/{noteId}/restore:
 *   put:
 *     summary: Restore a soft-deleted note (Admin)
 *     description: Restores a note that was previously soft-deleted.
 *     tags: [Note (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NoteId'
 *     responses:
 *       "200":
 *         description: Note restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Note restored" }
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         description: Deleted note not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put(
  "/:noteId/restore",
  authorizeRoles(UserRole.ADMIN),
  noteController.restoreNote
);

/**
 * @swagger
 * /notes/admin/{noteId}:
 *   get:
 *     summary: Get any single note by ID (Admin)
 *     description: Fetches any single note by its UUID, bypassing ownership checks.
 *     tags: [Note (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NoteId'
 *     responses:
 *       "200":
 *         description: Note details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Note fetched by admin" }
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update any single note by ID (Admin)
 *     description: Allows an admin to update any note's details.
 *     tags: [Note (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NoteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNoteBody'
 *     responses:
 *       "200":
 *         description: Note updated by admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Note updated by admin" }
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete any single note by ID (Admin)
 *     description: Allows an admin to soft-delete any note.
 *     tags: [Note (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NoteId'
 *     responses:
 *       "200":
 *         description: Note deleted by admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Note deleted by admin" }
 *                 data: { type: object, nullable: true, example: null }
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router
  .route("/admin/:noteId")
  .get(authorizeRoles(UserRole.ADMIN), noteController.adminGetNoteById)
  .put(authorizeRoles(UserRole.ADMIN), noteController.adminUpdateNote)
  .delete(authorizeRoles(UserRole.ADMIN), noteController.adminDeleteNote);

// -- User routes (Parameterized) --

/**
 * @swagger
 * /notes/{noteId}:
 *   get:
 *     summary: Get a single note by ID
 *     description: Fetches one of the user's notes by its UUID.
 *     tags: [Note (Self)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NoteId'
 *     responses:
 *       "200":
 *         description: Note details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Note fetched successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update a note by ID
 *     description: Updates one of the user's notes by its UUID.
 *     tags: [Note (Self)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NoteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNoteBody'
 *     responses:
 *       "200":
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Note updated successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete a note by ID
 *     description: Soft-deletes one of the user's notes by its UUID.
 *     tags: [Note (Self)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NoteId'
 *     responses:
 *       "200":
 *         description: Note deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Note deleted successfully" }
 *                 data: { type: object, nullable: true, example: null }
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router
  .route("/:noteId")
  .get(noteController.getMyNoteById)
  .put(noteController.updateMyNote)
  .delete(noteController.deleteMyNote);

export default router;
