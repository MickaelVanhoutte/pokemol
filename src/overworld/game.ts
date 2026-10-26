import type { Dir } from '../save/schema';
import { footprint, paintBuilding } from './buildings';
import { LEGEND, type BerryBushDef, type MapBuilding, type MapDef, type NpcDef, type ObstacleDef, type PickupDef, type SignDef, type Warp } from './mapTypes';
import { fieldSprite } from './fieldSprites';
import { BERRY_DOT } from './berries';
import { makeCanvas, Painter } from './pixel';
import { pencilize } from './pencil';
import { SpriteSheet, type Look } from './sprites';
import { tile } from './tiles';

export const TILE = 16;
const MARGIN = 9;
const WALK_MS = 210;
const RUN_MS = 120;
const BIKE_MS = 85;
/** One tile slid on glossy paper. */
const SLIDE_MS = 95;

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
  /** Time (ms) left over from the step that just ended, so the next step continues smoothly. */
  carry?: number;
  /** Sliding on glossy paper (no walking animation, no control). */
  sliding?: boolean;
}

/** The first Bestiole of the party, walking one step behind the player (drawn from its miniature). */
export interface Follower {
  x: number;
  y: number;
  fromX: number;
  fromY: number;
  t: number;
  ms: number;
  moving: boolean;
  jumping?: boolean;
  dir: Dir;
  img: HTMLImageElement;
  /** Which way the drawing looks, to turn it towards where it walks. */
  faces?: 'left' | 'right';
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
  onInteract(target: { npc?: Actor; sign?: SignDef; pickup?: PickupDef; obstacle?: ObstacleDef; tileId?: string; x: number; y: number }): void;
  onDoor(b: MapBuilding): void;
  onMenu(): void;
  /** A boulder or block was pushed one tile. */
  onPush?(o: ObstacleDef): void;
  /** A boulder or block was pushed into the pit at (x, y) (it is already off the map). */
  onDrop?(o: ObstacleDef, x: number, y: number): void;
  /** Whether the player may step into the pit at (x, y) and fall to the floor below. */
  canFall?(x: number, y: number): boolean;
  /** A talk to the Bestiole that follows. */
  onFollower?(): void;
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
    pencilize(c);
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
  /** Holding B runs only once the player owns running shoes. */
  canRun: () => boolean = () => true;
  /** Sailing on the paper boat (water is walkable for the player, landing ends it). */
  surfing = false;
  /** Riding the Pencil Bike. */
  biking = false;
  /** Strong Gloves on: walking into a boulder pushes it (until the next map). */
  strength = false;
  /** The Bestiole walking behind the player (null: none, or switched off). */
  follower: Follower | null = null;
  /** Obstacles still standing on this map (cut bushes and broken rocks are gone until it is entered again). */
  obstacles: ObstacleDef[] = [];
  map!: LoadedMap;
  npcs: Actor[] = [];
  pickups: PickupDef[] = [];
  /** Bushes that have berries right now. */
  berries: BerryBushDef[] = [];
  player!: Actor;
  /** While > 0, player input is ignored (scripts, dialogs, menus). */
  lock = 0;
  fade = 0;
  /** Colour of the fade (black, or white for flashes and dreams). */
  fadeColor = '0,0,0';
  /** Battle transition: 0 = clear, 1 = screen fully scribbled over. */
  wipe = 0;
  wipeKind: 'pencil' | 'eraser' = 'pencil';
  /** The camera shakes until this time (performance.now()). */
  shakeUntil = 0;
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

  setMap(def: MapDef, visibleNpc: (n: NpcDef) => boolean, visiblePickup: (p: PickupDef) => boolean = () => true, ripe: (b: BerryBushDef) => boolean = () => true) {
    const { map, npcs } = loadMap(def, visibleNpc);
    this.map = map;
    this.npcs = npcs;
    this.pickups = (def.items ?? []).filter(visiblePickup);
    this.berries = (def.berries ?? []).filter(ripe);
    this.obstacles = (def.obstacles ?? []).map((o) => ({ ...o }));
    this.surfing = false;
    this.strength = false;
    if (def.indoor || def.dungeon) this.biking = false;
  }

