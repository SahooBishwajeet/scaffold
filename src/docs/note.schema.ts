export const NoteSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string', example: 'Meeting Notes' },
    content: {
      type: 'string',
      example: 'Talked about the new feature.',
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      example: ['meeting', 'feature'],
    },
    isPinned: { type: 'boolean', example: false },
    user: { $ref: '#/components/schemas/User' },
    notebook: { $ref: '#/components/schemas/Notebook' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const CreateNoteBody = {
  type: 'object',
  properties: {
    title: { type: 'string', example: 'Meeting Notes' },
    content: {
      type: 'string',
      example: 'Talked about the new feature.',
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      example: ['meeting', 'feature'],
    },
    isPinned: { type: 'boolean', example: false },
  },
  required: ['title'],
};

export const UpdateNoteBody = {
  type: 'object',
  properties: {
    title: { type: 'string', example: 'Meeting Notes' },
    content: {
      type: 'string',
      example: 'Talked about the new feature.',
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      example: ['meeting', 'feature'],
    },
    isPinned: { type: 'boolean', example: true },
  },
};

export const MoveNoteBody = {
  type: 'object',
  properties: {
    newNotebookId: {
      type: 'string',
      format: 'uuid',
      example: 'a1b2c3...',
    },
  },
  required: ['newNotebookId'],
};
