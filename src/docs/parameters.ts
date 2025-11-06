export const parameters = {
  UserIdParam: {
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
  NotebookIdParam: {
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
  NoteIdParam: {
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
  NestedUserIdParam: {
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
  NestedNotebookIdParam: {
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
  NestedNoteIdParam: {
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
