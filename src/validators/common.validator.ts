import Joi from 'joi';

const filterConditionSchema = Joi.object({
  field: Joi.string().required(),
  operator: Joi.string()
    .valid(
      // Basic Comparison
      'is',
      'is_not',
      'empty',
      'not_empty',
      'eq',
      'ne',
      // Text / String Match
      'contains',
      'not_contains',
      'starts_with',
      'ends_with',
      // Numeric / Date Comparison
      'greater_than',
      'less_than',
      'gt',
      'gte',
      'lt',
      'lte',
      'equals',
      'not_equals',
      // Range / Multi-select
      'between',
      'not_between',
      'overlaps',
      'is_any_of',
      'is_not_any_of',
      'includes_all',
      'excludes_all',
      // Temporal
      'before',
      'after'
    )
    .required(),
  values: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.number(),
      Joi.boolean(),
      Joi.date(),
      Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number()))
    )
    .required(),
});

export const searchSchema = Joi.object({
  filter: Joi.array().items(filterConditionSchema).min(1).required(),
});
