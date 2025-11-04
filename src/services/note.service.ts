import { FilterQuery } from "mongoose";
import NoteModel, { INote } from "../models/note.model";
import NotebookModel, { INotebook } from "../models/notebook.model";
import UserModel, { IUser } from "../models/user.model";
import ApiError from "../utils/apiError";

type CreateNoteInput = Pick<INote, "title" | "content" | "tags" | "isPinned">;
type UpdateNoteInput = Partial<CreateNoteInput>;
const userPopulateFields = "id name email";
const notebookPopulateFields = "id name";
const fullPopulate = [
  { path: "user", select: userPopulateFields },
  { path: "notebook", select: notebookPopulateFields },
];

/**
 * Get all notes from all users
 * @returns The list of all notes
 */
export const getAllNotes = async (): Promise<INote[]> => {
  const notes = await NoteModel.find().populate(fullPopulate);
  return notes;
};

/**
 * Get all notes for a specific user by user ID
 * @param userId - The ID of the user
 * @returns The list of notes for the user
 */
export const getNotesForUser = async (userId: string): Promise<INote[]> => {
  const user = await UserModel.findOne({ id: userId });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const notes = await NoteModel.find({
    user: user._id,
  }).populate(fullPopulate);
  return notes;
};

/**
 * Get all deleted notes
 * @returns The list of deleted notes
 */
export const getDeletedNotes = async (): Promise<INote[]> => {
  const notes = await NoteModel.findDeleted().populate(fullPopulate);
  return notes;
};

/**
 * Restore a deleted note by ID
 * @param noteId - The ID of the note to restore
 * @returns The restored note
 */
export const restoreNote = async (noteId: string): Promise<INote> => {
  const note = await NoteModel.findOneDeleted({ id: noteId });
  if (!note) {
    throw new ApiError(404, "Note not found in deleted items");
  }

  await note.restore();
  await note.populate(fullPopulate);
  return note;
};

/**
 * Admin get any note by ID
 * @param noteId - The ID of the note
 * @returns The note if found
 */
export const adminGetNoteById = async (noteId: string): Promise<INote> => {
  const note = await NoteModel.findOne({ id: noteId }).populate(fullPopulate);
  if (!note) {
    throw new ApiError(404, "Note not found");
  }
  return note;
};

/**
 * Admin update any note by ID
 * @param noteId - The ID of the note
 * @param updateBody - The fields to update
 * @returns The updated note
 */
export const adminUpdateNote = async (
  noteId: string,
  updateBody: UpdateNoteInput
): Promise<INote> => {
  const note = await adminGetNoteById(noteId);

  Object.assign(note, updateBody);
  await note.save();
  await note.populate(fullPopulate);
  return note;
};

/**
 * Admin delete any note by ID
 * @param noteId - The ID of the note
 */
export const adminDeleteNote = async (noteId: string): Promise<void> => {
  const note = await adminGetNoteById(noteId);
  await note.delete();
};

/**
 * Create a new note in a specific notebook
 * @param input - The note details
 * @param notebookId - The ID of the notebook
 * @param userId - The ID of the user creating the note
 * @returns The created note
 */
export const createNote = async (
  input: CreateNoteInput,
  notebookId: string,
  userId: IUser["_id"]
): Promise<INote> => {
  const notebook = await NotebookModel.findOne({
    id: notebookId,
    user: userId,
  });
  if (!notebook) {
    throw new ApiError(
      404,
      "Notebook not found or you don't have access to it"
    );
  }

  const newNote = new NoteModel({
    ...input,
    user: userId,
    notebook: notebook._id,
  });

  await newNote.save();
  await newNote.populate(fullPopulate);
  return newNote;
};

/**
 * Get all notes in a specific notebook
 * @param notebookId - The ID of the notebook
 * @param userId - The ID of the user
 * @returns The list of notes in the notebook
 */
export const getNotesInNotebook = async (
  notebookId: string,
  userId: IUser["_id"]
): Promise<INote[]> => {
  const notebook = await NotebookModel.findOne({
    id: notebookId,
    user: userId,
  });
  if (!notebook) {
    throw new ApiError(
      404,
      "Notebook not found or you don't have access to it"
    );
  }

  const notes = await NoteModel.find({
    notebook: notebook._id,
  }).populate(fullPopulate);
  return notes;
};

/**
 * Get all notes for a user across all notebooks
 * @param userId - The ID of the user
 * @returns The list of all notes for the user
 */
export const getAllMyNotes = async (userId: IUser["_id"]): Promise<INote[]> => {
  const notes = await NoteModel.find({
    user: userId,
  }).populate(fullPopulate);
  return notes;
};