  obstacleAt(x: number, y: number): ObstacleDef | undefined {
    return this.obstacles.find((o) => o.x === x && o.y === y);
  }

  removeObstacle(o: ObstacleDef) {
    this.obstacles = this.obstacles.filter((q) => q !== o);
  }

  pickBerries(b: BerryBushDef) {
    this.berries = this.berries.filter((q) => q !== b);
  }

  removePickup(p: PickupDef) {
    this.pickups = this.pickups.filter((q) => q !== p);
  }

  /** The follower is in its Crayon-ball while sailing or riding the bike. */
  followerShown(): boolean {
    return !!this.follower && !this.surfing && !this.biking;
  }

  /** Puts the follower one step behind the player (on the player when there is no room). */
  placeFollower() {
    const f = this.follower, p = this.player;
    if (!f || !p) return;
    const [dx, dy] = DIRS[p.dir];
    const bx = p.x - dx, by = p.y - dy;
    const free = this.inside(bx, by) && !this.map.solid[by * this.map.w + bx] && !this.actorAt(bx, by, p);
    Object.assign(f, { x: free ? bx : p.x, y: free ? by : p.y, fromX: free ? bx : p.x, fromY: free ? by : p.y, t: 0, moving: false, jumping: false, dir: p.dir });
  }

  /** The follower steps into the tile the player just left. */
  private follow(tx: number, ty: number, ms: number, jumping: boolean) {
    const f = this.follower;
    if (!f) return;
    // too far (after a warp or a slide): it just appears behind
    if (Math.abs(f.x - tx) + Math.abs(f.y - ty) > 2) {
      Object.assign(f, { x: tx, y: ty, fromX: tx, fromY: ty, moving: false, t: 0 });
      return;
    }
    if (f.x === tx && f.y === ty) return;
    f.dir = tx > f.x ? 'right' : tx < f.x ? 'left' : ty > f.y ? 'down' : 'up';
    Object.assign(f, { fromX: f.x, fromY: f.y, x: tx, y: ty, t: 0, ms, moving: true, jumping });
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
    // sailing: the player can go on water (and lands by walking onto the shore)
    if (this.map.solid[y * this.map.w + x] && !(who === this.player && this.surfing && this.tileAt(x, y) === 'water')) return true;
    if (this.obstacleAt(x, y)) return true;
    if (this.pickups.some((p) => p.x === x && p.y === y)) return true;
    return !!this.actorAt(x, y, who);
  }

  // ------------------------------------------------------------ movement

