import { Router } from "express";
import * as noteController from "../controllers/note.controller";
import * as notebookController from "../controllers/notebook.controller";
import * as userController from "../controllers/user.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import { UserRole } from "../models/user.model";

const router = Router();

router.use(protect);

// --- User-specific route ---
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user's profile
 *     description: Fetches the complete profile information for the currently authenticated user.
 *     tags: [User (Self)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: User profile fetched successfully
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
 *                   example: "Profile fetched"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   put:
 *     summary: Update current user's profile
 *     description: Updates the currently authenticated user's profile.
 *     tags: [User (Self)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileBody'
 *     responses:
 *       "200":
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   delete:
 *     summary: Delete current user's account
 *     description: Soft-deletes the account of the currently authenticated user. This is a non-reversible action by the user.
 *     tags: [User (Self)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Account deleted successfully
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
 *                   example: "Account deleted successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router
  .route("/me")
  .get(userController.getMe)
  .put(userController.updateMyProfile)
  .delete(userController.deleteMyAccount);

/**
 * @swagger
 * /users/me/password:
 *   put:
 *     summary: Change current user's password
 *     description: Allows the authenticated user to change their own password by providing their old and new password.
 *     tags: [User (Self)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordBody'
 *     responses:
 *       "200":
 *         description: Password changed successfully
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
 *                   example: "Password changed successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       "400":
 *         description: Bad request (e.g., missing passwords)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       "401":
 *         description: Unauthorized (e.g., incorrect old password)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put("/me/password", userController.changeMyPassword);

// --- Admin-only routes ---
router.use(authorizeRoles(UserRole.ADMIN));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin)
 *     description: Fetches a list of all non-deleted user accounts.
 *     tags: [User (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: A list of users.
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
 *                   example: "Users fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /users/deleted:
 *   get:
 *     summary: Get all soft-deleted users (Admin)
 *     description: Fetches a list of all user accounts that have been soft-deleted.
 *     tags: [User (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: A list of soft-deleted users.
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
 *                   example: "Deleted users fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get("/deleted", userController.getDeletedUsers);

/**
 * @swagger
 * /users/search:
 *   post:
 *     summary: Search all users (Admin)
 *     description: Performs a complex search on all users in the system.
 *     tags: [User (Admin)]
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
 *         description: A list of matching users.
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
 *                   example: "Users search results fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/BadRequestError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post("/search", userController.adminSearchUsers);

/**
 * @swagger
 * /users/{userId}/notebooks:
 *   get:
 *     summary: Get all notebooks for a specific user (Admin)
 *     description: Fetches all notebooks belonging to a single user by their UUID.
 *     tags: [User (Admin), Notebook (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NestedUserId'
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
 *                   example: "User's notebooks fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notebook'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:userId/notebooks", notebookController.getNotebooksForUser);

/**
 * @swagger
 * /users/{userId}/notebooks/search:
 *   post:
 *     summary: Search notebooks for a specific user (Admin)
 *     description: Performs a complex search on all notebooks belonging to a single user.
 *     tags: [User (Admin), Notebook (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NestedUserId'
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
 *                   example: "Admin search results fetched"
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
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  "/:userId/notebooks/search",
  notebookController.adminSearchNotebooksForUser
);

/**
 * @swagger
 * /users/{userId}/notes:
 *   get:
 *     summary: Get all notes for a specific user (Admin)
 *     description: Fetches all notes belonging to a single user by their UUID.
 *     tags: [User (Admin), Note (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NestedUserId'
 *     responses:
 *       "200":
 *         description: A list of the user's notes.
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
 *                   example: "User's notes fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:userId/notes", noteController.getNotesForUser);

/**
 * @swagger
 * /users/{userId}/notes/search:
 *   post:
 *     summary: Search notes for a specific user (Admin)
 *     description: Performs a complex search on all notes belonging to a single user.
 *     tags: [User (Admin), Note (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/NestedUserId'
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Admin search results fetched"
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
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post("/:userId/notes/search", noteController.adminSearchNotesForUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID (Admin)
 *     description: Fetches the complete details for a single user by their UUID.
 *     tags: [User (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       "200":
 *         description: User details fetched successfully
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
 *                   example: "User fetched successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   put:
 *     summary: Update a user by ID (Admin)
 *     description: Allows an admin to update a user's name, email, or role.
 *     tags: [User (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUpdateUserBody'
 *     responses:
 *       "200":
 *         description: User updated successfully
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
 *                   example: "User updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *       "409":
 *         description: Email already taken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 *   delete:
 *     summary: Soft-delete a user by ID (Admin)
 *     description: Soft-deletes a user's account.
 *     tags: [User (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       "200":
 *         description: User deleted successfully
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
 *                   example: "User deleted successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router
  .route("/:id")
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

/**
 * @swagger
 *   /users/{id}/restore:
 *     put:
 *       summary: Restore a soft-deleted user (Admin)
 *       description: Restores a user account that was previously soft-deleted.
 *       tags: [User (Admin)]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - $ref: '#/components/parameters/UserId'
 *       responses:
 *         "200":
 *           description: User restored successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success: { type: boolean, example: true }
 *                   message: { type: string, example: "User restored successfully" }
 *                   data:
 *                     $ref: '#/components/schemas/User'
 *         "401":
 *           $ref: '#/components/responses/UnauthorizedError'
 *         "403":
 *           $ref: '#/components/responses/ForbiddenError'
 *         "404":
 *           description: Deleted user not found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiError'
 */
router.put("/:id/restore", userController.restoreUser);

export default router;
