export interface SortOrderValidationResult {
  valid: boolean;
  normalized: number;
  error?: string;
}

export function validateSortOrder(
  value: number,
  maxExclusive?: number,
): SortOrderValidationResult {
  if (!Number.isFinite(value)) {
    return { valid: false, normalized: 0, error: 'Sort order must be a number.' };
  }

  const normalized = Math.trunc(value);

  if (normalized < 0) {
    return {
      valid: false,
      normalized,
      error: 'Sort order cannot be negative.',
    };
  }

  if (maxExclusive !== undefined && normalized >= maxExclusive) {
    return {
      valid: false,
      normalized,
      error: `Sort order must be less than ${maxExclusive}.`,
    };
  }

  return { valid: true, normalized };
}

export function normalizeSortOrders<T extends { sortOrder: number }>(
  items: T[],
): T[] {
  return [...items]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({ ...item, sortOrder: index }));
}
