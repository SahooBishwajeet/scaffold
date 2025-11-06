export const NotebookSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string", example: "Work Projects" },
    description: {
      type: "string",
      example: "My work-related notes.",
      nullable: true,
    },
    isPinned: { type: "boolean", example: false },
    user: { $ref: "#/components/schemas/User" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};
