import type { Dir } from '../save/schema';
import { footprint, paintBuilding } from './buildings';
import { LEGEND, type MapBuilding, type MapDef, type NpcDef, type SignDef, type Warp } from './mapTypes';
import { makeCanvas, Painter } from './pixel';
import { SpriteSheet, type Look } from './sprites';
import { tile } from './tiles';

export const TILE = 16;
const MARGIN = 9;
const WALK_MS = 210;
const RUN_MS = 120;

export const DIRS: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export interface Actor {
  id: string;
  x: number;
  y: number;
  dir: Dir;
  sheet: SpriteSheet;
  moving: boolean;
  t: number;
  fromX: number;
  fromY: number;
  ms: number;
  step: number;
  jumping?: boolean;
  bubble?: string;
  npc?: NpcDef;
  homeX: number;
  homeY: number;
  wanderIn: number;
  resolveMove?: () => void;
}

export interface LoadedMap {
  def: MapDef;
  w: number;
  h: number;
  tiles: string[];
  solid: Uint8Array;
  doors: Map<number, MapBuilding>;
  warps: Map<number, Warp>;
  signs: Map<number, SignDef>;
  layers: HTMLCanvasElement[];
}

export interface GameHooks {
  /** Called after each completed player step. Return true to stop auto-walking. */
  onStep(x: number, y: number): boolean | void;
  onInteract(target: { npc?: Actor; sign?: SignDef; tileId?: string; x: number; y: number }): void;
  onDoor(b: MapBuilding): void;
  onMenu(): void;
}

export class Input {
  held = new Set<Dir>();
  order: Dir[] = [];
  a = false;
  b = false;
  run = false;
  private aQueued = false;
  private menuQueued = false;

  press(d: Dir) {
    if (!this.held.has(d)) {
      this.held.add(d);
      this.order.push(d);
    }
  }
  release(d: Dir) {
    this.held.delete(d);
    this.order = this.order.filter((x) => x !== d);
  }
  current(): Dir | null {
    return this.order.length ? this.order[this.order.length - 1] : null;
  }
  pressA() { this.aQueued = true; }
  pressMenu() { this.menuQueued = true; }
  takeA() { const v = this.aQueued; this.aQueued = false; return v; }
  takeMenu() { const v = this.menuQueued; this.menuQueued = false; return v; }
  clear() {
    this.held.clear();
    this.order = [];
    this.aQueued = false;
    this.menuQueued = false;
    this.run = false;
  }
}

const sheetCache = new Map<string, SpriteSheet>();
export function sheetFor(look: Look): SpriteSheet {
  const key = JSON.stringify(look);
  let s = sheetCache.get(key);
  if (!s) {
    s = new SpriteSheet(look);
    sheetCache.set(key, s);
  }
  return s;
}

