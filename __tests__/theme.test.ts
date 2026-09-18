import { colors, minTouchTarget, spacing, typography } from '../src/theme';

describe('theme', () => {
  it('defines core colors', () => {
    expect(colors.primary).toBe('#4F46E5');
    expect(colors.background).toBeTruthy();
  });

  it('defines spacing scale', () => {
    expect(spacing.md).toBe(16);
    expect(minTouchTarget).toBeGreaterThanOrEqual(44);
  });

  it('defines typography styles', () => {
    expect(typography.display.fontSize).toBe(28);
    expect(typography.body.lineHeight).toBeGreaterThan(
      typography.body.fontSize,
    );
  });
});
