import { generateId, isValidId } from '../../src/utils/id';

describe('id utility', () => {
  it('generates unique non-empty ids', () => {
    const a = generateId();
    const b = generateId();
    expect(a).not.toBe(b);
    expect(isValidId(a)).toBe(true);
  });

  it('rejects invalid ids', () => {
    expect(isValidId('')).toBe(false);
    expect(isValidId('short')).toBe(false);
    expect(isValidId('has space')).toBe(false);
  });
});
