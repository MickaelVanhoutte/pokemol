import { useEffect, useRef, useState } from 'preact/hooks';

export type NavKey = 'up' | 'down' | 'left' | 'right' | 'a' | 'b';

const KEYS: Record<string, NavKey> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
  Enter: 'a', ' ': 'a', z: 'a', Z: 'a',
  x: 'b', X: 'b', Escape: 'b', Backspace: 'b',
};

export function navKey(e: KeyboardEvent): NavKey | null {
  return KEYS[e.key] ?? null;
}

/** Cursor movement in a list or grid of `n` entries with `cols` columns (wraps around). */
export function moveCursor(i: number, n: number, dir: NavKey, cols = 1): number {
  if (n <= 0) return 0;
  if (cols <= 1) {
    if (dir === 'up') return (i - 1 + n) % n;
    if (dir === 'down') return (i + 1) % n;
    return i;
  }
  const rows = Math.ceil(n / cols);
  let r = Math.floor(i / cols), c = i % cols;
  if (dir === 'up') r = (r - 1 + rows) % rows;
  if (dir === 'down') r = (r + 1) % rows;
  if (dir === 'left') c = (c - 1 + cols) % cols;
  if (dir === 'right') c = (c + 1) % cols;
  return Math.min(n - 1, r * cols + c);
}

/** Keyboard navigation for a menu; touch/click activate entries directly. */
export function useMenuNav(
  n: number,
  opts: {
    onSelect: (i: number) => void; onCancel?: () => void; cols?: number; active?: boolean; initial?: number;
    /** ◀ ▶ in a one-column list (option values, pockets…). */
    onSide?: (dir: -1 | 1, i: number) => void;
  },
): [number, (i: number) => void] {
  const [cur, setCur] = useState(opts.initial ?? 0);
  const ref = useRef(opts);
  ref.current = opts;
  const curRef = useRef(cur);
  curRef.current = cur;
  useEffect(() => {
    if (opts.active === false) return;
    const onKey = (e: KeyboardEvent) => {
      const k = navKey(e);
      if (!k) return;
      e.preventDefault();
      // the innermost menu (registered first) wins
      e.stopImmediatePropagation();
      if (e.repeat && (k === 'a' || k === 'b')) return;
      if (k === 'a') ref.current.onSelect(curRef.current);
      else if (k === 'b') ref.current.onCancel?.();
      else if ((k === 'left' || k === 'right') && (ref.current.cols ?? 1) <= 1) ref.current.onSide?.(k === 'left' ? -1 : 1, curRef.current);
      else setCur(moveCursor(curRef.current, n, k, ref.current.cols));
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [n, opts.active]);
  return [Math.min(cur, Math.max(0, n - 1)), setCur];
}
