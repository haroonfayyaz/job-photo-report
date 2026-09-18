import {
  normalizeSortOrders,
  validateSortOrder,
} from '../../src/domain/validation/sortOrder';

describe('sort order validation', () => {
  it('rejects negative sort order', () => {
    expect(validateSortOrder(-1).valid).toBe(false);
  });

  it('normalizes valid sort order', () => {
    expect(validateSortOrder(2.9).normalized).toBe(2);
    expect(validateSortOrder(2.9).valid).toBe(true);
  });

  it('enforces max exclusive bound', () => {
    expect(validateSortOrder(3, 3).valid).toBe(false);
    expect(validateSortOrder(2, 3).valid).toBe(true);
  });

  it('normalizes sort orders to contiguous indices', () => {
    const items = [
      { id: 'a', sortOrder: 5 },
      { id: 'b', sortOrder: 1 },
      { id: 'c', sortOrder: 3 },
    ];
    expect(normalizeSortOrders(items).map(i => i.sortOrder)).toEqual([0, 1, 2]);
  });
});
