import NotebookModel, { INotebook } from "../models/notebook.model";
import UserModel, { IUser } from "../models/user.model";
import ApiError from "../utils/apiError";

type CreateNotebookInput = Pick<INotebook, "name" | "description">;
type UpdateNotebookInput = Partial<
  Pick<INotebook, "name" | "description" | "isPinned">
>;
const userPopulateFields = "id name email";

/**
 * Get all notebooks from all users
 * @returns The list of all notebooks
 */
export const getAllNotebooks = async (): Promise<INotebook[]> => {
  const notebooks = await NotebookModel.find().populate(
    "user",
    userPopulateFields
  );
  return notebooks;
};

/** Get all notebooks for a specific user by user ID
 * @param userId - The ID of the user
 * @returns The list of notebooks for the user
 */
export const getNotebooksForUser = async (
  userId: string
): Promise<INotebook[]> => {
  const user = await UserModel.findOne({ id: userId });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const notebooks = await NotebookModel.find({
    user: user._id,
  }).populate("user", userPopulateFields);

  return notebooks;
};

/** Admin update any notebook by ID
 * @param notebookId - The ID of the notebook
 * @param updateBody - The fields to update
 * @returns The updated notebook
 */
export const adminUpdateNotebook = async (
  notebookId: string,
  updateBody: UpdateNotebookInput
): Promise<INotebook> => {
  const notebook = await NotebookModel.findOne({ id: notebookId });

  if (!notebook) {
    throw new ApiError(404, "Notebook not found");
  }

  Object.assign(notebook, updateBody);
  await notebook.save();
  await notebook.populate("user", userPopulateFields);
  return notebook;
};

/** Admin delete any notebook by ID
 * @param notebookId - The ID of the notebook
 */
export const adminDeleteNotebook = async (
  notebookId: string
): Promise<void> => {
  const notebook = await NotebookModel.findOne({ id: notebookId });

  if (!notebook) {
    throw new ApiError(404, "Notebook not found");
  }

  await notebook.delete();
};

/** Get all deleted notebooks from all users
 * @returns The list of deleted notebooks
 */
export const getDeletedNotebooks = async (): Promise<INotebook[]> => {
  const notebooks = await NotebookModel.findDeleted().populate(
    "user",
    userPopulateFields
  );
  return notebooks;
};

/** Restore a deleted notebook by ID
 * @param notebookId - The ID of the notebook to restore
 * @returns The restored notebook
 */
export const restoreNotebook = async (
  notebookId: string
): Promise<INotebook> => {
  const notebook = await NotebookModel.findOneDeleted({ id: notebookId });

  if (!notebook) {
    throw new ApiError(404, "Notebook not found");
  }

  await notebook.restore();
  notebook.populate("user", userPopulateFields);
  return notebook;
};

/**
 * Create a new notebook
 * @param input - The notebook data
 * @param userId - The ID (Mongoose ObjectId) of the user creating the notebook
 * @returns The created notebook
 */
export const createNotebook = async (
  input: CreateNotebookInput,
  userId: IUser["_id"]
): Promise<INotebook> => {
  const { name, description } = input;

  const newNotebook = new NotebookModel({
    name,
    description: description || "",
    user: userId,
  });

  await newNotebook.save();
  await newNotebook.populate("user", userPopulateFields);
  return newNotebook;
};

/**
 * Get all notebooks for a user
 * @param userId - The ID (Mongoose ObjectId) of the user
 * @returns The list of notebooks
 */
export const getMyNotebooks = async (
  userId: IUser["_id"]
): Promise<INotebook[]> => {
  const notebooks = await NotebookModel.find({ user: userId }).populate(
    "user",
    userPopulateFields
  );
  return notebooks;
};

/**
 * Get a specific notebook by ID for a user
 * @param notebookId - The ID of the notebook
 * @param userId - The ID (Mongoose ObjectId) of the user
 * @returns The notebook if found
 */
export const getMyNotebookById = async (
  notebookId: string,
  userId: IUser["_id"]
): Promise<INotebook> => {
  const notebook = await NotebookModel.findOne({
    id: notebookId,
    user: userId,
  }).populate("user", userPopulateFields);

  if (!notebook) {
    throw new ApiError(
      404,
      "Notebook not found or you don't have access to it"
    );
  }

  return notebook;
};

/**
 * Update a specific notebook by ID for a user
 * @param notebookId - The ID of the notebook
 * @param userId - The ID (Mongoose ObjectId) of the user
 * @param updateBody - The fields to update
 * @returns The updated notebook
 */
export const updateMyNotebook = async (
  notebookId: string,
  userId: IUser["_id"],
  updateBody: UpdateNotebookInput
): Promise<INotebook> => {
  const notebook = await getMyNotebookById(notebookId, userId);

  Object.assign(notebook, updateBody);

  await notebook.save();
  return notebook;
};

/**
 * Delete a specific notebook by ID for a user
 * @param notebookId - The ID of the notebook
 * @param userId - The ID (Mongoose ObjectId) of the user
 */
export const deleteMyNotebook = async (
  notebookId: string,
  userId: IUser["_id"]
): Promise<void> => {
  const notebook = await getMyNotebookById(notebookId, userId);

  await notebook.delete();
};
