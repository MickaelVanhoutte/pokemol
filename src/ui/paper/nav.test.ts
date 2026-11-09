import { describe, expect, it } from 'vitest';
import { gridCursor, moveCursor } from './nav';

describe('gridCursor: the party cards, Retour under them', () => {
  it('moves through 2 columns of 6 cards', () => {
    expect(gridCursor(0, 6, 'right', 2, true)).toBe(1);
    expect(gridCursor(1, 6, 'right', 2, true)).toBe(0);
    expect(gridCursor(0, 6, 'down', 2, true)).toBe(2);
    expect(gridCursor(3, 6, 'up', 2, true)).toBe(1);
  });

  it('reaches Retour below the last row and comes back', () => {
    expect(gridCursor(4, 6, 'down', 2, true)).toBe(6);
    expect(gridCursor(5, 6, 'down', 2, true)).toBe(6);
    expect(gridCursor(6, 6, 'up', 2, true)).toBe(4);
    expect(gridCursor(6, 6, 'down', 2, true)).toBe(0);
    expect(gridCursor(0, 6, 'up', 2, true)).toBe(6);
    expect(gridCursor(6, 6, 'left', 2, true)).toBe(6);
  });

  it('keeps an uneven last row in its own cards', () => {
    expect(gridCursor(2, 3, 'right', 2, true)).toBe(2);
    expect(gridCursor(1, 3, 'down', 2, true)).toBe(2);
    expect(gridCursor(3, 3, 'up', 2, true)).toBe(2);
  });

  it('wraps round without Retour (a forced switch)', () => {
    expect(gridCursor(4, 6, 'down', 2, false)).toBe(0);
    expect(gridCursor(1, 6, 'up', 2, false)).toBe(5);
    expect(gridCursor(0, 5, 'up', 2, false)).toBe(4);
    expect(gridCursor(1, 5, 'up', 2, false)).toBe(4);
  });

  it('turned sideways: 3 columns', () => {
    expect(gridCursor(2, 6, 'right', 3, true)).toBe(0);
    expect(gridCursor(1, 6, 'down', 3, true)).toBe(4);
    expect(gridCursor(4, 6, 'down', 3, true)).toBe(6);
    expect(gridCursor(6, 6, 'up', 3, true)).toBe(3);
  });

  it('leaves plain lists alone', () => {
    expect(moveCursor(0, 3, 'up')).toBe(2);
  });
});