export function loadMap(def: MapDef, visibleNpc: (n: NpcDef) => boolean): { map: LoadedMap; npcs: Actor[] } {
  const h = def.rows.length;
  const w = Math.max(...def.rows.map((r) => r.length));
  const tiles: string[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) tiles.push(LEGEND[def.rows[y][x] ?? ' '] ?? 'void');
  const solid = new Uint8Array(w * h);
  tiles.forEach((id, i) => (solid[i] = tile(id).solid ? 1 : 0));
  const doors = new Map<number, MapBuilding>();
  for (const b of def.buildings ?? []) {
    for (const f of footprint(b)) {
      if (f.x < 0 || f.y < 0 || f.x >= w || f.y >= h) continue;
      solid[f.y * w + f.x] = f.door ? 0 : 1;
      if (f.door) doors.set(f.y * w + f.x, b);
    }
  }
  const warps = new Map<number, Warp>((def.warps ?? []).map((wp) => [wp.y * w + wp.x, wp]));
  const signs = new Map<number, SignDef>((def.signs ?? []).map((s) => [s.y * w + s.x, s]));

  const get = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? def.border : tiles[y * w + x]);
  const layers: HTMLCanvasElement[] = [];
  for (let frame = 0; frame < 2; frame++) {
    const c = makeCanvas((w + MARGIN * 2) * TILE, (h + MARGIN * 2) * TILE);
    const ctx = c.getContext('2d')!;
    const p = new Painter(ctx);
    for (let y = -MARGIN; y < h + MARGIN; y++) {
      for (let x = -MARGIN; x < w + MARGIN; x++) {
        const id = get(x, y);
        p.at((x + MARGIN) * TILE, (y + MARGIN) * TILE);
        tile(id).paint(p, frame, (dx, dy) => get(x + dx, y + dy), x, y);
      }
    }
    for (const b of def.buildings ?? []) ctx.drawImage(paintBuilding(b), (b.x + MARGIN) * TILE, (b.y + MARGIN) * TILE);
    layers.push(c);
  }
  const npcs: Actor[] = (def.npcs ?? []).filter(visibleNpc).map((n) => ({
    id: n.id, x: n.x, y: n.y, dir: n.facing, sheet: sheetFor(n.look), moving: false, t: 0,
    fromX: n.x, fromY: n.y, ms: WALK_MS * 1.3, step: 0, npc: n, homeX: n.x, homeY: n.y,
    wanderIn: 1500 + Math.random() * 2500,
  }));
  return { map: { def, w, h, tiles, solid, doors, warps, signs, layers }, npcs };
}

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  input = new Input();
  map!: LoadedMap;
  npcs: Actor[] = [];
  player!: Actor;
  /** While > 0, player input is ignored (scripts, dialogs, menus). */
  lock = 0;
  fade = 0;
  hooks: GameHooks;
  viewW = 240;
  viewH = 160;
  private frame = 0;
  private animClock = 0;
  private last = 0;
  private raf = 0;
  private turnDelay = 0;
  private rustle: { x: number; y: number; t: number }[] = [];

  constructor(hooks: GameHooks) {
    this.hooks = hooks;
    this.canvas = makeCanvas(240, 160);
    this.canvas.className = 'ow-canvas';
    this.ctx = this.canvas.getContext('2d')!;
  }

  setPlayer(look: Look, x: number, y: number, dir: Dir) {
    this.player = {
      id: 'player', x, y, dir, sheet: sheetFor(look), moving: false, t: 0, fromX: x, fromY: y,
      ms: WALK_MS, step: 0, homeX: x, homeY: y, wanderIn: 0,
    };
  }

  setMap(def: MapDef, visibleNpc: (n: NpcDef) => boolean) {
    const { map, npcs } = loadMap(def, visibleNpc);
    this.map = map;
    this.npcs = npcs;
  }

  resize(cssW: number, cssH: number) {
    const scale = Math.max(2, Math.floor(Math.min(cssW / 240, cssH / 160)));
    this.viewW = Math.ceil(cssW / scale);
    this.viewH = Math.ceil(cssH / scale);
    this.canvas.width = this.viewW;
    this.canvas.height = this.viewH;
    this.canvas.style.width = `${this.viewW * scale}px`;
    this.canvas.style.height = `${this.viewH * scale}px`;
    this.ctx.imageSmoothingEnabled = false;
    this.render();
  }

  start() {
    cancelAnimationFrame(this.raf);
    this.last = performance.now();
    const loop = (ts: number) => {
      const dt = Math.min(50, ts - this.last);
      this.last = ts;
      this.update(dt);
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
  }

  // ------------------------------------------------------------ world queries

  inside(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.map.w && y < this.map.h;
  }
  tileAt(x: number, y: number): string {
    return this.inside(x, y) ? this.map.tiles[y * this.map.w + x] : this.map.def.border;
  }
  actorAt(x: number, y: number, except?: Actor): Actor | undefined {
    const all = [...this.npcs, this.player];
    return all.find((a) => a !== except && ((a.x === x && a.y === y) || (a.moving && a.fromX === x && a.fromY === y)));
  }
  blocked(x: number, y: number, who?: Actor): boolean {
    if (!this.inside(x, y)) return true;
    if (this.map.solid[y * this.map.w + x]) return true;
    return !!this.actorAt(x, y, who);
  }

  // ------------------------------------------------------------ movement

  /** Starts a one-tile move (or ledge jump). Returns false when blocked. */
  tryMove(a: Actor, dir: Dir, ms = a === this.player ? (this.input.run ? RUN_MS : WALK_MS) : a.ms): boolean {
    a.dir = dir;
    const [dx, dy] = DIRS[dir];
    let nx = a.x + dx, ny = a.y + dy;
    let jumping = false;
    if (this.inside(nx, ny) && tile(this.tileAt(nx, ny)).ledge) {
      if (dir !== 'down' || this.blocked(nx, ny + 1, a)) return false;
      ny += 1;
      jumping = true;
    } else if (this.blocked(nx, ny, a)) {
      return false;
    }
    a.fromX = a.x;
    a.fromY = a.y;
    a.x = nx;
    a.y = ny;
    a.moving = true;
    a.jumping = jumping;
    a.t = 0;
    a.ms = jumping ? ms * 2 : ms;
    a.step++;
    return true;
  }

  /** Script helper: walks an actor along directions, resolving when done. */
  async walk(a: Actor, dirs: Dir[], ms = WALK_MS * 1.2) {
    for (const d of dirs) {
      let tries = 0;
      while (!this.tryMove(a, d, ms)) {
        if (++tries > 40) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      await new Promise<void>((r) => (a.resolveMove = r));
    }
  }

  face(a: Actor, dir: Dir) {
    a.dir = dir;
  }

  faceToward(a: Actor, b: Actor) {
    const dx = b.x - a.x, dy = b.y - a.y;
    a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  }

  front(a: Actor): [number, number] {
    const [dx, dy] = DIRS[a.dir];
    return [a.x + dx, a.y + dy];
  }

  private updateActor(a: Actor, dt: number): boolean {
    if (!a.moving) return false;
    a.t += dt / a.ms;
    if (a.t >= 1) {
      a.t = 0;
      a.moving = false;
      a.jumping = false;
      const r = a.resolveMove;
      a.resolveMove = undefined;
      r?.();
      return true;
    }
    return false;
  }

  update(dt: number) {
    this.animClock += dt;
    if (this.animClock > 420) {
      this.animClock = 0;
      this.frame ^= 1;
    }
    this.rustle = this.rustle.filter((r) => (r.t += dt) < 260);
    const p = this.player;
    const finished = this.updateActor(p, dt);
    if (finished) {
      if (tile(this.tileAt(p.x, p.y)).encounter) this.rustle.push({ x: p.x, y: p.y, t: 0 });
      const stop = this.hooks.onStep(p.x, p.y);
      if (stop) this.input.clear();
    }
    for (const n of this.npcs) {
      this.updateActor(n, dt);
      if (n.npc?.wander && !n.moving && this.lock === 0) {
        n.wanderIn -= dt;
        if (n.wanderIn <= 0) {
          n.wanderIn = 1800 + Math.random() * 2600;
          const dirs: Dir[] = ['up', 'down', 'left', 'right'];
          const d = dirs[Math.floor(Math.random() * 4)];
          const [dx, dy] = DIRS[d];
          if (Math.abs(n.x + dx - n.homeX) <= 2 && Math.abs(n.y + dy - n.homeY) <= 2 && Math.random() < 0.6) this.tryMove(n, d);
          else n.dir = d;
        }
      }
    }
    if (this.lock > 0 || p.moving) {
      if (this.lock > 0) this.input.takeA();
      return;
    }
    if (this.input.takeMenu()) {
      this.hooks.onMenu();
      return;
    }
    if (this.input.takeA()) {
      const [fx, fy] = this.front(p);
      let tx = fx, ty = fy;
      // talk across counters
      if (this.tileAt(fx, fy) === 'counter') { tx += fx - p.x; ty += fy - p.y; }
      const npc = this.actorAt(tx, ty, p) ?? this.actorAt(fx, fy, p);
      const sign = this.map.signs.get(fy * this.map.w + fx);
      this.hooks.onInteract({ npc, sign, tileId: this.tileAt(fx, fy), x: fx, y: fy });
      return;
    }
    const d = this.input.current();
    if (!d) {
      this.turnDelay = 0;
      return;
    }
    if (d !== p.dir && this.turnDelay <= 0 && !finished) {
      p.dir = d;
      this.turnDelay = 90;
      return;
    }
    if (this.turnDelay > 0) {
      this.turnDelay -= dt;
      if (this.turnDelay > 0) return;
    }
    const [dx, dy] = DIRS[d];
    const door = this.map.doors.get((p.y + dy) * this.map.w + (p.x + dx));
    if (!this.tryMove(p, d)) {
      p.dir = d;
      return;
    }
    if (door) {
      // finish the step into the doorway, then hand over
      p.resolveMove = () => this.hooks.onDoor(door);
    }
  }

  // ------------------------------------------------------------ rendering

  private pos(a: Actor): [number, number] {
    if (!a.moving) return [a.x * TILE, a.y * TILE];
    const t = a.t;
    let x = (a.fromX + (a.x - a.fromX) * t) * TILE;
    let y = (a.fromY + (a.y - a.fromY) * t) * TILE;
    if (a.jumping) y -= Math.sin(t * Math.PI) * 8;
    return [x, y];
  }

  render() {
    const ctx = this.ctx;
    if (!this.map || !this.player) return;
    const [px, py] = this.pos(this.player);
    const mapW = this.map.w * TILE, mapH = this.map.h * TILE;
    let camX = mapW <= this.viewW ? (mapW - this.viewW) / 2 : Math.min(Math.max(px + 8 - this.viewW / 2, 0), mapW - this.viewW);
    let camY = mapH <= this.viewH ? (mapH - this.viewH) / 2 : Math.min(Math.max(py + 8 - this.viewH / 2, 0), mapH - this.viewH);
    camX = Math.round(camX);
    camY = Math.round(camY);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    ctx.drawImage(this.map.layers[this.frame], -camX - MARGIN * TILE, -camY - MARGIN * TILE);

    const actors = [...this.npcs, this.player].sort((a, b) => this.pos(a)[1] - this.pos(b)[1]);
    for (const a of actors) {
      const [ax, ay] = this.pos(a);
      const sx = Math.round(ax - camX), sy = Math.round(ay - camY);
      if (sx < -16 || sy < -16 || sx > this.viewW || sy > this.viewH) continue;
      if (a.jumping) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(sx + 3, Math.round((a.fromY + (a.y - a.fromY) * a.t) * TILE - camY) + 13, 10, 3);
      }
      a.sheet.draw(ctx, a.dir, a.moving && a.t > 0.15 && a.t < 0.85, a.step, sx, sy - 2);
      // tall grass hides the legs
      const onGrass = !a.moving && tile(this.tileAt(a.x, a.y)).over;
      if (onGrass) {
        ctx.drawImage(this.map.layers[this.frame], (a.x + MARGIN) * TILE, (a.y + MARGIN) * TILE + 9, TILE, 7, sx, a.y * TILE - camY + 9, TILE, 7);
      }
      if (a.bubble) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(sx + 4, sy - 14, 9, 11);
        ctx.fillStyle = '#2a2238';
        ctx.fillRect(sx + 4, sy - 14, 9, 1); ctx.fillRect(sx + 4, sy - 4, 9, 1);
        ctx.fillRect(sx + 3, sy - 13, 1, 9); ctx.fillRect(sx + 13, sy - 13, 1, 9);
        ctx.fillStyle = '#d64545';
        ctx.fillRect(sx + 8, sy - 12, 1, 5);
        ctx.fillRect(sx + 8, sy - 6, 1, 1);
      }
    }
    for (const r of this.rustle) {
      const k = r.t / 260;
      ctx.fillStyle = '#2c6f2a';
      const bx = r.x * TILE - camX, by = r.y * TILE - camY;
      ctx.fillRect(bx + 2 - k * 4, by + 6 - k * 6, 2, 2);
      ctx.fillRect(bx + 12 + k * 4, by + 6 - k * 6, 2, 2);
    }
    if (this.fade > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.fade})`;
      ctx.fillRect(0, 0, this.viewW, this.viewH);
    }
  }

  async fadeTo(target: number, ms = 220) {
    const start = this.fade;
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        const k = Math.min(1, (performance.now() - t0) / ms);
        this.fade = start + (target - start) * k;
        if (k < 1) requestAnimationFrame(tick);
        else resolve();
      };
      tick();
    });
  }

  npc(id: string): Actor | undefined {
    return this.npcs.find((n) => n.id === id);
  }

  /** Adds an actor for a cutscene (e.g. the professor walking in). */
  spawn(id: string, look: Look, x: number, y: number, dir: Dir): Actor {
    const a: Actor = {
      id, x, y, dir, sheet: sheetFor(look), moving: false, t: 0, fromX: x, fromY: y, ms: WALK_MS * 1.2, step: 0,
      homeX: x, homeY: y, wanderIn: 0,
    };
    this.npcs.push(a);
    return a;
  }

  remove(id: string) {
    this.npcs = this.npcs.filter((n) => n.id !== id);
  }
}
