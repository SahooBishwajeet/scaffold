import { Router } from "express";
import * as noteController from "../controllers/note.controller";
import * as notebookController from "../controllers/notebook.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../models/user.model";

const router = Router();

router.use(protect);

// -- Admin-only routes (Static) --

/**
 * @swagger
 * /notebooks/all/notebooks:
 *   get:
 *     summary: Get all notebooks (Admin)
 *     description: Fetches a list of all non-deleted notebooks from all users.
 *     tags: [Notebook (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: A list of all notebooks.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "All notebooks fetched" }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notebook'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  "/all/notebooks",
  authorizeRoles(UserRole.ADMIN),
  notebookController.getAllNotebooks
);

/**
 * @swagger
 * /notebooks/all/deleted:
 *   get:
 *     summary: Get all soft-deleted notebooks (Admin)
 *     description: Fetches a list of all soft-deleted notebooks from all users.
 *     tags: [Notebook (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: A list of all soft-deleted notebooks.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Deleted notebooks fetched" }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notebook'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  "/all/deleted",
  authorizeRoles(UserRole.ADMIN),
  notebookController.getDeletedNotebooks
);

/**
 * @swagger
 * /notebooks/admin/search:
 *   post:
 *     summary: Search all notebooks (Admin)
 *     description: Performs a complex search on all notebooks from all users.
 *     tags: [Notebook (Admin)]
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
 *         description: A list of matching notebooks.
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
 *                     $ref: '#/components/schemas/Notebook'
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
  notebookController.adminSearchAllNotebooks
);

// -- User routes (Static) --
/**
 * @swagger
 * /notebooks:
 *   post:
 *     summary: Create a new notebook
 *     description: Creates a new notebook for the currently authenticated user.
 *     tags: [Notebook (Self)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotebookBody'
 *     responses:
 *       "201":
 *         description: Notebook created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notebook created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Notebook'
 *       "400":
 *         $ref: '#/components/responses/BadRequestError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   get:
 *     summary: Get all of the user's notebooks
 *     description: Fetches a list of all non-deleted notebooks belonging to the currently authenticated user.
 *     tags: [Notebook (Self)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: A list of the user's notebooks.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notebooks fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notebook'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router
  .route("/")
  .post(notebookController.createNotebook)
  .get(notebookController.getMyNotebooks);

/**
 * @swagger
 * /notebooks/search:
 *   post:
 *     summary: Search a user's notebooks
 *     description: Performs a complex search on the logged-in user's notebooks.
 *     tags: [Notebook (Self)]
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
 *         description: A list of matching notebooks.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Search results fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notebook'
 *       "400":
 *         $ref: '#/components/responses/BadRequestError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/search", notebookController.searchMyNotebooks);

/**
 * @swagger
 * /notebooks/{notebookId}/notes:
 *   post:
 *     summary: Create a new note in a notebook
 *     description: Creates a new note, associating it with a specific notebook.
 *     tags: [Note (Self)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NestedNotebookId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNoteBody'
 *     responses:
 *       "201":
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Note created successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       "400":
 *         $ref: '#/components/responses/BadRequestError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "404":
 *         description: Notebook not found or user does not have access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   get:
 *     summary: Get all notes in a notebook
 *     description: Fetches all non-deleted notes from a specific notebook.
 *     tags: [Note (Self)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NestedNotebookId'
 *     responses:
 *       "200":
 *         description: A list of notes from the notebook.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Notes fetched successfully" }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "404":
 *         description: Notebook not found or user does not have access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router
  .route("/:notebookId/notes")
  .post(noteController.createNote)
  .get(noteController.getNotesInNotebook);

/**
 * @swagger
 * /notebooks/{notebookId}/notes/search:
 *   post:
 *     summary: Search notes within a notebook
 *     description: Performs a complex search on notes within a specific notebook.
 *     tags: [Note (Self)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NestedNotebookId'
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
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  "/:notebookId/notes/search",
  noteController.searchMyNotesInNotebook
);

// -- Admin-only routes (Parameterized) --
/**
 * @swagger
 * /notebooks/{id}/restore:
 *   put:
 *     summary: Restore a soft-deleted notebook (Admin)
 *     description: Restores a notebook that was previously soft-deleted.
 *     tags: [Notebook (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotebookId'
 *     responses:
 *       "200":
 *         description: Notebook restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Notebook restored successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/Notebook'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         description: Deleted notebook not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put(
  "/:id/restore",
  authorizeRoles(UserRole.ADMIN),
  notebookController.restoreNotebook
);

/**
 * @swagger
 * /notebooks/admin/{id}:
 *   put:
 *     summary: Update any notebook by ID (Admin)
 *     description: Allows an admin to update any notebook's details.
 *     tags: [Notebook (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotebookId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotebookBody'
 *     responses:
 *       "200":
 *         description: Notebook updated by admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Notebook updated by admin" }
 *                 data:
 *                   $ref: '#/components/schemas/Notebook'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete any notebook by ID (Admin)
 *     description: Allows an admin to soft-delete any notebook.
 *     tags: [Notebook (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotebookId'
 *     responses:
 *       "200":
 *         description: Notebook deleted by admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Notebook deleted by admin" }
 *                 data: { type: object, nullable: true, example: null }
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router
  .route("/admin/:id")
  .put(authorizeRoles(UserRole.ADMIN), notebookController.adminUpdateNotebook)
  .delete(
    authorizeRoles(UserRole.ADMIN),
    notebookController.adminDeleteNotebook
  );

// -- User-specific route --

/**
 * @swagger
 * /notebooks/{id}:
 *   get:
 *     summary: Get a single notebook by ID
 *     description: Fetches one of the user's notebooks by its UUID.
 *     tags: [Notebook (Self)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotebookId'
 *     responses:
 *       "200":
 *         description: Notebook details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Notebook fetched successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/Notebook'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update a notebook by ID
 *     description: Updates one of the user's notebooks by its UUID.
 *     tags: [Notebook (Self)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotebookId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotebookBody'
 *     responses:
 *       "200":
 *         description: Notebook updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Notebook updated successfully" }
 *                 data:
 *                   $ref: '#/components/schemas/Notebook'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete a notebook by ID
 *     description: Soft-deletes one of the user's notebooks by its UUID.
 *     tags: [Notebook (Self)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NotebookId'
 *     responses:
 *       "200":
 *         description: Notebook deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Notebook deleted successfully" }
 *                 data: { type: object, nullable: true, example: null }
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router
  .route("/:id")
  .get(notebookController.getMyNotebookById)
  .put(notebookController.updateMyNotebookById)
  .delete(notebookController.deleteMyNotebookById);

export default router;