/**
 * Get a specific note by ID for a user
 * @param noteId - The ID of the note
 * @param userId - The ID of the user
 * @returns The note if found
 */
export const getMyNoteById = async (
  noteId: string,
  userId: IUser["_id"]
): Promise<INote> => {
  const note = await NoteModel.findOne({
    id: noteId,
    user: userId,
  }).populate(fullPopulate);

  if (!note) {
    throw new ApiError(404, "Note not found or you don't have access to it");
  }

  return note;
};

/**
 * Update a specific note by ID for a user
 * @param noteId - The ID of the note
 * @param updateBody - The fields to update
 * @param userId - The ID of the user
 * @returns The updated note
 */
export const updateMyNote = async (
  noteId: string,
  userId: IUser["_id"],
  updateBody: UpdateNoteInput
): Promise<INote> => {
  const note = await getMyNoteById(noteId, userId);

  Object.assign(note, updateBody);
  await note.save();
  return note;
};

/**
 * Move a note to a different notebook for a user
 * @param noteId - The ID of the note to move
 * @param newNotebookId - The ID of the target notebook
 * @param userId - The ID of the user
 * @returns The moved note
 */
export const moveMyNote = async (
  noteId: string,
  newNotebookId: string,
  userId: IUser["_id"]
): Promise<INote> => {
  const note = await getMyNoteById(noteId, userId);

  const newNotebook = await NotebookModel.findOne({
    id: newNotebookId,
    user: userId,
  });
  if (!newNotebook) {
    throw new ApiError(
      404,
      "Target notebook not found or you don't have access to it"
    );
  }

  note.notebook = newNotebook._id;
  await note.save();
  await note.populate(fullPopulate);

  return note;
};

/**
 * Delete a specific note by ID for a user
 * @param noteId - The ID of the note
 * @param userId - The ID of the user
 */
export const deleteMyNote = async (
  noteId: string,
  userId: IUser["_id"]
): Promise<void> => {
  const note = await getMyNoteById(noteId, userId);

  await note.delete();
};

/**
 * Search notes for a user based on filter criteria
 * @param userId - The ID of the user
 * @param filterQuery - The mongoose filter query object from filter builder
 * @returns The list of notes matching the criteria
 */
export const searchMyNotes = async (
  userId: IUser["_id"],
  filterQuery: FilterQuery<any>
): Promise<INote[]> => {
  // Ensure that only notes belonging to the user are fetched
  const securityQuery = { user: userId };

  const finalQuery = {
    $and: [filterQuery, securityQuery],
  };

  const notes = await NoteModel.find(finalQuery).populate(fullPopulate);
  return notes;
};

/**
 * Search notes for a user within a specific notebook based on filter criteria
 * @param userId - The ID of the user
 * @param notebookId - The ID of the notebook
 * @param filterQuery - The mongoose filter query object from filter builder
 * @returns The list of notes matching the criteria
 */
export const searchMyNotesInNotebook = async (
  userId: IUser["_id"],
  notebookId: INotebook["_id"],
  filterQuery: FilterQuery<any>
): Promise<INote[]> => {
  const notebook = await NotebookModel.findOne({
    id: notebookId,
    user: userId,
  });

  if (!notebook) {
    throw new ApiError(
      404,
      "Notebook not found or you don't have access to it"
    );
  }

  // Ensure that only notes belonging to the user are fetched
  // Plus that they belong to the specified notebook
  const securityQuery = { user: userId, notebook: notebook._id };

  const finalQuery = {
    $and: [filterQuery, securityQuery],
  };

  const notes = await NoteModel.find(finalQuery).populate(fullPopulate);
  return notes;
};

/**
 * Search all notes from all users
 * @param filterQuery - The mongoose filter query object from filter builder
 * @returns The list of notes matching the criteria
 */
export const adminSearchAllNotes = async (
  filterQuery: FilterQuery<any>
): Promise<INote[]> => {
  const notes = await NoteModel.find(filterQuery).populate(fullPopulate);
  return notes;
};

/**
 * Search all notes from a specific user
 * @param userId - The ID of the user
 * @param filterQuery - The mongoose filter query object from filter builder
 * @returns The list of notes matching the criteria
 */
export const adminSearchNotesForUser = async (
  userId: string,
  filterQuery: FilterQuery<any>
): Promise<INote[]> => {
  const user = await UserModel.findOne({ id: userId });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const securityQuery = { user: user._id };
  const finalQuery = {
    $and: [filterQuery, securityQuery],
  };

  const notes = await NoteModel.find(finalQuery).populate(fullPopulate);
  return notes;
};
