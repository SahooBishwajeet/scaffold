import Joi from 'joi';

export const createNotebookSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(100),
  description: Joi.string().trim().max(500).optional().allow(''),
});

export const updateNotebookSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  description: Joi.string().trim().max(500).optional().allow(''),
  isPinned: Joi.boolean().optional(),
}).min(1); // At least one field must be present

export const notebookIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const notebookIdNestedParamSchema = Joi.object({
  notebookId: Joi.string().uuid().required(),
});
