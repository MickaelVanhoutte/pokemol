/** A piece of map drawn over the base rows while a story flag is (or is not) set. */
export interface PatchDef {
  id: string;
  x: number;
  y: number;
  /** Same characters as the map rows; '?' keeps the tile underneath. */
  rows: string[];
  if?: string;
  unless?: string;
}

export function patchActive(p: PatchDef, has: (flag: string) => boolean): boolean {
  return (!p.if || has(p.if)) && (!p.unless || !has(p.unless));
}

/** Returns the map rows with every active patch applied (pure, the base rows are not changed). */
export function applyPatches(rows: string[], patches: PatchDef[] | undefined, has: (flag: string) => boolean): string[] {
  if (!patches?.length) return rows;
  const out = rows.map((r) => r.split(''));
  for (const p of patches) {
    if (!patchActive(p, has)) continue;
    p.rows.forEach((row, dy) => {
      for (let dx = 0; dx < row.length; dx++) {
        const ch = row[dx];
        const line = out[p.y + dy];
        if (ch === '?' || !line || p.x + dx >= line.length) continue;
        line[p.x + dx] = ch;
      }
    });
  }
  return out.map((r) => r.join(''));
}