  /** Starts a one-tile move (or ledge jump). Returns false when blocked. `push`: may push a boulder or block. */
  tryMove(a: Actor, dir: Dir, ms = a === this.player ? (this.biking ? BIKE_MS : this.input.run && this.canRun() ? RUN_MS : WALK_MS) : a.ms, push = true): boolean {
    a.dir = dir;
    const [dx, dy] = DIRS[dir];
    let nx = a.x + dx, ny = a.y + dy;
    // walking into a Gomme block, or a boulder with the Strong Gloves on, pushes it one tile (if
    // there is room); pushed into a pit, it falls to the floor below
    const o = a === this.player && push ? this.obstacleAt(nx, ny) : undefined;
    if (o && (o.kind === 'block' || (o.kind === 'boulder' && this.strength))) {
      const bx = nx + dx, by = ny + dy;
      if (this.tileAt(bx, by) === 'hole' && !this.actorAt(bx, by)) {
        this.removeObstacle(o);
        this.hooks.onDrop?.(o, bx, by);
      } else {
        if (this.blocked(bx, by) || this.tileAt(bx, by) === 'water' || tile(this.tileAt(bx, by)).ledge || this.map.warps.has(by * this.map.w + bx)) return false;
        o.x = bx;
        o.y = by;
        this.hooks.onPush?.(o);
      }
    }
    // a pit with a floor below: the player steps in and falls through
    const fall = a === this.player && this.tileAt(nx, ny) === 'hole' && !this.obstacleAt(nx, ny) && !!this.hooks.canFall?.(nx, ny);
    let jumping = false;
    if (this.inside(nx, ny) && tile(this.tileAt(nx, ny)).ledge) {
      if (dir !== 'down' || this.blocked(nx, ny + 1, a)) return false;
      ny += 1;
      jumping = true;
    } else if (!fall && this.blocked(nx, ny, a)) {
      return false;
    }
    if (a === this.player) this.follow(a.x, a.y, jumping ? ms * 2 : ms, jumping);
    a.fromX = a.x;
    a.fromY = a.y;
    a.x = nx;
    a.y = ny;
    a.moving = true;
    a.jumping = jumping;
    a.ms = jumping ? ms * 2 : ms;
    // a step chained right after another starts where the last frame's leftover time puts it:
    // dropping it made the player stand still for a frame on every tile
    a.t = Math.min(0.5, (a.carry ?? 0) / a.ms);
    a.carry = 0;
    a.step++;
    return true;
  }

