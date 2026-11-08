/**
 * The overworld camera. By default it follows the player as it always did (centred, kept inside the
 * map, a map smaller than the screen centred). Scenes can move it: pan to a point or someone, zoom in,
 * shake it a few ways, then hand it back to the player. Its moves run on the scene clock, so holding B
 * hurries them too; with MOUVEMENTS : DOUX a pan is a cut and there is no zoom or shake.
 */
import { clamp01, easeInOut } from '../anim/ease';
import { calmMotion } from '../anim/calm';
import { sceneNow } from '../anim/sceneClock';

/** Top-left corner of the view centred on (fx, fy) in map pixels: kept inside the map, centred when the map is smaller. */
export function frame(fx: number, fy: number, mapW: number, mapH: number, viewW: number, viewH: number): [number, number] {
  const x = mapW <= viewW ? (mapW - viewW) / 2 : Math.min(Math.max(fx - viewW / 2, 0), mapW - viewW);
  const y = mapH <= viewH ? (mapH - viewH) / 2 : Math.min(Math.max(fy - viewH / 2, 0), mapH - viewH);
  return [x, y];
}

/** The tiles a view shows (even partly). */
export function tilesInView(camX: number, camY: number, viewW: number, viewH: number, tile = 16) {
  return {
    x0: Math.floor(camX / tile), x1: Math.floor((camX + viewW - 1) / tile),
    y0: Math.floor(camY / tile), y1: Math.floor((camY + viewH - 1) / tile),
  };
}

export type ShakeKind = 'rumble' | 'jolt' | 'quake';

/** How far the view moves for each kind of shake (pixels), at time `u` (0 to 1) of it. */
export function shakeAmount(kind: ShakeKind, u: number, power = 1): number {
  const decay = 1 - clamp01(u);
  switch (kind) {
    // a low tremble, steady
    case 'rumble': return 1.5 * power;
    // one hard knock, dying out
    case 'jolt': return 4 * power * decay * decay;
    // the ground itself moving
    case 'quake': return 4 * power * (0.4 + 0.6 * decay);
  }
}

type Pt = [number, number];

export class Camera {
  /** null: following the player; a function: following someone else as they move. */
  private point: Pt | (() => Pt) | null = null;
  private move: { from: Pt; t0: number; ms: number } | null = null;
  private zoom = { from: 1, to: 1, t0: 0, ms: 0 };
  private quake: { kind: ShakeKind; t0: number; ms: number; power: number } | null = null;
  private last: Pt = [0, 0];

  constructor(private now: () => number = sceneNow, private calm: () => boolean = calmMotion) {}

  private startMove(ms: number) {
    this.move = ms > 0 && !this.calm() ? { from: this.last, t0: this.now(), ms } : null;
  }

  /** Back to following the player, over `ms`. */
  follow(ms = 0) {
    this.startMove(ms);
    this.point = null;
  }

  /** Looks at a point of the map (pixels, the middle of what it shows), over `ms`. */
  panTo(x: number, y: number, ms = 600) {
    this.startMove(ms);
    this.point = [x, y];
  }

  /** Follows someone else (where `at` says they are, in map pixels), getting there over `ms`. */
  look(at: () => Pt, ms = 600) {
    this.startMove(ms);
    this.point = at;
  }

  /** Zooms (1 is the usual view, 2 twice as close), over `ms`. */
  zoomTo(z: number, ms = 400) {
    const to = this.calm() ? 1 : Math.max(1, z);
    this.zoom = { from: this.zoomNow(), to, t0: this.now(), ms: Math.max(0, ms) };
  }

  shake(kind: ShakeKind, ms = 500, power = 1) {
    if (this.calm()) return;
    this.quake = { kind, t0: this.now(), ms, power };
  }

  /** Everything back to normal at once (a new map). */
  reset() {
    this.point = null;
    this.move = null;
    this.zoom = { from: 1, to: 1, t0: 0, ms: 0 };
    this.quake = null;
  }

  /** The camera follows the player and isn't moving or zoomed. */
  idle(): boolean {
    return !this.point && !this.move && this.zoomNow() === 1 && !this.quake;
  }

  /** The point the view is centred on, given where the player's middle is now. */
  focus(player: Pt): Pt {
    const target = typeof this.point === 'function' ? this.point() : this.point ?? player;
    let out = target;
    if (this.move) {
      const k = clamp01((this.now() - this.move.t0) / this.move.ms);
      const e = easeInOut(k);
      out = [this.move.from[0] + (target[0] - this.move.from[0]) * e, this.move.from[1] + (target[1] - this.move.from[1]) * e];
      if (k >= 1) this.move = null;
    }
    this.last = out;
    return out;
  }

  zoomNow(): number {
    const z = this.zoom;
    if (z.ms <= 0) return z.to;
    const k = clamp01((this.now() - z.t0) / z.ms);
    return z.from + (z.to - z.from) * easeInOut(k);
  }

  /** The shake's offset now (pixels), random within its amount. */
  shakeOffset(rand: () => number = Math.random): Pt {
    const q = this.quake;
    if (!q) return [0, 0];
    const u = (this.now() - q.t0) / q.ms;
    if (u >= 1) {
      this.quake = null;
      return [0, 0];
    }
    const a = shakeAmount(q.kind, u, q.power);
    return [Math.round((rand() - 0.5) * 2 * a), Math.round((rand() - 0.5) * 1.4 * a)];
  }
}
