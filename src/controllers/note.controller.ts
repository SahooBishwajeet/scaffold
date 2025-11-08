import { Request, Response } from 'express';
import * as noteService from '../services/note.service';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import {
  buildMongoQuery,
  FieldTypeMap,
  FilterCondition,
} from '../utils/filter';

const noteFieldTypeMap: FieldTypeMap = {
  title: 'string',
  content: 'string',
  tags: 'array',
  isPinned: 'boolean',
  createdAt: 'date',
  updatedAt: 'date',
};

/**
 * @desc    Get all notes
 * @route   GET /api/v1/notes/all
 * @access  Admin
 */
export const getAllNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await noteService.getAllNotes();

  res
    .status(200)
    .json(new ApiResponse(200, notes, 'Notes fetched successfully'));
});

/**
 * @desc    Get all notes for a specific user by user ID
 * @route   GET /api/v1/users/:userId/notes
 * @access  Admin
 */
export const getNotesForUser = asyncHandler(
  async (req: Request, res: Response) => {
    const notes = await noteService.getNotesForUser(req.params.userId);

    res
      .status(200)
      .json(new ApiResponse(200, notes, "User's notes fetched successfully"));
  }
);

/**
 * @desc    Get all deleted notes
 * @route   GET /api/v1/notes/all/deleted
 * @access  Admin
 */
export const getDeletedNotes = asyncHandler(
  async (req: Request, res: Response) => {
    const notes = await noteService.getDeletedNotes();

    res
      .status(200)
      .json(new ApiResponse(200, notes, 'Deleted notes fetched successfully'));
  }
);

/**
 * @desc    Restore a deleted note by ID
 * @route   PUT /api/v1/notes/:noteId/restore
 * @access  Admin
 */
export const restoreNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.restoreNote(req.params.noteId);

  res
    .status(200)
    .json(new ApiResponse(200, note, 'Note restored successfully'));
});

/**
 * @desc    Admin get any note by ID
 * @route   GET /api/v1/notes/admin/:noteId
 * @access  Admin
 */
export const adminGetNoteById = asyncHandler(
  async (req: Request, res: Response) => {
    const note = await noteService.adminGetNoteById(req.params.noteId);

    res
      .status(200)
      .json(new ApiResponse(200, note, 'Note fetched successfully'));
  }
);

/**
 * @desc    Admin update any note by ID
 * @route   PUT /api/v1/notes/admin/:noteId
 * @access  Admin
 */
export const adminUpdateNote = asyncHandler(
  async (req: Request, res: Response) => {
    const note = await noteService.adminUpdateNote(req.params.noteId, req.body);

    res
      .status(200)
      .json(new ApiResponse(200, note, 'Note updated successfully'));
  }
);

/**
 * @desc    Admin delete any note by ID
 * @route   DELETE /api/v1/notes/admin/:noteId
 * @access  Admin
 */
export const adminDeleteNote = asyncHandler(
  async (req: Request, res: Response) => {
    await noteService.adminDeleteNote(req.params.noteId);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Note deleted successfully'));
  }
);

/**
 * @desc    Create a new note in a specific notebook
 * @route   POST /api/v1/notebooks/:notebookId/notes
 * @access  Protected
 */
export const createNote = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized');
  }
  const { notebookId } = req.params;

  const note = await noteService.createNote(req.body, notebookId, req.user._id);

  res.status(201).json(new ApiResponse(201, note, 'Note created successfully'));
});

/**
 * @desc    Get all notes in a specific notebook
 * @route   GET /api/v1/notebooks/:notebookId/notes
 * @access  Protected
 */
export const getNotesInNotebook = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    const { notebookId } = req.params;

    const notes = await noteService.getNotesInNotebook(
      notebookId,
      req.user._id
    );

    res
      .status(200)
      .json(new ApiResponse(200, notes, 'Notes fetched successfully'));
  }
);

/**
 * @desc    Get all notes for the logged-in user across all notebooks
 * @route   GET /api/v1/notes
 * @access  Protected
 */
export const getAllMyNotes = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    const notes = await noteService.getAllMyNotes(req.user._id);

    res
      .status(200)
      .json(new ApiResponse(200, notes, 'All notes fetched successfully'));
  }
);