  /** Script helper: walks an actor along directions, resolving when done. */
  async walk(a: Actor, dirs: Dir[], ms = WALK_MS * 1.2) {
    for (const d of dirs) {
      let tries = 0;
      let moved = true;
      while (!this.tryMove(a, d, ms)) {
        // still blocked after 4 s: skip that step rather than wait forever for it
        if (++tries > 40) { moved = false; break; }
        await new Promise((r) => setTimeout(r, 100));
      }
      if (moved) await new Promise<void>((r) => (a.resolveMove = r));
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
      a.carry = (a.t - 1) * a.ms;
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
    // leftover time only carries into a step that starts in this same frame
    p.carry = 0;
    const finished = this.updateActor(p, dt);
    const fw = this.follower;
    if (fw?.moving) {
      fw.t += dt / fw.ms;
      if (fw.t >= 1) Object.assign(fw, { t: 0, moving: false, jumping: false, fromX: fw.x, fromY: fw.y });
    }
    // landing on the shore puts the boat away
    if (finished && this.surfing && this.tileAt(p.x, p.y) !== 'water') this.surfing = false;
    if (finished) {
      if (tile(this.tileAt(p.x, p.y)).encounter) this.rustle.push({ x: p.x, y: p.y, t: 0 });
      const stop = this.hooks.onStep(p.x, p.y);
      if (stop) this.input.clear();
      // glossy paper: keep sliding the same way until something is in the way
      p.sliding = !stop && this.lock === 0 && this.tileAt(p.x, p.y) === 'glossy' && this.tryMove(p, p.dir, SLIDE_MS, false);
    }
    for (const n of this.npcs) {
      n.carry = 0;
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
      if (!npc && this.followerShown() && this.follower!.x === fx && this.follower!.y === fy && !this.follower!.moving) {
        this.hooks.onFollower?.();
        return;
      }
      const sign = this.map.signs.get(fy * this.map.w + fx);
      const pickup = this.pickups.find((q) => q.x === fx && q.y === fy);
      this.hooks.onInteract({ npc, sign, pickup, obstacle: this.obstacleAt(fx, fy), tileId: this.tileAt(fx, fy), x: fx, y: fy });
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

  private followerPos(f: Follower): [number, number] {
    const t = f.moving ? f.t : 1;
    let y = (f.fromY + (f.y - f.fromY) * t) * TILE;
    if (f.jumping) y -= Math.sin(t * Math.PI) * 8;
    return [(f.fromX + (f.x - f.fromX) * t) * TILE, y];
  }

  private drawFollower(ctx: CanvasRenderingContext2D, f: Follower, camX: number, camY: number) {
    if (!f.img.complete || !f.img.naturalWidth) return;
    const [fx, fy] = this.followerPos(f);
    const w = f.img.naturalWidth, h = f.img.naturalHeight;
    const bob = f.moving && f.t > 0.25 && f.t < 0.75 ? 1 : 0;
    const x = Math.round(fx - camX + (TILE - w) / 2), y = Math.round(fy - camY + TILE - h - 1 - bob);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(Math.round(fx - camX) + 3, Math.round(fy - camY) + 13, 10, 3);
    // turn the drawing towards where it walks
    const flip = (f.dir === 'left' && f.faces === 'right') || (f.dir === 'right' && f.faces === 'left') || (f.dir === 'left' && !f.faces);
    if (flip) {
      ctx.save();
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(f.img, 0, 0);
      ctx.restore();
    } else ctx.drawImage(f.img, x, y);
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
    if (performance.now() < this.shakeUntil) {
      camX += Math.round((Math.random() - 0.5) * 6);
      camY += Math.round((Math.random() - 0.5) * 4);
    }
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    ctx.drawImage(this.map.layers[this.frame], -camX - MARGIN * TILE, -camY - MARGIN * TILE);

    for (const p of this.pickups) {
      const bx = p.x * TILE - camX + 3, by = p.y * TILE - camY + 4;
      // a little pencil ball: yellow wood on top, white below, red button
      ctx.fillStyle = '#2a2238';
      ctx.fillRect(bx + 2, by, 6, 1); ctx.fillRect(bx, by + 2, 1, 6); ctx.fillRect(bx + 9, by + 2, 1, 6); ctx.fillRect(bx + 2, by + 9, 6, 1);
      ctx.fillRect(bx + 1, by + 1, 1, 1); ctx.fillRect(bx + 8, by + 1, 1, 1); ctx.fillRect(bx + 1, by + 8, 1, 1); ctx.fillRect(bx + 8, by + 8, 1, 1);
      ctx.fillStyle = '#f2c14e';
      ctx.fillRect(bx + 1, by + 2, 8, 3); ctx.fillRect(bx + 2, by + 1, 6, 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 1, by + 5, 8, 3); ctx.fillRect(bx + 2, by + 8, 6, 1);
      ctx.fillStyle = '#2a2238';
      ctx.fillRect(bx + 1, by + 5, 8, 1);
      ctx.fillStyle = '#d64545';
      ctx.fillRect(bx + 4, by + 4, 2, 2);
    }
    for (const b of this.berries) {
      // three berries peeking out of the bush
      const bx = b.x * TILE - camX, by = b.y * TILE - camY;
      for (const [dx, dy] of [[3, 4], [10, 6], [6, 10]]) {
        ctx.fillStyle = '#2a2238';
        ctx.fillRect(bx + dx - 1, by + dy - 1, 4, 4);
        ctx.fillStyle = BERRY_DOT[b.item] ?? '#d63a3a';
        ctx.fillRect(bx + dx, by + dy, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx + dx, by + dy, 1, 1);
      }
    }
    for (const o of this.obstacles) {
      const ox = o.x * TILE - camX, oy = o.y * TILE - camY;
      if (ox < -16 || oy < -16 || ox > this.viewW || oy > this.viewH) continue;
      ctx.drawImage(fieldSprite(o.kind), Math.round(ox), Math.round(oy));
    }
    const actors = [...this.npcs, this.player].sort((a, b) => this.pos(a)[1] - this.pos(b)[1]);
    // the follower is drawn in its place among the people (behind whoever is lower on screen)
    const fw = this.followerShown() ? this.follower! : null;
    const fwY = fw ? this.followerPos(fw)[1] : 0;
    let fwDrawn = !fw;
    for (const a of actors) {
      if (!fwDrawn && fwY <= this.pos(a)[1]) {
        this.drawFollower(ctx, fw!, camX, camY);
        fwDrawn = true;
      }
      const [ax, ay] = this.pos(a);
      const sx = Math.round(ax - camX), sy = Math.round(ay - camY);
      if (sx < -16 || sy < -16 || sx > this.viewW || sy > this.viewH) continue;
      if (a.jumping) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(sx + 3, Math.round((a.fromY + (a.y - a.fromY) * a.t) * TILE - camY) + 13, 10, 3);
      }
      if (a === this.player && this.biking) ctx.drawImage(fieldSprite('bike'), sx, sy + 11);
      a.sheet.draw(ctx, a.dir, a.moving && !a.sliding && a.t > 0.15 && a.t < 0.85, a.step, sx, sy - 2 - (a === this.player && this.surfing ? 2 : 0));
      // sailing: the paper boat hides the legs
      if (a === this.player && this.surfing) ctx.drawImage(fieldSprite('boat'), sx, sy + 9 + Math.round(Math.sin(performance.now() / 300)));
      // tall grass hides the legs
      const onGrass = !a.moving && tile(this.tileAt(a.x, a.y)).over;
      if (onGrass) {
        ctx.drawImage(this.map.layers[this.frame], (a.x + MARGIN) * TILE, (a.y + MARGIN) * TILE + 9, TILE, 7, sx, a.y * TILE - camY + 9, TILE, 7);
      }
      if (a.bubble) this.drawBubble(ctx, a.bubble, sx, sy);
    }
    if (!fwDrawn) this.drawFollower(ctx, fw!, camX, camY);
    for (const r of this.rustle) {
      const k = r.t / 260;
      ctx.fillStyle = '#2c6f2a';
      const bx = r.x * TILE - camX, by = r.y * TILE - camY;
      ctx.fillRect(bx + 2 - k * 4, by + 6 - k * 6, 2, 2);
      ctx.fillRect(bx + 12 + k * 4, by + 6 - k * 6, 2, 2);
    }
    const def = this.map.def;
    if (def.tint) {
      ctx.fillStyle = def.tint;
      ctx.fillRect(0, 0, this.viewW, this.viewH);
    }
    if (def.fog) {
      const t = performance.now() / 1000;
      ctx.fillStyle = 'rgba(235, 235, 255, 0.10)';
      for (let i = 0; i < 7; i++) {
        const fx = ((i * 97 + t * (8 + i * 2)) % (this.viewW + 160)) - 80 - ((camX * 0.3) % 40);
        const fy = ((i * 53) % Math.max(1, this.viewH - 20)) + Math.sin(t * 0.5 + i) * 6;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 60, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (this.wipe > 0) this.drawWipe(ctx);
    if (this.fade > 0) {
      ctx.fillStyle = `rgba(${this.fadeColor},${this.fade})`;
      ctx.fillRect(0, 0, this.viewW, this.viewH);
    }
  }

  /** Speech bubble over a character: ! ? … ♪ ♥ zz */
  private drawBubble(ctx: CanvasRenderingContext2D, kind: string, sx: number, sy: number) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx + 3, sy - 14, 11, 11);
    ctx.fillStyle = '#2a2238';
    ctx.fillRect(sx + 3, sy - 14, 11, 1); ctx.fillRect(sx + 3, sy - 4, 11, 1);
    ctx.fillRect(sx + 2, sy - 13, 1, 9); ctx.fillRect(sx + 14, sy - 13, 1, 9);
    ctx.fillRect(sx + 7, sy - 3, 2, 1);
    const px = (x: number, y: number, c: string, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(sx + x, sy + y, w, h); };
    switch (kind) {
      case '?': px(7, -12, '#3a7ad6', 3, 1); px(10, -11, '#3a7ad6', 1, 2); px(8, -9, '#3a7ad6', 2, 1); px(8, -8, '#3a7ad6', 1, 1); px(8, -6, '#3a7ad6'); break;
      case '…': px(5, -8, '#2a2238'); px(8, -8, '#2a2238'); px(11, -8, '#2a2238'); break;
      case '♪': px(9, -12, '#7b60c3', 1, 6); px(10, -12, '#7b60c3', 2, 1); px(7, -7, '#7b60c3', 3, 2); break;
      case '♥': px(5, -11, '#d64545', 2, 2); px(9, -11, '#d64545', 2, 2); px(5, -10, '#d64545', 6, 2); px(6, -8, '#d64545', 4, 1); px(7, -7, '#d64545', 2, 1); break;
      case 'zz': px(5, -12, '#5b8ad6', 3, 1); px(6, -11, '#5b8ad6'); px(5, -10, '#5b8ad6', 3, 1); px(9, -9, '#5b8ad6', 3, 1); px(10, -8, '#5b8ad6'); px(9, -7, '#5b8ad6', 3, 1); break;
      default: px(8, -12, '#d64545', 1, 5); px(8, -6, '#d64545');
    }
  }

  /** Pencil hatching that covers the screen stroke by stroke (an eraser sweep for Team Gomme). */
  private drawWipe(ctx: CanvasRenderingContext2D) {
    const w = this.viewW, h = this.viewH;
    if (this.wipeKind === 'eraser') {
      ctx.fillStyle = '#fbf6ea';
      const bands = 8;
      for (let i = 0; i < bands; i++) {
        const k = Math.max(0, Math.min(1, this.wipe * bands - i * 0.6));
        const y = (i * h) / bands;
        if (i % 2) ctx.fillRect(w - w * k, y, w * k, h / bands + 1);
        else ctx.fillRect(0, y, w * k, h / bands + 1);
      }
      return;
    }
    const n = 34;
    const done = Math.floor(this.wipe * n);
    ctx.strokeStyle = '#2b2536';
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(10, (w + h) / 16);
    for (let i = 0; i <= done && i < n; i++) {
      const k = i === done ? (this.wipe * n) % 1 : 1;
      // zig-zag hatching from the top-left corner to the bottom-right one
      const off = (i / n) * (w + h) * 1.1 - h * 0.2;
      const x0 = off, y0 = -10, x1 = off - h * 0.9, y1 = h + 10;
      const [ax, ay, bx, by] = i % 2 ? [x1, y1, x0, y0] : [x0, y0, x1, y1];
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + (bx - ax) * k, ay + (by - ay) * k);
      ctx.stroke();
    }
    if (this.wipe >= 1) {
      ctx.fillStyle = '#2b2536';
      ctx.fillRect(0, 0, w, h);
    }
  }

  async wipeTo(target: number, ms: number, kind: 'pencil' | 'eraser' = 'pencil') {
    this.wipeKind = kind;
    const t0 = performance.now(), start = this.wipe;
    for (;;) {
      const k = Math.min(1, (performance.now() - t0) / ms);
      this.wipe = start + (target - start) * k;
      this.render();
      if (k >= 1) return;
      await new Promise<void>((r) => {
        let done = false;
        const fin = () => { if (!done) { done = true; r(); } };
        requestAnimationFrame(fin);
        setTimeout(fin, 40);
      });
    }
  }

  async fadeTo(target: number, ms = 220, color?: 'black' | 'white') {
    if (color) this.fadeColor = color === 'white' ? '251,246,234' : '0,0,0';
    // animation frames can stop (hidden or covered window): fall back to a timer so a
    // transition never hangs
    const frame = () =>
      new Promise<void>((resolve) => {
        let done = false;
        const fin = () => {
          if (!done) {
            done = true;
            resolve();
          }
        };
        requestAnimationFrame(fin);
        setTimeout(fin, 60);
      });
    const start = this.fade;
    const t0 = performance.now();
    for (;;) {
      const k = Math.min(1, (performance.now() - t0) / ms);
      this.fade = start + (target - start) * k;
      if (k >= 1) return;
      await frame();
    }
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
