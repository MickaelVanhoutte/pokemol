/**
 * The fresque: a sliding picture puzzle. A board lists, for each place (row by row), the piece
 * sitting there; the last piece number is the gap. Any piece can be put into the gap (the owner found
 * the neighbours-only rule too hard); the arrow keys still push the piece facing it.
 */
export type Board = number[];

export const solvedBoard = (n: number): Board => Array.from({ length: n * n }, (_, i) => i);
export const isSolved = (b: Board) => b.every((v, i) => v === i);
export const gapOf = (b: Board) => b.indexOf(b.length - 1);

/** Places next to `pos` on an n×n board. */
export function neighbours(pos: number, n: number): number[] {
  const x = pos % n, y = Math.floor(pos / n);
  return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n).map(([a, b]) => b * n + a);
}

/** Puts the piece at `pos` into the gap, wherever it is (null for the gap itself or off the board). */
export function slide(b: Board, pos: number, n: number): Board | null {
  const gap = gapOf(b);
  if (pos === gap || pos < 0 || pos >= n * n) return null;
  const out = [...b];
  [out[gap], out[pos]] = [out[pos], out[gap]];
  return out;
}

/** Arrow keys: the piece on the other side of the gap moves that way into it. */
export function push(b: Board, dir: 'up' | 'down' | 'left' | 'right', n: number): Board | null {
  const gap = gapOf(b);
  const x = gap % n, y = Math.floor(gap / n);
  const [fx, fy] = dir === 'left' ? [x + 1, y] : dir === 'right' ? [x - 1, y] : dir === 'up' ? [x, y + 1] : [x, y - 1];
  if (fx < 0 || fy < 0 || fx >= n || fy >= n) return null;
  return slide(b, fy * n + fx, n);
}

/**
 * A mixed-up board reached by random moves from the solved picture (so it can always be solved),
 * never already solved. `rnd` returns numbers in [0, 1).
 */
export function shuffle(n: number, moves: number, rnd: () => number): Board {
  let b = solvedBoard(n);
  let prev = -1;
  for (let i = 0; i < moves || isSolved(b); i++) {
    const gap = gapOf(b);
    const options = neighbours(gap, n).filter((p) => p !== prev);
    const pick = options[Math.floor(rnd() * options.length)];
    b = slide(b, pick, n)!;
    prev = gap;
  }
  return b;
}
