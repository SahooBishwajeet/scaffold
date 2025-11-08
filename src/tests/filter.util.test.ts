import {
  buildMongoQuery,
  FieldTypeMap,
  FilterCondition,
  InvalidFilterError,
} from '../utils/filter';

describe('Filter Utility: buildMongoQuery', () => {
  const fieldTypeMap: FieldTypeMap = {
    title: 'string',
    status: 'string',
    age: 'number',
    createdAt: 'date',
    tags: 'array',
    range: 'array',
    active: 'boolean',
  };

  test('should return empty query when no filters', () => {
    const { query, error } = buildMongoQuery([], fieldTypeMap);
    expect(query).toEqual({});
    expect(error).toBeNull();
  }); // ---------- STRING OPERATORS ----------
  test('contains', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'title', operator: 'contains', values: ['task'] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [{ title: { $regex: /task/i } }],
    });
  });

  test('not_contains', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'title', operator: 'not_contains', values: ['draft'] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [{ title: { $not: { $regex: /draft/i } } }],
    });
  });

  test('starts_with', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'title', operator: 'starts_with', values: ['doc'] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [{ title: { $regex: /^doc/i } }],
    });
  });

  test('ends_with', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'title', operator: 'ends_with', values: ['final'] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [{ title: { $regex: /final$/i } }],
    });
  });

  // ---------- NUMBER OPERATORS ----------
  test('equals', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'age', operator: 'equals', values: [25] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({ $and: [{ age: { $eq: 25 } }] });
  });

  test('not_equals', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'age', operator: 'not_equals', values: [40] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({ $and: [{ age: { $ne: 40 } }] });
  });

  test('greater_than', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'age', operator: 'greater_than', values: [18] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({ $and: [{ age: { $gt: 18 } }] });
  });

  test('less_than', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'age', operator: 'less_than', values: [65] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({ $and: [{ age: { $lt: 65 } }] });
  });

  test('between (number)', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'age', operator: 'between', values: [20, 30] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [{ age: { $gte: 20, $lte: 30 } }],
    });
  });

  // ---------- DATE OPERATORS ----------
  test('is (date)', () => {
    const date = '2025-01-01';
    const { query } = buildMongoQuery(
      [{ id: '1', field: 'createdAt', operator: 'is', values: [date] }],
      fieldTypeMap
    );
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    expect(query).toEqual({
      $and: [{ createdAt: { $gte: start, $lte: end } }],
    });
  });

  test('before', () => {
    const date = '2025-01-01';
    const { query } = buildMongoQuery(
      [{ id: '1', field: 'createdAt', operator: 'before', values: [date] }],
      fieldTypeMap
    );
    expect(query?.$and?.[0].createdAt.$lt).toBeInstanceOf(Date);
  });

  test('after', () => {
    const date = '2025-01-01';
    const { query } = buildMongoQuery(
      [{ id: '1', field: 'createdAt', operator: 'after', values: [date] }],
      fieldTypeMap
    );
    expect(query?.$and?.[0].createdAt.$gt).toBeInstanceOf(Date);
  });

  test('between (date)', () => {
    const filters: FilterCondition[] = [
      {
        id: '1',
        field: 'createdAt',
        operator: 'between',
        values: ['2025-01-01', '2025-02-01'],
      },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query?.$and?.[0].createdAt.$gte).toBeInstanceOf(Date);
    expect(query?.$and?.[0].createdAt.$lte).toBeInstanceOf(Date);
  });

  test('not_between (date)', () => {
    const filters: FilterCondition[] = [
      {
        id: '1',
        field: 'createdAt',
        operator: 'not_between',
        values: ['2025-01-01', '2025-02-01'],
      },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query?.$and?.[0].$or).toBeDefined();
  });

  test('is_not (date)', () => {
    const filters: FilterCondition[] = [
      {
        id: '1',
        field: 'createdAt',
        operator: 'is_not',
        values: ['2025-03-01'],
      },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query?.$and?.[0].$or).toBeDefined();
  });

  // ---------- ARRAY OPERATORS ----------
  test('includes_all', () => {
    const filters: FilterCondition[] = [
      {
        id: '1',
        field: 'tags',
        operator: 'includes_all',
        values: ['urgent', 'work'],
      },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [{ tags: { $all: ['urgent', 'work'] } }],
    });
  });

  test('excludes_all', () => {
    const filters: FilterCondition[] = [
      {
        id: '1',
        field: 'tags',
        operator: 'excludes_all',
        values: ['spam', 'draft'],
      },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [{ tags: { $not: { $all: ['spam', 'draft'] } } }],
    });
  });

  test('overlaps (array range)', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'range', operator: 'overlaps', values: [10, 50] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [
        {
          $and: [{ 'range.0': { $lte: 50 } }, { 'range.1': { $gte: 10 } }],
        },
      ],
    });
  });

  test('contains (array numeric range)', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'range', operator: 'contains', values: [30] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [
        {
          $and: [{ 'range.0': { $lte: 30 } }, { 'range.1': { $gte: 30 } }],
        },
      ],
    });
  });

  // ---------- SELECT / MULTISELECT ----------
  test('is_any_of', () => {
    const filters: FilterCondition[] = [
      {
        id: '1',
        field: 'status',
        operator: 'is_any_of',
        values: ['open', 'closed'],
      },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [{ status: { $in: ['open', 'closed'] } }],
    });
  });

  test('is_not_any_of', () => {
    const filters: FilterCondition[] = [
      {
        id: '1',
        field: 'status',
        operator: 'is_not_any_of',
        values: ['archived'],
      },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [{ status: { $nin: ['archived'] } }],
    });
  });

  // ---------- EMPTY / NOT EMPTY ----------
  test('empty (string)', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'title', operator: 'empty', values: [] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [{ title: { $in: [null, undefined, ''] } }],
    });
  });

  test('not_empty (string)', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'title', operator: 'not_empty', values: [] },
    ];
    const { query } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toEqual({
      $and: [{ title: { $nin: [null, undefined, ''] } }],
    });
  });

  // ---------- ERROR HANDLING ----------
  test('invalid operator', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'title', operator: 'unknown', values: ['x'] },
    ];
    const { query, error } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toBeNull();
    expect(error).toBeInstanceOf(InvalidFilterError);
  });

  test('missing values (required operator)', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'age', operator: 'equals', values: [] },
    ];
    const { query, error } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toBeNull();
    expect(error).toBeInstanceOf(InvalidFilterError);
  });

  test('invalid date format', () => {
    const filters: FilterCondition[] = [
      { id: '1', field: 'createdAt', operator: 'is', values: ['invalid-date'] },
    ];
    const { query, error } = buildMongoQuery(filters, fieldTypeMap);
    expect(query).toBeNull();
    expect(error).toBeInstanceOf(InvalidFilterError);
  });
});
