/**
 * Move animations: shared types, maths and the crayon colours of each type.
 *
 * An animation is a `Recipe`: motions of the two drawings plus timed `Layer`s painted on a canvas
 * over the scene (and one under the drawings, for washes and ground cracks).
 */
import type { Side } from '../../../engine/pk/battle';
import type { TypeId } from '../../../data/schema';
import type { Brush } from './brush';

/** Where a drawing stands, in scene pixels. */
export interface Anchor {
  x: number;
  y: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  /** Smaller side of the visible drawing. */
  size: number;
}

export interface Env {
  w: number;
  h: number;
  user: Anchor;
  target: Anchor;
  userSide: Side;
  /** +1 when the user is on the left (yours), -1 for the foe. */
  dir: 1 | -1;
  /** Stroke scale: 1 on a 300px-high scene. */
  k: number;
  seed: number;
  crit: boolean;
  /** Type effectiveness of the hit (1 when unknown). */
  eff: number;
}

/** One timed drawing. `draw` gets the layer's own progress, 0 to 1. */
export interface Layer {
  /** ms from the start of the animation (at normal battle speed). */
  start: number;
  dur: number;
  /** ms from the layer's start where it hits the target. */
  impact?: number;
  /** Painted under the drawings (washes, cracks in the ground). */
  back?: boolean;
  draw(b: Brush, t: number): void;
}

export type Builder = (env: Env) => Layer;

export type Motion =
  | 'lunge' | 'hop' | 'spin' | 'rear' | 'dash' | 'roll' | 'shake' | 'wiggle'
  | 'rise' | 'sink' | 'drop' | 'popUp';

export type Reaction = 'jiggle' | 'knock' | 'squash' | 'none';

export interface Recipe {
  /** The attacker's motion and when it starts (ms). */
  user?: Motion;
  userAt?: number;
  /** The target's reaction when the hit lands (damaging moves jiggle by default). */
  hit?: Reaction;
  /** Shakes the whole scene when the hit lands (strength, about 1). */
  shake?: number;
  layers: Builder[];
  /** First turn of a two-turn move (flying up, digging, gathering light). */
  charge?: { user?: Motion; layers: Builder[] };
}

// ------------------------------------------------------------------ maths

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Progress of `t` inside [a, b], clamped. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const easeIn = (t: number) => t * t * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** Up then down: 0 at both ends, 1 in the middle. */
export const bell = (t: number) => Math.sin(Math.PI * clamp01(t));
/** Fades in during the first `a` of the time and out during the last `b`. */
export const fade = (t: number, a = 0.15, b = 0.25) => Math.min(seg(t, 0, a), 1 - seg(t, 1 - b, 1));

export type P = [number, number];

/** Point on a quadratic arc from `a` to `c`, bulging `lift` pixels upwards. */
export function arc(a: P, c: P, t: number, lift = 0): P {
  const mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2 - lift;
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * mx + t * t * c[0], u * u * a[1] + 2 * u * t * my + t * t * c[1]];
}

export const centre = (a: Anchor): P => [a.x, a.y];
/** Roughly where the mouth or the front of a drawing is: high and on the side facing the other one. */
export const mouth = (a: Anchor, dir: number): P => [a.x + dir * (a.right - a.left) * 0.22, a.top + (a.bottom - a.top) * 0.35];

/** Shifts a builder later in the animation. */
export const at = (ms: number, b: Builder): Builder => (env) => {
  const l = b(env);
  return { ...l, start: l.start + ms };
};

// ------------------------------------------------------------------ colours

/** Light, main and dark crayon of each type. */
export const PAL: Record<TypeId, [string, string, string]> = {
  plante: ['#c9ec9a', '#5cb33c', '#2f6e25'],
  feu: ['#ffd65a', '#f2762a', '#c8361f'],
  eau: ['#bfe2fa', '#4a92e0', '#24569e'],
  electrique: ['#fff49a', '#f7d11e', '#c99400'],
  fee: ['#ffd3ea', '#ee77b5', '#b63f84'],
  insecte: ['#e3f0a0', '#9cba2c', '#5d7414'],
  normal: ['#f4efe4', '#c4b9a3', '#7d725e'],
  spectre: ['#d9ccf5', '#8a6cd0', '#4a3488'],
  psy: ['#f7c8ea', '#d05cb2', '#8a2c74'],
  combat: ['#f5c9a8', '#cf6a35', '#8a3a1a'],
  tenebres: ['#b9b2c8', '#544a66', '#2a2436'],
  vol: ['#dcebff', '#8fb6ee', '#4d78c4'],
  sol: ['#f0dcae', '#c99a4e', '#83602a'],
  roche: ['#e2d6bc', '#a68d5e', '#655434'],
  glace: ['#e6fbff', '#8edcef', '#3aa6c4'],
  poison: ['#ebc8f5', '#a453c4', '#62287c'],
  dragon: ['#d0ccfa', '#6658d6', '#352c8c'],
  acier: ['#eef1f5', '#a9b4c2', '#5f6a7a'],
};

export const RAINBOW = ['#ef5350', '#f7a530', '#f7d21e', '#5cb33c', '#4a92e0', '#8a6cd0'];
export const NEON = ['#ff4fd8', '#3df2ff', '#c8ff3d', '#fff23d'];
export const PAPER = '#fbf6ea';
export const INK = '#2b2536';
export const SPARK = '#fff6b8';

/** Mixes two #rrggbb colours (0 = a, 1 = b). */
export function mix(a: string, b: string, t: number): string {
  const p = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  const ch = (i: number) => Math.round(lerp(p(a, i), p(b, i), t)).toString(16).padStart(2, '0');
  return `#${ch(0)}${ch(1)}${ch(2)}`;
}
