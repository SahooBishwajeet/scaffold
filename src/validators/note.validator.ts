import Joi from 'joi';

export const createNoteSchema = Joi.object({
  title: Joi.string().required().trim().min(1).max(200),
  content: Joi.string().required().trim().min(1).optional(),
  tags: Joi.array()
    .items(Joi.string().trim().min(1).max(50))
    .optional()
    .default([]),
  isPinned: Joi.boolean().optional().default(false),
});

export const updateNoteSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  content: Joi.string().trim().min(1).optional(),
  tags: Joi.array().items(Joi.string().trim().min(1).max(50)).optional(),
  isPinned: Joi.boolean().optional(),
}).min(1); // At least one field must be present

export const moveNoteSchema = Joi.object({
  newNotebookId: Joi.string().uuid().required(),
});

export const noteIdParamSchema = Joi.object({
  noteId: Joi.string().uuid().required(),
});

export const notebookIdParamSchema = Joi.object({
  notebookId: Joi.string().uuid().required(),
});
