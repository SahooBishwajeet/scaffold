export const FilterConditionSchema = {
  oneOf: [
    {
      title: 'TextCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-1' },
        field: { type: 'string', example: 'title' },
        operator: {
          type: 'string',
          enum: [
            'contains',
            'not_contains',
            'starts_with',
            'ends_with',
            'is',
            'empty',
            'not_empty',
          ],
          example: 'contains',
        },
        values: {
          type: 'array',
          items: { type: 'string' },
          example: ['report'],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'EmailCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-email-1' },
        field: { type: 'string', example: 'email' },
        operator: {
          type: 'string',
          enum: [
            'contains',
            'not_contains',
            'starts_with',
            'ends_with',
            'is',
            'empty',
            'not_empty',
          ],
          example: 'contains',
        },
        values: {
          type: 'array',
          items: { type: 'string' },
          example: ['user@example.com'],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'URLCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-url-1' },
        field: { type: 'string', example: 'website' },
        operator: {
          type: 'string',
          enum: [
            'contains',
            'not_contains',
            'starts_with',
            'ends_with',
            'is',
            'empty',
            'not_empty',
          ],
          example: 'starts_with',
        },
        values: {
          type: 'array',
          items: { type: 'string' },
          example: ['https://example.com'],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'NumberCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-2' },
        field: { type: 'string', example: 'priority' },
        operator: {
          type: 'string',
          enum: [
            'equals',
            'not_equals',
            'greater_than',
            'less_than',
            'between',
            'empty',
            'not_empty',
          ],
          example: 'greater_than',
        },
        values: {
          type: 'array',
          items: { type: 'number' },
          example: [10],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'NumberRangeCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-numrange-1' },
        field: { type: 'string', example: 'amount' },
        operator: {
          type: 'string',
          enum: ['between', 'overlaps', 'contains', 'empty', 'not_empty'],
          example: 'between',
        },
        values: {
          type: 'array',
          items: { type: 'number' },
          example: [5, 15],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'TelCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-tel-1' },
        field: { type: 'string', example: 'phoneNumber' },
        operator: {
          type: 'string',
          enum: [
            'contains',
            'not_contains',
            'starts_with',
            'ends_with',
            'is',
            'empty',
            'not_empty',
          ],
          example: 'starts_with',
        },
        values: {
          type: 'array',
          items: { type: 'string', pattern: '^[0-9+\\- ]+$' },
          example: ['+91 9876543210'],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'DateCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-3' },
        field: { type: 'string', example: 'createdAt' },
        operator: {
          type: 'string',
          enum: ['before', 'after', 'is', 'is_not', 'empty', 'not_empty'],
          example: 'before',
        },
        values: {
          type: 'array',
          items: { type: 'string', format: 'date' },
          example: ['2025-10-01'],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'DateRangeCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-daterange-1' },
        field: { type: 'string', example: 'updatedAt' },
        operator: {
          type: 'string',
          enum: ['between', 'not_between', 'empty', 'not_empty'],
          example: 'between',
        },
        values: {
          type: 'array',
          items: { type: 'string', format: 'date' },
          example: ['2025-01-01', '2025-12-31'],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'TimeCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-time-1' },
        field: { type: 'string', example: 'startTime' },
        operator: {
          type: 'string',
          enum: ['before', 'after', 'is', 'between', 'empty', 'not_empty'],
          example: 'is',
        },
        values: {
          type: 'array',
          items: { type: 'string', format: 'time' },
          example: ['14:30'],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'DateTimeCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-datetime-1' },
        field: { type: 'string', example: 'loggedAt' },
        operator: {
          type: 'string',
          enum: ['before', 'after', 'is', 'between', 'empty', 'not_empty'],
          example: 'after',
        },
        values: {
          type: 'array',
          items: { type: 'string', format: 'date-time' },
          example: ['2025-10-01T10:00:00Z'],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'BooleanCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-5' },
        field: { type: 'string', example: 'isPinned' },
        operator: {
          type: 'string',
          enum: ['is', 'is_not', 'empty', 'not_empty'],
          example: 'is',
        },
        values: {
          type: 'array',
          items: { type: 'boolean' },
          example: [true],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'SelectCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-6' },
        field: { type: 'string', example: 'role' },
        operator: {
          type: 'string',
          enum: ['is', 'is_not', 'empty', 'not_empty'],
          example: 'is',
        },
        values: {
          type: 'array',
          items: { type: 'string' },
          example: ['admin'],
        },
      },
      required: ['field', 'type', 'operator'],
    },
    {
      title: 'MultiSelectCondition',
      type: 'object',
      properties: {
        id: { type: 'string', example: 'f-mselect-1' },
        field: { type: 'string', example: 'tags' },
        operator: {
          type: 'string',
          enum: [
            'is_any_of',
            'is_not_any_of',
            'includes_all',
            'excludes_all',
            'empty',
            'not_empty',
          ],
          example: 'is_any_of',
        },
        values: {
          type: 'array',
          items: { type: 'string' },
          example: ['frontend', 'ui'],
        },
      },
      required: ['field', 'type', 'operator'],
    },
  ],
  discriminator: {
    propertyName: 'type',
  },
};
