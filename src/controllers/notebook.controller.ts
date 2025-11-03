import { Request, Response } from "express";
import * as notebookService from "../services/notebook.service";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * @desc    Get all notebooks
 * @route   GET /api/v1/notebooks/all/notebooks
 * @access  Admin
 */
export const getAllNotebooks = asyncHandler(
  async (req: Request, res: Response) => {
    const notebooks = await notebookService.getAllNotebooks();

    res
      .status(200)
      .json(new ApiResponse(200, notebooks, "Notebooks fetched successfully"));
  }
);

/**
 * @desc    Get all notebooks for a specific user by user ID
 * @route   GET /api/v1/users/:userId/notebooks
 * @access  Admin
 */
export const getNotebooksForUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    const notebooks = await notebookService.getNotebooksForUser(userId);

    res
      .status(200)
      .json(
        new ApiResponse(200, notebooks, "User's notebooks fetched successfully")
      );
  }
);

/**
 * @desc    Admin update any notebook by ID
 * @route   PUT /api/v1/notebooks/admin/:id
 * @access  Admin
 */
export const adminUpdateNotebook = asyncHandler(
  async (req: Request, res: Response) => {
    const notebook = await notebookService.adminUpdateNotebook(
      req.params.id,
      req.body
    );

    res
      .status(200)
      .json(new ApiResponse(200, notebook, "Notebook updated successfully"));
  }
);

/**
 * @desc    Admin delete any notebook by ID
 * @route   DELETE /api/v1/notebooks/admin/:id
 * @access  Admin
 */
export const adminDeleteNotebook = asyncHandler(
  async (req: Request, res: Response) => {
    await notebookService.adminDeleteNotebook(req.params.id);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Notebook deleted successfully"));
  }
);

/**
 * @desc    Get all deleted notebooks
 * @route   GET /api/v1/notebooks/all/deleted
 * @access  Admin
 */
export const getDeletedNotebooks = asyncHandler(
  async (req: Request, res: Response) => {
    const notebooks = await notebookService.getDeletedNotebooks();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          notebooks,
          "Deleted notebooks fetched successfully"
        )
      );
  }
);

/**
 * @desc    Restore a deleted notebook by ID
 * @route   PUT /api/v1/notebooks/:id/restore
 * @access  Admin
 */
export const restoreNotebook = asyncHandler(
  async (req: Request, res: Response) => {
    const notebook = await notebookService.restoreNotebook(req.params.id);

    res
      .status(200)
      .json(new ApiResponse(200, notebook, "Notebook restored successfully"));
  }
);

/**
 * @desc    Create a new notebook
 * @route   POST /api/v1/notebooks
 * @access  Protected
 */
export const createNotebook = asyncHandler(
  async (req: Request, res: Response) => {
    console.log(req.user);

    if (!req.user) {
      throw new ApiError(401, "Not authorized");
    }

    const { name, description } = req.body;
    if (!name) {
      throw new ApiError(400, "Notebook name is required");
    }

    const notebook = await notebookService.createNotebook(
      { name, description },
      req.user._id
    );

    res
      .status(201)
      .json(new ApiResponse(201, notebook, "Notebook created successfully"));
  }
);

/**
 * @desc    Get all notebooks of the logged-in user
 * @route   GET /api/v1/notebooks
 * @access  Protected
 */
export const getMyNotebooks = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Not authorized");
    }

    const notebooks = await notebookService.getMyNotebooks(req.user._id);

    res
      .status(200)
      .json(new ApiResponse(200, notebooks, "Notebooks fetched successfully"));
  }
);

/**
 * @desc    Get a specific notebook by ID for the logged-in user
 * @route   GET /api/v1/notebooks/:id
 * @access  Protected
 */
export const getMyNotebookById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Not authorized");
    }

    const notebook = await notebookService.getMyNotebookById(
      req.params.id,
      req.user._id
    );

    res
      .status(200)
      .json(new ApiResponse(200, notebook, "Notebook fetched successfully"));
  }
);

/**
 * @desc    Update a specific notebook by ID for the logged-in user
 * @route   PUT /api/v1/notebooks/:id
 * @access  Protected
 */
export const updateMyNotebookById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Not authorized");
    }

    const notebook = await notebookService.updateMyNotebook(
      req.params.id,
      req.user._id,
      req.body
    );

    res
      .status(200)
      .json(new ApiResponse(200, notebook, "Notebook updated successfully"));
  }
);

/**
 * @desc    Delete a specific notebook by ID for the logged-in user
 * @route   DELETE /api/v1/notebooks/:id
 * @access  Protected
 */
export const deleteMyNotebookById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Not authorized");
    }

    await notebookService.deleteMyNotebook(req.params.id, req.user._id);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Notebook deleted successfully"));
  }
);
