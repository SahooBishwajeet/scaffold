export const parameters = {
  UserId: {
    name: "id",
    in: "path",
    description: "UUID of the user",
    required: true,
    schema: {
      type: "string",
      format: "uuid",
      example: "123e4567-e..",
    },
  },
  NotebookId: {
    name: "id",
    in: "path",
    description: "UUID of the notebook",
    required: true,
    schema: {
      type: "string",
      format: "uuid",
      example: "123e4567-e..",
    },
  },
  NoteId: {
    name: "id",
    in: "path",
    description: "UUID of the note",
    required: true,
    schema: {
      type: "string",
      format: "uuid",
      example: "123e4567-e..",
    },
  },
  NestedUserId: {
    name: "userId",
    in: "path",
    description: "UUID of the user",
    required: true,
    schema: {
      type: "string",
      format: "uuid",
      example: "123e4567-e..",
    },
  },
  NestedNotebookId: {
    name: "notebookId",
    in: "path",
    description: "UUID of the notebook",
    required: true,
    schema: {
      type: "string",
      format: "uuid",
      example: "123e4567-e..",
    },
  },
  NestedNoteId: {
    name: "noteId",
    in: "path",
    description: "UUID of the note",
    required: true,
    schema: {
      type: "string",
      format: "uuid",
      example: "123e4567-e..",
    },
  },
};
