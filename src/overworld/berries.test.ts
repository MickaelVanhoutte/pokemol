import { describe, expect, it } from 'vitest';
import { isRipe, localDay } from './berries';

describe('berry bushes', () => {
  it('grow back the next local day', () => {
    const noon = new Date(2026, 9, 25, 12).getTime();
    const today = localDay(noon);
    expect(localDay(new Date(2026, 9, 25, 23, 59).getTime())).toBe(today);
    expect(localDay(new Date(2026, 9, 26, 0, 1).getTime())).toBe(today + 1);
    expect(isRipe(undefined, today)).toBe(true);
    expect(isRipe(today, today)).toBe(false);
    expect(isRipe(today - 1, today)).toBe(true);
  });
});