/**
 * @desc    Get a specific note by ID for the logged-in user
 * @route   GET /api/v1/notes/:noteId
 * @access  Protected
 */
export const getMyNoteById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    const { noteId } = req.params;

    const note = await noteService.getMyNoteById(noteId, req.user._id);

    res
      .status(200)
      .json(new ApiResponse(200, note, 'Note fetched successfully'));
  }
);

/**
 * @desc    Update a specific note by ID for the logged-in user
 * @route   PUT /api/v1/notes/:noteId
 * @access  Protected
 */
export const updateMyNote = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    const { noteId } = req.params;

    const note = await noteService.updateMyNote(noteId, req.user._id, req.body);

    res
      .status(200)
      .json(new ApiResponse(200, note, 'Note updated successfully'));
  }
);

/**
 * @desc    Move a note to a different notebook for the logged-in user
 * @route   PUT /api/v1/notes/:noteId/move
 * @access  Protected
 */
export const moveMyNote = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized');
  }

  const { noteId } = req.params;
  const { newNotebookId } = req.body;

  if (!newNotebookId) {
    throw new ApiError(400, 'New notebook ID is required');
  }

  const note = await noteService.moveMyNote(
    noteId,
    newNotebookId,
    req.user._id
  );

  res.status(200).json(new ApiResponse(200, note, 'Note moved successfully'));
});

/**
 * @desc    Delete a specific note by ID for the logged-in user
 * @route   DELETE /api/v1/notes/:noteId
 * @access  Protected
 */
export const deleteMyNote = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    const { noteId } = req.params;

    await noteService.deleteMyNote(noteId, req.user._id);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Note deleted successfully'));
  }
);

/**
 * @desc    Search notes for the logged-in user based on filter criteria
 * @route   POST /api/v1/notes/search
 * @access  Protected
 */
export const searchMyNotes = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    const { filter }: { filter: FilterCondition[] } = req.body;
    const { query, error } = buildMongoQuery(filter, noteFieldTypeMap);

    if (error) {
      throw new ApiError(400, `Invalid filter: ${error.message}`);
    }

    const notes = await noteService.searchMyNotes(req.user._id, query || {});

    res
      .status(200)
      .json(new ApiResponse(200, notes, 'Filtered notes fetched successfully'));
  }
);

/**
 * @desc    Search notes in a specific notebook for the logged-in user based on filter criteria
 * @route   POST /api/v1/notebooks/:notebookId/notes/search
 * @access  Protected
 */
export const searchMyNotesInNotebook = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    const { notebookId } = req.params;
    const { filter }: { filter: FilterCondition[] } = req.body;
    const { query, error } = buildMongoQuery(filter, noteFieldTypeMap);

    if (error) {
      throw new ApiError(400, `Invalid filter: ${error.message}`);
    }

    const notes = await noteService.searchMyNotesInNotebook(
      req.user._id,
      notebookId,
      query || {}
    );

    res
      .status(200)
      .json(new ApiResponse(200, notes, 'Filtered notes fetched successfully'));
  }
);

/**
 * @desc    Search all notes from all users based on filter criteria
 * @route   POST /api/v1/notes/admin/search
 * @access  Admin
 */
export const adminSearchAllNotes = asyncHandler(
  async (req: Request, res: Response) => {
    const { filter }: { filter: FilterCondition[] } = req.body;
    const { query, error } = buildMongoQuery(filter, noteFieldTypeMap);

    if (error) {
      throw new ApiError(400, `Invalid filter: ${error.message}`);
    }

    const notes = await noteService.adminSearchAllNotes(query || {});

    res
      .status(200)
      .json(new ApiResponse(200, notes, 'Filtered notes fetched successfully'));
  }
);

/**
 * @desc    Search notes for a specific user by user ID based on filter criteria
 * @route   POST /api/v1/users/:userId/notes/search
 * @access  Admin
 */
export const adminSearchNotesForUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { filter }: { filter: FilterCondition[] } = req.body;
    const { query, error } = buildMongoQuery(filter, noteFieldTypeMap);

    if (error) {
      throw new ApiError(400, `Invalid filter: ${error.message}`);
    }

    const notes = await noteService.adminSearchNotesForUser(
      userId,
      query || {}
    );

    res
      .status(200)
      .json(new ApiResponse(200, notes, 'Filtered notes fetched successfully'));
  }
);
