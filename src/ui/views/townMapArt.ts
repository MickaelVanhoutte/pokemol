import { WORLD, WORLD_H, WORLD_W, type Rect } from '../../data/worldmap';
import { pencilize } from '../../overworld/pencil';
import { makeCanvas, Painter } from '../../overworld/pixel';

/** Pixels per grid cell on the drawn map. */
export const CELL = 8;

/** Part of the grid that is drawn: every place, with a little land around, full height. */
export const VIEW = (() => {
  const rects = Object.values(WORLD).flatMap((w) => w.rects);
  const x = Math.max(0, Math.min(...rects.map((r) => r.x)) - 2);
  const x1 = Math.min(WORLD_W, Math.max(...rects.map((r) => r.x + r.w)) + 2);
  return { x, y: 0, w: x1 - x, h: WORLD_H };
})();

const C = {
  paper: '#f6efd9', land: '#9fd37a', landEdge: '#7cb85a', sea: '#7db7ef', path: '#e6d49c', pathEdge: '#b89a5a',
  ink: '#2b2536', roof: '#d64545', roofOff: '#c9c2d4', wall: '#fff3d6', cave: '#8a6a4a', tower: '#9a96a8', building: '#6a5aa6',
  page: '#ffffff',
};

const px = (r: Rect) => ({ x: r.x * CELL, y: r.y * CELL, w: r.w * CELL, h: r.h * CELL });

/**
 * Paints Papeterre in coloured pencil, like the overworld: land around every place, the sea south
 * of Port-Aquarelle, routes as paths, towns as roofs (grey until visited), caves, tower, buildings.
 */
export function paintTownMap(visited: (place: string) => boolean): string {
  const c = makeCanvas(VIEW.w * CELL, VIEW.h * CELL);
  const p = new Painter(c.getContext('2d')!, -VIEW.x * CELL, -VIEW.y * CELL);
  const sheet = new Painter(c.getContext('2d')!);
  sheet.rect(0, 0, c.width, c.height, C.paper);
  const cells = Object.values(WORLD).flatMap((w) => w.rects.flatMap((r) => {
    const out: [number, number][] = [];
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) out.push([x, y]);
    return out;
  }));
  // land: soft blobs around every place
  for (const [x, y] of cells) p.disc(x * CELL + 4, y * CELL + 4, 12, C.landEdge);
  for (const [x, y] of cells) p.disc(x * CELL + 4, y * CELL + 4, 10.5, C.land);
  // the sea south of the port
  for (let x = 13; x <= 19; x++) for (let y = 15; y <= 17; y++) p.disc(x * CELL + 4, y * CELL + 4, 7, C.sea);
  // the edge of the page: a white margin at the top
  sheet.rect(0, 0, c.width, 5, C.page);
  for (let x = 0; x < c.width; x += 4) sheet.rect(x, 5, 2, 1, C.ink);

  const order: Record<string, number> = { route: 0, cave: 1, building: 2, tower: 3, town: 4 };
  const entries = Object.entries(WORLD).filter(([, w]) => !w.of).sort((a, b) => order[a[1].kind] - order[b[1].kind]);
  for (const [id, w] of entries) {
    for (const r of w.rects) {
      const { x, y, w: rw, h: rh } = px(r);
      switch (w.kind) {
        case 'route':
          p.rect(x + 1, y + 1, rw - 2, rh - 2, C.pathEdge);
          p.rect(x + 2, y + 2, rw - 4, rh - 4, C.path);
          break;
        case 'cave':
          p.disc(x + rw / 2, y + rh / 2, Math.min(rw, rh) / 2, C.ink);
          p.disc(x + rw / 2, y + rh / 2, Math.min(rw, rh) / 2 - 1, C.cave);
          p.rect(x + rw / 2 - 1, y + rh / 2, 2, 2, C.ink);
          break;
        case 'tower':
          p.rect(x + 2, y, 4, rh, C.ink);
          p.rect(x + 3, y + 1, 2, rh - 1, C.tower);
          break;
        case 'building':
          p.rect(x + 1, y + 2, rw - 2, rh - 3, C.ink);
          p.rect(x + 2, y + 3, rw - 4, rh - 5, C.building);
          break;
        case 'town': {
          const page = id === 'bordPage';
          p.rect(x, y, rw, rh, C.ink);
          p.rect(x + 1, y + 1, rw - 2, rh - 2, page ? C.page : C.wall);
          if (!page) p.rect(x + 1, y + 1, rw - 2, Math.ceil((rh - 2) / 2), visited(id) ? C.roof : C.roofOff);
          break;
        }
      }
    }
  }
  pencilize(c);
  return c.toDataURL();
}
