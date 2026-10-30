/**
 * Effect builders: each returns a `Builder` (env → timed layer) drawing one part of a move
 * animation in coloured pencil. Recipes (`recipes.ts`) combine them per move.
 *
 * Sizes are fractions of the target drawing (`S`), so they scale with the scene. `t` is the
 * layer's own progress (0 to 1); fixed randomness (where each rock falls) comes from `fixed()`,
 * the wobble of the lines from the brush's flipbook frame.
 */
import { GRAPHITE, seeded, type Rand } from '../../paper/pencilCanvas';
import type { FxSound } from '../../../audio/sfx';
import type { Brush } from './brush';
import type { DoodleKind } from './doodles';
import {
  arc, bell, centre, clamp01, easeIn, easeInOut, easeOut, fade, lerp, mix, mouth, seg,
  INK, PAPER, PAL, SPARK, type Anchor, type Builder, type Env, type P,
} from './core';

export type Who = 'user' | 'target';

const KIND_SOUND: Partial<Record<DoodleKind, FxSound>> = {
  flame: 'fire', drop: 'water', bubble: 'bubble', rock: 'rock', clod: 'rock', leaf: 'wind', seed: 'whoosh', feather: 'wind',
  blob: 'sludge', ink: 'sludge', spark: 'spark', orb: 'beam', heart: 'twinkle', star: 'twinkle', note: 'song', snow: 'ice',
  shard: 'ice', puff: 'wind', zzz: 'snore', plus: 'heal', plane: 'wind', balloon: 'water',
};
/** The sound of a doodle flying or rising. */
export const kindSound = (k: DoodleKind): FxSound => KIND_SOUND[k] ?? 'whoosh';

export const fixed = (env: Env, salt: number): Rand => seeded(env.seed * 31 + salt * 7717);
export const who = (env: Env, w: Who = 'target'): Anchor => (w === 'user' ? env.user : env.target);
const S = (env: Env) => env.target.size;
export const feet = (a: Anchor): P => [a.x, Math.min(a.bottom, a.y + (a.bottom - a.top) * 0.42)];

/** A band along `pts`, `w(u)` wide (claw marks, lashes, water jets). */
export function ribbon(pts: P[], w: (u: number) => number): P[] {
  const L: P[] = [], R: P[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], c = pts[Math.min(pts.length - 1, i + 1)];
    const dx = c[0] - a[0], dy = c[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len, ww = w(i / Math.max(1, pts.length - 1)) / 2;
    L.push([pts[i][0] + nx * ww, pts[i][1] + ny * ww]);
    R.push([pts[i][0] - nx * ww, pts[i][1] - ny * ww]);
  }
  return [...L, ...R.reverse()];
}

/** Points on the arc a → c between progress u0 and u1. */
export function along(a: P, c: P, lift: number, u0: number, u1: number, n = 12): P[] {
  return Array.from({ length: n + 1 }, (_, i) => arc(a, c, lerp(u0, u1, i / n), lift));
}

/** Short pencil lines bursting out of a point (the "pow" around a hit). */
function powLines(b: Brush, x: number, y: number, r0: number, r1: number, n: number, alpha: number, seed: number) {
  const r = b.rand(seed);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.4;
    b.line([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], GRAPHITE, 1.4, { alpha, seed: seed + i, passes: 1 });
  }
}

// ------------------------------------------------------------------ hits

/** The comic-book star where a hit lands. */
export const impactStar = (o: { color?: string; size?: number; dur?: number; count?: number; spread?: number; who?: Who } = {}): Builder => (env) => {
  const R = fixed(env, 11);
  const count = o.count ?? 1;
  const spots = Array.from({ length: count }, () => [(R() - 0.5) * (o.spread ?? 0.5), (R() - 0.5) * (o.spread ?? 0.5)]);
  const dur = o.dur ?? 300;
  return {
    start: 0, sounds: [['punch', 0]], dur: dur * (1 + (count - 1) * 0.35), impact: 0,
    draw(b, t) {
      const A = who(env, o.who), s = S(env) * (o.size ?? 0.5) * (env.crit ? 1.3 : 1);
      spots.forEach(([dx, dy], i) => {
        const u = seg(t, (i * 0.35) / (1 + (count - 1) * 0.35), (1 + i * 0.35) / (1 + (count - 1) * 0.35));
        if (u <= 0 || u >= 1) return;
        const x = A.x + dx * A.size, y = A.y + dy * A.size;
        const rad = (s / 2) * (0.55 + 0.6 * easeOut(seg(u, 0, 0.35)));
        b.star(x, y, rad, o.color ?? SPARK, { alpha: 1 - seg(u, 0.55, 1), seed: 31 + i, rot: i });
        powLines(b, x, y, rad * 1.1, rad * 1.6, 7, 1 - seg(u, 0.4, 1), 40 + i);
      });
    },
  };
};

/** Claw marks: curved crayon slashes drawn across the target one after the other. */
export const slash = (o: { color: string; n?: number; width?: number; len?: number; curve?: number; angle?: number; dur?: number; stagger?: number }): Builder => (env) => {
  const n = o.n ?? 3, stagger = o.stagger ?? 70, draw = 150;
  const dur = o.dur ?? Math.max(460, (n - 1) * stagger + draw + 260);
  const a = o.angle ?? (env.dir > 0 ? 2.2 : 0.95);
  const dx = Math.cos(a), dy = Math.sin(a);
  return {
    start: 0, sounds: [['slash', 0]], dur, impact: draw * 0.7,
    draw(b, t) {
      const T = env.target, s = S(env), L = s * (o.len ?? 0.95);
      const ms = t * dur;
      for (let i = 0; i < n; i++) {
        const u = easeOut(seg(ms, i * stagger, i * stagger + draw));
        if (u <= 0) continue;
        const off = (i - (n - 1) / 2) * s * 0.2;
        const p0: P = [T.x - dx * L / 2 - dy * off, T.y - dy * L / 2 + dx * off];
        const p1: P = [T.x + dx * L / 2 - dy * off, T.y + dy * L / 2 + dx * off];
        const lift = L * (o.curve ?? 0.18);
        const pts = along(p0, p1, lift, 0, u, 10);
        const w = s * 0.07 * (o.width ?? 1);
        b.shape(ribbon(pts, (v) => w * Math.sin(Math.PI * clamp01(v * 0.92 + 0.04))), o.color, { alpha: 1 - seg(t, 0.75, 1), seed: 50 + i, lw: 1.2 });
      }
    },
  };
};

/** Two scissor blades closing on the target. */
export const snip = (o: { color?: string; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 560;
  return {
    start: 0, sounds: [['bite', dur * 0.5]], dur, impact: dur * 0.5,
    draw(b, t) {
      const T = env.target, L = S(env) * 0.95;
      const open = 0.62 * (1 - easeIn(seg(t, 0.15, 0.5)));
      const base = env.dir > 0 ? Math.PI * 0.82 : Math.PI * 0.18;
      const alpha = fade(t, 0.12, 0.2);
      for (const sgn of [-1, 1]) {
        const a = base + (sgn * open) / 2;
        const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
        const blade: P[] = [[T.x + nx * L * 0.05, T.y + ny * L * 0.05], [T.x + ux * L * 0.55, T.y + uy * L * 0.55], [T.x - nx * L * 0.05, T.y - ny * L * 0.05]];
        b.shape(blade, o.color ?? PAL.acier[1], { alpha, seed: 60 + sgn });
        const hx = T.x - ux * L * 0.3, hy = T.y - uy * L * 0.3;
        b.ring(hx, hy, L * 0.11, L * 0.08, PAL.feu[2], 3, { alpha, seed: 64 + sgn });
      }
    },
  };
};

/** Jaws closing from above and below: curved gums and big fangs. */
export const bite = (o: { gum?: string; tooth?: string; n?: number; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 560, n = o.n ?? 4;
  return {
    start: 0, sounds: [['bite', dur * 0.45]], dur, impact: dur * 0.45,
    draw(b, t) {
      const T = env.target, s = S(env), half = s * 0.5;
      const close = easeIn(seg(t, 0.1, 0.45));
      const shake = t > 0.45 && t < 0.7 ? Math.sin(t * 90) * s * 0.02 : 0;
      const alpha = 1 - seg(t, 0.72, 1);
      for (const sgn of [-1, 1]) {
        const y = T.y + sgn * lerp(s * 0.62, s * 0.12, close) + shake;
        // the gum is an arc, its ends bent towards the other jaw
        const gum: P[] = Array.from({ length: 11 }, (_, i) => {
          const u = i / 10 - 0.5;
          return [T.x + u * 2 * half, y + sgn * s * 0.16 * (1 - (2 * u) ** 2)] as P;
        });
        b.shape(ribbon(gum, () => s * 0.09), o.gum ?? '#e9707a', { alpha, seed: 70 + sgn });
        for (let i = 0; i < n; i++) {
          const u = (i + 0.5) / n - 0.5;
          const big = i === 0 || i === n - 1 ? 1.35 : 1;
          const gx = T.x + u * 2 * half * 0.92, gy = y + sgn * s * 0.16 * (1 - (2 * u) ** 2) - sgn * s * 0.03;
          const wdt = s * 0.11 * big, len = s * 0.2 * big;
          b.shape([[gx - wdt / 2, gy], [gx, gy - sgn * len], [gx + wdt / 2, gy]], o.tooth ?? '#ffffff', { alpha, seed: 74 + i + sgn, wash: 0.9, gap: 6 });
        }
      }
    },
  };
};

/** A fist (or foot) zooming in on the target. */
export const fist = (o: { color?: string; size?: number; dur?: number; kind?: DoodleKind; spot?: [number, number] } = {}): Builder => (env) => {
  const dur = o.dur ?? 440;
  const R = fixed(env, 79);
  const [dx, dy] = o.spot ?? [(R() - 0.5) * 0.3, (R() - 0.5) * 0.3];
  return {
    start: 0, sounds: [['whoosh', 0]], dur, impact: dur * 0.5,
    draw(b, t) {
      const T = env.target, s = S(env);
      const u = easeIn(seg(t, 0, 0.5));
      const x = T.x + dx * s, y = T.y + dy * s;
      const size = s * (o.size ?? 0.55) * lerp(0.25, 1.1, u) * (t > 0.5 ? 1 - 0.1 * bell(seg(t, 0.5, 0.65)) : 1);
      if (u < 1) powLines(b, x, y, size * 0.6, size * 1.1, 8, 0.6 * u, 81);
      b.doodle(o.kind ?? 'fist', o.color ?? '#f2c69a', x, y, size, { alpha: 1 - seg(t, 0.75, 1), flip: env.dir < 0, rot: (1 - u) * 0.5 * env.dir });
    },
  };
};

/** A low sweeping arc along the target's feet. */
export const sweep = (o: { color: string; dur?: number }): Builder => (env) => {
  const dur = o.dur ?? 500;
  return {
    start: 0, sounds: [['slash', 0]], dur, impact: dur * 0.4,
    draw(b, t) {
      const T = env.target, s = S(env);
      const [fx, fy] = feet(T);
      const u = easeOut(seg(t, 0, 0.45));
      const p0: P = [fx - env.dir * s * 0.7, fy - s * 0.05], p1: P = [fx + env.dir * s * 0.7, fy - s * 0.05];
      const pts = along(p0, p1, -s * 0.18, 0, u, 12);
      b.shape(ribbon(pts, (v) => s * 0.09 * Math.sin(Math.PI * clamp01(v * 0.9 + 0.05))), o.color, { alpha: 1 - seg(t, 0.75, 1), seed: 90 });
    },
  };
};

/** Speed lines trailing behind (or streaming down onto) a drawing. */
export const speedLines = (o: { who?: Who; n?: number; dur?: number; down?: boolean; color?: string } = {}): Builder => (env) => {
  const dur = o.dur ?? 420, n = o.n ?? 7;
  const R = fixed(env, 13);
  const lines = Array.from({ length: n }, () => [R() - 0.5, R(), 0.5 + R() * 0.5]);
  return {
    start: 0, sounds: [['whoosh', 0]], dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user');
      const len = A.size * 0.5;
      lines.forEach(([off, delay, l], i) => {
        const u = seg(t, delay * 0.4, delay * 0.4 + 0.6);
        if (u <= 0 || u >= 1) return;
        const alpha = bell(u) * 0.9;
        if (o.down) {
          const x = A.x + off * A.size, y = lerp(A.top - len * 2, A.y, u);
          b.line([[x, y - len * l], [x, y]], o.color ?? GRAPHITE, 1.6, { alpha, seed: 100 + i, passes: 1 });
        } else {
          const y = A.y + off * A.size * 0.9, x = A.x - env.dir * (A.size * 0.45 + u * len);
          const dx = -env.dir * len * l, dy = env.dir * len * l * 0.45;
          b.line([[x, y], [x + dx, y + dy]], o.color ?? GRAPHITE, 1.6, { alpha, seed: 100 + i, passes: 1 });
        }
      });
    },
  };
};

/** Quick pokes of a beak or a stinger. */
export const jab = (o: { color: string; n?: number; gap?: number; size?: number; drill?: boolean }): Builder => (env) => {
  const n = o.n ?? 3, gap = o.gap ?? 120, each = 220;
  const R = fixed(env, 17);
  const spots = Array.from({ length: n }, () => [(R() - 0.5) * 0.5, (R() - 0.5) * 0.5]);
  const dur = (n - 1) * gap + each + 80;
  return {
    start: 0, sounds: spots.map((_, i) => ['jab', i * gap + 90] as [FxSound, number]), dur, impact: each * 0.4,
    draw(b, t) {
      const T = env.target, U = env.user, s = S(env);
      const vx = T.x - U.x, vy = T.y - U.y, vl = Math.hypot(vx, vy) || 1;
      const ux = vx / vl, uy = vy / vl;
      const ms = t * dur;
      spots.forEach(([dx, dy], i) => {
        const u = seg(ms, i * gap, i * gap + each);
        if (u <= 0 || u >= 1) return;
        const push = easeOut(seg(u, 0, 0.4)) * s * 0.25;
        const tip: P = [T.x + dx * s - ux * s * 0.3 + ux * push, T.y + dy * s - uy * s * 0.3 + uy * push];
        const len = s * (o.size ?? 0.42), wd = len * 0.35;
        const tri: P[] = [tip, [tip[0] - ux * len - uy * wd, tip[1] - uy * len + ux * wd], [tip[0] - ux * len + uy * wd, tip[1] - uy * len - ux * wd]];
        const alpha = 1 - seg(u, 0.6, 1);
        b.shape(tri, o.color, { alpha, seed: 110 + i });
        if (o.drill) for (let k = 0; k < 3; k++) {
          const m = 0.3 + k * 0.25;
          const cx = tip[0] - ux * len * m, cy = tip[1] - uy * len * m;
          b.ring(cx, cy, wd * (1.4 - m), wd * 0.5, GRAPHITE, 1.3, { alpha, seed: 120 + k, from: u * 12, to: u * 12 + 4 });
        }
        if (u > 0.35) b.star(tip[0], tip[1], s * 0.12 * (1 - u), SPARK, { alpha, seed: 130 + i, points: 6 });
      });
    },
  };
};

/** A lash (vine, tail, burning or electric) cracking from the user to the target. */
export const whip = (o: { color: string; kind?: 'vine' | 'fire' | 'bolt' | 'plain'; dur?: number; width?: number }): Builder => (env) => {
  const dur = o.dur ?? 560;
  return {
    start: 0, sounds: [[o.kind === 'fire' ? 'fire' : o.kind === 'bolt' ? 'thunder' : 'slash', dur * 0.3]], dur, impact: dur * 0.45,
    draw(b, t) {
      const U = env.user, T = env.target, s = S(env);
      const head = easeOut(seg(t, 0, 0.45)), tail = easeIn(seg(t, 0.62, 1));
      if (head <= tail) return;
      const a = mouth(U, env.dir), c = centre(T);
      const lift = Math.abs(c[0] - a[0]) * 0.35;
      let pts = along(a, c, lift, tail, head, 16);
      if (o.kind === 'bolt') {
        const r = b.rand(140);
        pts = pts.map(([x, y], i) => (i % 2 ? [x + (r() - 0.5) * s * 0.18, y + (r() - 0.5) * s * 0.18] : [x, y]) as P);
      }
      const w0 = lerp(U.size, T.size, 0.5) * 0.07 * (o.width ?? 1);
      b.shape(ribbon(pts, (v) => w0 * lerp(1, 0.55, v)), o.color, { seed: 141 });
      const r = b.rand(150);
      if (o.kind === 'vine') for (let i = 3; i < pts.length - 1; i += 4) b.doodle('leaf', PAL.plante[1], pts[i][0], pts[i][1], w0 * 3, { rot: r() * 6 });
      if (o.kind === 'fire') for (let i = 2; i < pts.length; i += 3) b.doodle('flame', PAL.feu[1], pts[i][0], pts[i][1] - w0, w0 * 3.2, { seed: i });
      if (o.kind === 'bolt') b.line(pts, SPARK, 1.4, { seed: 151, passes: 1 });
    },
  };
};

/** Clods of earth thrown up around the feet of a drawing. */
export const burrow = (o: { who?: Who; n?: number; dur?: number; color?: string } = {}): Builder => (env) => {
  const n = o.n ?? 8, dur = o.dur ?? 700;
  const R = fixed(env, 19);
  const clods = Array.from({ length: n }, () => [(R() - 0.5) * 2, 0.5 + R() * 0.7, R() * 0.25, R() * 6]);
  return {
    start: 0, sounds: [['rock', 0]], dur, impact: dur * 0.15,
    draw(b, t) {
      const A = who(env, o.who), s = A.size;
      const [fx, fy] = feet(A);
      clods.forEach(([vx, vy, delay, rot], i) => {
        const u = seg(t, delay, delay + 0.7);
        if (u <= 0 || u >= 1) return;
        const x = fx + vx * s * 0.6 * u, y = fy - vy * s * (u * 1.6 - u * u * 1.4);
        b.doodle('clod', o.color ?? PAL.sol[1], x, y, s * 0.16, { rot: rot + u * 4, alpha: 1 - seg(u, 0.75, 1), seed: i });
      });
    },
  };
};

/** Cracks spreading in the ground under a drawing (drawn under the drawings). */
export const cracks = (o: { who?: Who; n?: number; dur?: number } = {}): Builder => (env) => {
  const n = o.n ?? 5, dur = o.dur ?? 900;
  const R = fixed(env, 23);
  const rays = Array.from({ length: n }, (_, i) => (i / n) * Math.PI * 2 + R() * 0.6);
  return {
    start: 0, sounds: [['quake', 0]], dur, back: true,
    draw(b, t) {
      const A = who(env, o.who), s = A.size;
      const [fx, fy] = feet(A);
      const u = easeOut(seg(t, 0, 0.35));
      const alpha = 1 - seg(t, 0.7, 1);
      const r = fixed(env, 29);
      rays.forEach((a, i) => {
        const pts: P[] = [[fx, fy]];
        for (let k = 1; k <= 5; k++) {
          const d = (k / 5) * s * 0.9 * u;
          pts.push([fx + Math.cos(a) * d + (r() - 0.5) * s * 0.08, fy + Math.sin(a) * d * 0.3 + (r() - 0.5) * s * 0.04]);
        }
        b.line(pts, GRAPHITE, 2.2, { alpha, seed: 160 + i });
      });
    },
  };
};

/** Puffs of dust at the feet of a drawing. */
export const dust = (o: { who?: Who; n?: number; dur?: number; color?: string } = {}): Builder => (env) => {
  const n = o.n ?? 6, dur = o.dur ?? 700;
  const R = fixed(env, 31);
  const puffs = Array.from({ length: n }, () => [(R() - 0.5) * 2, R() * 0.3]);
  return {
    start: 0, dur,
    draw(b, t) {
      const A = who(env, o.who), s = A.size;
      const [fx, fy] = feet(A);
      puffs.forEach(([dx, delay], i) => {
        const u = seg(t, delay, delay + 0.7);
        if (u <= 0 || u >= 1) return;
        b.doodle('puff', o.color ?? '#d9c9a8', fx + dx * s * (0.35 + u * 0.4), fy - u * s * 0.25, s * (0.15 + u * 0.22), { alpha: 0.9 * (1 - u), seed: i });
      });
    },
  };
};

/** Ribbons spinning around the target. */
export const twirl = (o: { colors: string[]; dur?: number }): Builder => (env) => {
  const dur = o.dur ?? 800;
  return {
    start: 0, sounds: [['wind', 0]], dur, impact: dur * 0.3,
    draw(b, t) {
      const T = env.target, s = S(env);
      const alpha = fade(t, 0.1, 0.25);
      o.colors.forEach((color, i) => {
        const pts: P[] = [];
        for (let k = 0; k <= 10; k++) {
          const a = t * Math.PI * 5 + (i / o.colors.length) * Math.PI * 2 - k * 0.22;
          pts.push([T.x + Math.cos(a) * s * 0.55, T.y + s * 0.3 - t * s * 0.5 + Math.sin(a) * s * 0.18 + k * s * 0.02]);
        }
        b.shape(ribbon(pts, (v) => s * 0.06 * (1 - v)), color, { alpha, seed: 170 + i });
      });
    },
  };
};

/** A thread winding around the target, then squeezing. */
export const wrap = (o: { color?: string; loops?: number; dur?: number; who?: Who } = {}): Builder => (env) => {
  const dur = o.dur ?? 900, loops = o.loops ?? 4;
  return {
    start: 0, sounds: [['wind', 0]], dur, impact: dur * 0.55,
    draw(b, t) {
      const T = who(env, o.who), s = T.size;
      const u = seg(t, 0, 0.5);
      const squeeze = 1 - 0.14 * bell(seg(t, 0.5, 0.8) * 2);
      const pts: P[] = [];
      const steps = Math.ceil(loops * 24 * u);
      for (let k = 0; k <= steps; k++) {
        const a = (k / 24) * Math.PI * 2;
        const y = T.y + s * 0.4 - (k / (loops * 24)) * s * 0.85;
        pts.push([T.x + Math.cos(a) * s * 0.5 * squeeze, y + Math.sin(a) * s * 0.1]);
      }
      const alpha = 1 - seg(t, 0.85, 1);
      b.line(pts, o.color ?? '#f4efe4', 4.5, { alpha, seed: 180 });
      b.line(pts, GRAPHITE, 1.1, { alpha: alpha * 0.8, seed: 181, passes: 1 });
    },
  };
};

// ------------------------------------------------------------------ things that fly

export interface ProjectileOpts {
  kind: DoodleKind;
  color: string | string[];
  n?: number;
  size?: number;
  /** ms one shot takes to fly over. */
  fly?: number;
  gap?: number;
  lift?: number;
  spread?: number;
  spin?: number;
  /** Flies level, nose first (a paper plane), instead of tumbling. */
  steady?: boolean;
  trail?: boolean;
  /** Little burst when it lands. */
  burst?: DoodleKind | 'star' | false;
  from?: 'mouth' | 'centre';
}

/** Things thrown at the target on an arc: embers, rocks, leaves, bubbles… */
export const projectile = (o: ProjectileOpts): Builder => (env) => {
  const n = o.n ?? 1, fly = o.fly ?? 380, gap = o.gap ?? 90, after = 200;
  const R = fixed(env, 37);
  const shots = Array.from({ length: n }, () => ({ dx: (R() - 0.5) * (o.spread ?? 0.3), dy: (R() - 0.5) * (o.spread ?? 0.3), lift: 0.6 + R() * 0.8, rot: R() * 6 }));
  const dur = (n - 1) * gap + fly + after;
  const colors = Array.isArray(o.color) ? o.color : [o.color];
  return {
    start: 0, sounds: [[kindSound(o.kind), 0]], dur, impact: fly,
    draw(b, t) {
      const U = env.user, T = env.target;
      const a: P = o.from === 'centre' ? centre(U) : mouth(U, env.dir);
      const ms = t * dur;
      shots.forEach((sh, i) => {
        const color = colors[i % colors.length];
        const c: P = [T.x + sh.dx * T.size, T.y + sh.dy * T.size];
        const lift = (o.lift ?? 0.25) * sh.lift * Math.abs(c[0] - a[0]);
        const u = (ms - i * gap) / fly;
        if (u < 0) return;
        if (u < 1) {
          const size = lerp(U.size, T.size, u) * (o.size ?? 0.28);
          const rot = (o.steady ? 0 : sh.rot) + u * (o.spin ?? 0) * Math.PI * 2;
          if (o.trail !== false) for (let k = 3; k >= 1; k--) {
            const v = u - k * 0.07;
            if (v <= 0) continue;
            const [x, y] = arc(a, c, v, lift);
            b.doodle(o.kind, color, x, y, size * (1 - k * 0.15), { alpha: 0.4 - k * 0.1, rot, seed: i + k });
          }
          const [x, y] = arc(a, c, u, lift);
          b.doodle(o.kind, color, x, y, size, { rot, seed: i, flip: env.dir < 0 });
          return;
        }
        const v = (ms - i * gap - fly) / after;
        if (v >= 1 || o.burst === false) return;
        const s = T.size * (o.size ?? 0.28);
        if (o.burst === 'star' || o.burst === undefined) b.star(c[0], c[1], s * 0.5 * (0.6 + v * 0.6), SPARK, { alpha: 1 - v, seed: 190 + i });
        else for (let k = 0; k < 5; k++) {
          const ang = (k / 5) * Math.PI * 2 + i;
          b.doodle(o.burst, color, c[0] + Math.cos(ang) * s * v, c[1] + Math.sin(ang) * s * v * 0.8, s * 0.45 * (1 - v * 0.5), { alpha: 1 - v, seed: k });
        }
      });
    },
  };
};

/** A vortex of embers (or leaves, sand…) closing in around the target. */
export const swirl = (o: { kind: DoodleKind; color: string; n?: number; dur?: number; size?: number }): Builder => (env) => {
  const n = o.n ?? 10, dur = o.dur ?? 900;
  return {
    start: 0, sounds: [[kindSound(o.kind), 0]], dur, impact: dur * 0.3,
    draw(b, t) {
      const T = env.target, s = S(env);
      const alpha = fade(t, 0.12, 0.2);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + t * Math.PI * 4;
        const rad = s * 0.75 * (1 - 0.55 * t);
        const x = T.x + Math.cos(a) * rad, y = T.y + s * 0.35 - t * s * 0.55 + Math.sin(a) * rad * 0.35;
        b.doodle(o.kind, o.color, x, y, s * (o.size ?? 0.3) * (Math.sin(a) > 0 ? 1.1 : 0.85), { alpha, rot: a, seed: i });
      }
    },
  };
};

/** A column of flames rising from the target's feet. */
export const blaze = (o: { color?: string; n?: number; dur?: number; size?: number } = {}): Builder => (env) => {
  const n = o.n ?? 16, dur = o.dur ?? 900;
  const R = fixed(env, 41);
  const flames = Array.from({ length: n }, (_, i) => [(i / n) * 0.6, R() - 0.5, 0.7 + R() * 0.6]);
  return {
    start: 0, sounds: [['fire', 0], ['fire', dur * 0.35]], dur, impact: dur * 0.2,
    draw(b, t) {
      const T = env.target, s = S(env);
      const [fx, fy] = feet(T);
      const color = o.color ?? PAL.feu[1];
      b.flash(0.18 * bell(t), PAL.feu[0]);
      const big = easeOut(seg(t, 0.1, 0.4)) * (1 - seg(t, 0.75, 1));
      b.doodle('flame', color, T.x, T.y - s * 0.1, s * 1.5 * big, { seed: 3 });
      flames.forEach(([delay, dx, sc], i) => {
        const u = seg(t, delay, delay + 0.4);
        if (u <= 0 || u >= 1) return;
        b.doodle('flame', i % 3 ? color : PAL.feu[2], fx + dx * s * 0.9, fy - u * s * 1.1, s * (o.size ?? 0.45) * sc * bell(u), { seed: i });
      });
    },
  };
};

/** A wobbly jet of water (or anything) from the user's mouth to the target. */
export const jet = (o: { color?: string; width?: number; dur?: number; drops?: boolean } = {}): Builder => (env) => {
  const dur = o.dur ?? 640;
  const color = o.color ?? PAL.eau[1];
  return {
    start: 0, sounds: [['water', 0]], dur, impact: dur * 0.35,
    draw(b, t) {
      const U = env.user, T = env.target, s = S(env);
      const head = easeOut(seg(t, 0, 0.35)), tail = easeIn(seg(t, 0.62, 1));
      if (head <= tail) return;
      const a = mouth(U, env.dir), c = centre(T);
      const pts = along(a, c, Math.abs(c[0] - a[0]) * 0.08, tail, head, 14).map(([x, y], i) => [x, y + Math.sin(i * 1.3 + b.boil) * s * 0.025] as P);
      const w = (o.width ?? 0.16) * lerp(U.size, T.size, 0.6);
      b.shape(ribbon(pts, (v) => w * lerp(1.1, 0.8, v)), color, { seed: 200 });
      b.line(pts, '#ffffff', w * 0.18 / env.k, { alpha: 0.85, seed: 201, passes: 1 });
      if (o.drops !== false && head >= 1) {
        const v = seg(t, 0.35, 1);
        for (let k = 0; k < 6; k++) {
          const ang = -Math.PI / 2 + (k - 2.5) * 0.5;
          const d = s * 0.6 * v;
          b.doodle('drop', color, c[0] + Math.cos(ang) * d, c[1] + Math.sin(ang) * d + v * v * s * 0.5, s * 0.14, { alpha: 1 - v, rot: ang + Math.PI / 2, seed: k });
        }
      }
    },
  };
};

/** A big wave rolling across the scene onto the target. */
export const wave = (o: { color?: string; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 1100;
  const color = o.color ?? PAL.eau[1];
  return {
    start: 0, sounds: [['wave', 0]], dur, impact: dur * 0.6,
    draw(b, t) {
      const { w, h, dir } = env;
      const T = env.target;
      const front = lerp(env.user.x - dir * w * 0.6, T.x + dir * T.size * 1.1, easeInOut(seg(t, 0, 0.85)));
      const back = front - dir * w * 1.3;
      const H = h * 0.62 * (1 - 0.3 * seg(t, 0.85, 1));
      const top: P[] = [];
      for (let i = 0; i <= 18; i++) {
        const u = i / 18;
        top.push([lerp(back, front, u), h - H * (0.3 + 0.7 * u ** 1.6) + Math.sin(u * 9 + b.boil * 0.8) * h * 0.015]);
      }
      // the crest breaks forward: a curling lip, then the front of the wave slopes down
      const crest = top[top.length - 1], R = H * 0.2;
      const lip: P[] = [];
      for (let k = 1; k <= 9; k++) {
        const a = -Math.PI / 2 + (k / 9) * Math.PI * 1.15;
        lip.push([crest[0] + dir * R * Math.cos(a), crest[1] + R + R * Math.sin(a)]);
      }
      const poly: P[] = [[back, h + 4], ...top, ...lip, [crest[0] - dir * R * 0.5, crest[1] + R * 1.7], [crest[0] + dir * H * 0.35, h + 4]];
      const alpha = 0.92 * (1 - seg(t, 0.88, 1));
      b.shape(poly, color, { alpha, seed: 210, gap: 4 });
      b.line([...top.slice(6), ...lip.slice(0, 6)], '#ffffff', 4, { alpha, seed: 211 });
      const r = b.rand(212);
      for (let k = 0; k < 5; k++) b.doodle('drop', PAL.eau[0], crest[0] + (r() - 0.3) * dir * H * 0.3, crest[1] - r() * H * 0.2, T.size * 0.12, { alpha, seed: k });
    },
  };
};

/** Drops (of water or paint) falling on the target. */
export const rainOn = (o: { colors: string[]; n?: number; dur?: number; kind?: DoodleKind; size?: number }): Builder => (env) => {
  const n = o.n ?? 22, dur = o.dur ?? 950;
  const R = fixed(env, 43);
  const drops = Array.from({ length: n }, () => [R() * 0.6, R() - 0.5, R() * 0.5]);
  return {
    start: 0, sounds: [['rain', 0]], dur, impact: dur * 0.3,
    draw(b, t) {
      const T = env.target, s = S(env);
      drops.forEach(([delay, dx, dy], i) => {
        const u = seg(t, delay, delay + 0.28);
        const x = T.x + dx * s * 1.2, land = T.y + dy * s;
        const color = o.colors[i % o.colors.length];
        if (u > 0 && u < 1) b.doodle(o.kind ?? 'drop', color, x, lerp(-s * 0.2, land, easeIn(u)), s * (o.size ?? 0.13), { seed: i });
        const v = seg(t, delay + 0.28, delay + 0.45);
        if (v > 0 && v < 1) b.ring(x, land, s * 0.14 * v, s * 0.05 * v, color, 2, { alpha: 1 - v, seed: 220 + i });
      });
    },
  };
};

/** Lightning: zigzags that strike from the sky (or the user) and flicker every flipbook frame. */
export const bolt = (o: { color?: string; n?: number; dur?: number; from?: 'sky' | 'user'; width?: number } = {}): Builder => (env) => {
  const n = o.n ?? 1, dur = o.dur ?? 560;
  const [light, main] = o.color ? [mix(o.color, '#ffffff', 0.6), o.color] : [PAL.electrique[0], PAL.electrique[1]];
  return {
    start: 0, sounds: Array.from({ length: n }, (_, i) => ['thunder', (i * dur) / n] as [FxSound, number]), dur, impact: dur * 0.12 / n,
    draw(b, t) {
      const T = env.target, s = S(env);
      for (let i = 0; i < n; i++) {
        const u = seg(t, i / n, (i + 0.85) / n);
        if (u <= 0 || u >= 1) continue;
        if (u < 0.3) b.flash(0.4 * (1 - u / 0.3));
        if (b.boil % 4 === 3 && u > 0.2) continue;
        const r = b.rand(230 + i);
        const a: P = o.from === 'user' ? mouth(env.user, env.dir) : [T.x + (r() - 0.5) * s * 0.6, -s * 0.1];
        const c: P = [T.x + (r() - 0.5) * s * 0.2, T.y];
        const pts: P[] = [a];
        for (let k = 1; k < 8; k++) {
          const v = k / 8;
          pts.push([lerp(a[0], c[0], v) + (r() - 0.5) * s * 0.32, lerp(a[1], c[1], v) + (r() - 0.5) * s * 0.08]);
        }
        pts.push(c);
        const wd = o.width ?? 1;
        b.line(pts, light, 12 * wd, { alpha: 0.6 * (1 - u), seed: 240 + i, passes: 1 });
        b.line(pts, main, 6 * wd, { alpha: 1 - u * 0.5, seed: 241 + i });
        b.line(pts, GRAPHITE, 1.1, { alpha: 0.7 * (1 - u), seed: 242 + i, passes: 1 });
        const m = pts[3];
        b.line([m, [m[0] + (r() - 0.3) * s * 0.4, m[1] + s * 0.25], [m[0] + (r() - 0.5) * s * 0.5, m[1] + s * 0.4]], main, 2.5 * wd, { alpha: 1 - u, seed: 243 + i });
        if (u > 0.15) b.star(c[0], c[1], s * 0.28 * (1 - u), light, { alpha: 1 - u, seed: 244 + i });
      }
    },
  };
};

/** Electric crackles popping around the target. */
export const sparks = (o: { color?: string; dur?: number; radius?: number; n?: number; who?: Who } = {}): Builder => (env) => {
  const dur = o.dur ?? 620;
  const color = o.color ?? PAL.electrique[1];
  return {
    start: 0, sounds: [['spark', 0], ['spark', dur * 0.4]], dur, impact: dur * 0.15,
    draw(b, t) {
      const T = who(env, o.who), s = T.size;
      const alpha = fade(t, 0.1, 0.25);
      const r = b.rand(250);
      for (let i = 0; i < (o.n ?? 4); i++) {
        const ang = r() * Math.PI * 2, d = r() * s * (o.radius ?? 0.55);
        const x = T.x + Math.cos(ang) * d, y = T.y + Math.sin(ang) * d * 0.8;
        const dir = r() * Math.PI * 2, L = s * 0.12;
        const pts: P[] = [[x, y]];
        for (let k = 1; k <= 3; k++) pts.push([x + Math.cos(dir) * L * k + (r() - 0.5) * L, y + Math.sin(dir) * L * k + (r() - 0.5) * L]);
        b.line(pts, color, 5, { alpha, seed: 251 + i });
        b.doodle('spark', SPARK, x, y, s * 0.24, { alpha, seed: i });
      }
    },
  };
};

/** A beam (one crayon or a rainbow of them) from the user to the target. */
export const beam = (o: { colors: string[]; width?: number; dur?: number; glow?: DoodleKind }): Builder => (env) => {
  const dur = o.dur ?? 720;
  return {
    start: 0, sounds: [['beam', 0]], dur, impact: dur * 0.3,
    draw(b, t) {
      const U = env.user, T = env.target;
      const head = easeOut(seg(t, 0, 0.3)), tail = easeIn(seg(t, 0.7, 1));
      if (head <= tail) return;
      const a = mouth(U, env.dir), c = centre(T);
      const w = (o.width ?? 0.16) * lerp(U.size, T.size, 0.5);
      const dx = c[0] - a[0], dy = c[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const n = o.colors.length;
      const r = b.rand(260);
      o.colors.forEach((color, i) => {
        const off = (i - (n - 1) / 2) * (w / n);
        const pts: P[] = [];
        for (let k = 0; k <= 10; k++) {
          const v = lerp(tail, head, k / 10);
          pts.push([a[0] + dx * v + nx * off + (r() - 0.5) * w * 0.12, a[1] + dy * v + ny * off + (r() - 0.5) * w * 0.12]);
        }
        b.shape(ribbon(pts, () => (w / n) * 1.15), color, { seed: 261 + i, lw: 1 });
      });
      if (n === 1) b.line(along(a, c, 0, tail, head, 6), '#ffffff', w * 0.12 / env.k, { alpha: 0.9, seed: 270, passes: 1 });
      if (head >= 1) {
        const pulse = 1 + 0.15 * Math.sin(b.boil * 2);
        b.doodle(o.glow ?? 'orb', o.colors[Math.floor(n / 2)], c[0], c[1], T.size * 0.5 * pulse * (1 - tail), { seed: 1 });
      }
    },
  };
};

/** A cone of particles breathed out at the target (frost, flames, dragon breath…). */
export const breath = (o: { kind: DoodleKind; colors: string[]; n?: number; dur?: number; spread?: number; size?: number }): Builder => (env) => {
  const n = o.n ?? 18, dur = o.dur ?? 760;
  const R = fixed(env, 47);
  const parts = Array.from({ length: n }, (_, i) => [(i / n) * 0.55, R() - 0.5, R() * 6]);
  return {
    start: 0, sounds: [[kindSound(o.kind), 0]], dur, impact: dur * 0.42,
    draw(b, t) {
      const U = env.user, T = env.target;
      const a = mouth(U, env.dir), c = centre(T);
      const dx = c[0] - a[0], dy = c[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      parts.forEach(([delay, side, rot], i) => {
        const u = seg(t, delay, delay + 0.42);
        if (u <= 0 || u >= 1) return;
        const v = easeOut(u);
        const spread = side * (o.spread ?? 0.35) * T.size * 2 * v;
        const x = a[0] + dx * v + nx * spread, y = a[1] + dy * v + ny * spread;
        const size = lerp(U.size, T.size, v) * (o.size ?? 0.2) * lerp(0.4, 1.1, u);
        b.doodle(o.kind, o.colors[i % o.colors.length], x, y, size, { alpha: 1 - seg(u, 0.75, 1), rot: rot + u * 3, seed: i });
      });
    },
  };
};

/** Curls of wind (with feathers or leaves) blowing at the target. */
export const gust = (o: { color?: string; n?: number; dur?: number; bits?: DoodleKind; bitColor?: string } = {}): Builder => (env) => {
  const n = o.n ?? 3, dur = o.dur ?? 760;
  const color = o.color ?? '#a9cdf2';
  return {
    start: 0, sounds: [['wind', 0]], dur, impact: dur * 0.55,
    draw(b, t) {
      const U = env.user, T = env.target;
      const a = mouth(U, env.dir), c = centre(T);
      for (let i = 0; i < n; i++) {
        const u = seg(t, i * 0.12, i * 0.12 + 0.6);
        if (u <= 0 || u >= 1) continue;
        const [x, y] = arc(a, c, easeOut(u), Math.abs(c[0] - a[0]) * 0.15 * (i % 2 ? -1 : 1));
        const s = lerp(U.size, T.size, u) * 0.28;
        const pts: P[] = [];
        for (let k = 0; k <= 20; k++) {
          const ang = k * 0.45 + u * 8 + i;
          const rad = (k / 20) * s;
          pts.push([x + Math.cos(ang) * rad - env.dir * (20 - k) * s * 0.04, y + Math.sin(ang) * rad * 0.6]);
        }
        const alpha = 1 - seg(u, 0.7, 1);
        b.line(pts, color, 3.5, { alpha, seed: 280 + i });
        b.line(pts, GRAPHITE, 1, { alpha: alpha * 0.7, seed: 284 + i, passes: 1 });
        if (o.bits) b.doodle(o.bits, o.bitColor ?? PAL.vol[0], x - env.dir * s * 0.5, y + s * 0.3, s * 0.7, { alpha, rot: u * 6 + i, seed: i });
      }
    },
  };
};

/** Rocks falling on the target. */
export const rockfall = (o: { color?: string; n?: number; dur?: number; size?: number } = {}): Builder => (env) => {
  const n = o.n ?? 5, dur = o.dur ?? 850;
  const R = fixed(env, 53);
  const rocks = Array.from({ length: n }, (_, i) => [i * (0.5 / n), R() - 0.5, R() * 0.4 - 0.1, 0.7 + R() * 0.6, R() * 6]);
  return {
    start: 0, sounds: [['rock', dur * 0.28]], dur, impact: dur * 0.28,
    draw(b, t) {
      const T = env.target, s = S(env);
      rocks.forEach(([delay, dx, dy, sc, rot], i) => {
        const u = seg(t, delay, delay + 0.28);
        if (u <= 0) return;
        const x = T.x + dx * s * 0.9, land = T.y + dy * s;
        const size = s * (o.size ?? 0.32) * sc;
        if (u < 1) return b.doodle('rock', o.color ?? PAL.roche[1], x, lerp(-size, land, easeIn(u)), size, { rot, seed: i });
        const v = seg(t, delay + 0.28, delay + 0.55);
        if (v >= 1) return;
        b.doodle('rock', o.color ?? PAL.roche[1], x + v * s * 0.15 * (dx > 0 ? 1 : -1), land - bell(v) * s * 0.15, size, { rot: rot + v, alpha: 1 - seg(v, 0.6, 1), seed: i });
        b.doodle('puff', '#d9c9a8', x, land + size * 0.3, size * (0.6 + v), { alpha: 0.8 * (1 - v), seed: i });
      });
    },
  };
};

/** Stone spikes shooting out of the ground under the target. */
export const spikes = (o: { color?: string; n?: number; dur?: number } = {}): Builder => (env) => {
  const n = o.n ?? 5, dur = o.dur ?? 760;
  const R = fixed(env, 59);
  const sp = Array.from({ length: n }, () => [0.6 + R() * 0.45, (R() - 0.5) * 0.2]);
  return {
    start: 0, sounds: [['rock', dur * 0.1]], dur, impact: dur * 0.28,
    draw(b, t) {
      const T = env.target, s = S(env);
      const [, fy] = feet(T);
      const alpha = 1 - seg(t, 0.78, 1);
      sp.forEach(([hgt, lean], i) => {
        const u = easeOut(seg(t, i * 0.05, i * 0.05 + 0.25));
        if (u <= 0) return;
        const x = T.x + (i - (n - 1) / 2) * s * 0.24, hh = hgt * s * u;
        const tri: P[] = [[x - s * 0.1, fy], [x + lean * s + s * 0.01, fy - hh], [x + s * 0.1, fy]];
        b.shape(tri, o.color ?? PAL.roche[1], { alpha, seed: 290 + i });
        b.line([[x - s * 0.02, fy - hh * 0.2], [x + lean * s * 0.7, fy - hh * 0.8]], '#ffffff', 1.6, { alpha: alpha * 0.8, seed: 296 + i, passes: 1 });
      });
    },
  };
};

/** Psychic ripples (or dream bubbles) travelling to the target. */
export const rings = (o: { colors: string[]; n?: number; dur?: number; bubbles?: boolean }): Builder => (env) => {
  const n = o.n ?? 4, dur = o.dur ?? 760;
  return {
    start: 0, sounds: [['psychic', 0]], dur, impact: dur * 0.5,
    draw(b, t) {
      const U = env.user, T = env.target;
      const a = mouth(U, env.dir), c = centre(T);
      for (let i = 0; i < n; i++) {
        const u = seg(t, i * 0.1, i * 0.1 + 0.5);
        const color = o.colors[i % o.colors.length];
        if (u > 0 && u < 1) {
          const [x, y] = arc(a, c, u, o.bubbles ? Math.sin(u * Math.PI * 2) * 20 : 0);
          const s = lerp(U.size, T.size, u) * (0.2 + u * 0.15);
          if (o.bubbles) b.doodle('bubble', color, x, y, s * 1.6, { seed: i });
          else b.ring(x, y, s * 0.55, s, color, 3.5, { alpha: 1 - seg(u, 0.8, 1), seed: 300 + i });
        }
        const v = seg(t, i * 0.1 + 0.5, i * 0.1 + 0.8);
        if (v > 0 && v < 1) b.ring(c[0], c[1], T.size * (0.2 + v * 0.6), T.size * (0.1 + v * 0.3), color, 3, { alpha: 1 - v, seed: 310 + i });
      }
    },
  };
};

// ------------------------------------------------------------------ ghosts, shadows, slime, sound

/** Darkens the backdrop with graphite hatching (under the drawings). */
export const darken = (o: { color?: string; alpha?: number; dur?: number } = {}): Builder => () => {
  const dur = o.dur ?? 900;
  return {
    start: 0, dur, back: true,
    draw(b, t) {
      b.wash(o.color ?? INK, (o.alpha ?? 0.4) * fade(t, 0.18, 0.3));
    },
  };
};

/** Full-scene flash. */
export const flash = (o: { color?: string; alpha?: number; dur?: number } = {}): Builder => () => ({
  start: 0, dur: o.dur ?? 220,
  draw(b, t) {
    b.flash((o.alpha ?? 0.55) * (1 - t), o.color);
  },
});

/** A doodle popping up at a drawing (a moon, a sun, a magnet, a ghost's face…). */
export const pop = (o: { kind: DoodleKind; color: string; who?: Who; size?: number; dur?: number; dx?: number; dy?: number; spin?: number }): Builder => (env) => {
  const dur = o.dur ?? 560;
  return {
    start: 0, sounds: [[o.kind === 'magnet' ? 'beam' : 'shine', 0]], dur, impact: dur * 0.3,
    draw(b, t) {
      const A = who(env, o.who), s = A.size;
      const grow = easeOut(seg(t, 0, 0.3));
      const size = s * (o.size ?? 0.5) * (grow + 0.12 * bell(seg(t, 0.25, 0.45)));
      b.doodle(o.kind, o.color, A.x + (o.dx ?? 0) * s, A.y + (o.dy ?? 0) * s, size, { alpha: 1 - seg(t, 0.75, 1), rot: (o.spin ?? 0) * t * Math.PI * 2 });
    },
  };
};

/** Little sparkles popping around a drawing. */
export const sparkle = (o: { who?: Who; color?: string; n?: number; dur?: number; size?: number; kind?: DoodleKind } = {}): Builder => (env) => {
  const n = o.n ?? 6, dur = o.dur ?? 600;
  const R = fixed(env, 61);
  const pts = Array.from({ length: n }, () => [R() - 0.5, R() - 0.5, R() * 0.5]);
  return {
    start: 0, sounds: [[!o.kind || o.kind === 'spark' || o.kind === 'star' ? 'twinkle' : kindSound(o.kind), 0]], dur,
    draw(b, t) {
      const A = who(env, o.who), s = A.size;
      pts.forEach(([dx, dy, delay], i) => {
        const u = seg(t, delay, delay + 0.5);
        if (u <= 0 || u >= 1) return;
        b.doodle(o.kind ?? 'spark', o.color ?? SPARK, A.x + dx * s * 1.1, A.y + dy * s, s * (o.size ?? 0.2) * bell(u), { seed: i });
      });
    },
  };
};

/** A ghost's face springing up behind the target: « Bouh ! » */
export const boo = (o: { dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 720;
  return {
    start: 0, sounds: [['ghost', 0]], dur, impact: dur * 0.35,
    draw(b, t) {
      const T = env.target, s = S(env);
      const g = easeOut(seg(t, 0, 0.35)) * (1 + 0.15 * bell(seg(t, 0.3, 0.5)));
      const alpha = 1 - seg(t, 0.72, 1);
      const r = s * 0.55 * g, cx = T.x - env.dir * s * 0.1, cy = T.y - s * 0.15;
      const body: P[] = [];
      for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; body.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      for (let i = 0; i <= 6; i++) body.push([cx + r - (i / 6) * r * 2, cy + r * 0.9 + (i % 2 ? -r * 0.18 : 0)]);
      b.shape(body, PAPER, { alpha, seed: 320, line: GRAPHITE, wash: 0.95 });
      for (const ex of [-0.35, 0.35]) b.shape(b.blob(cx + ex * r, cy - r * 0.15, r * 0.13, r * 0.2, 321, 8, 0.1), INK, { alpha, wash: 1 });
      b.shape(b.blob(cx, cy + r * 0.35, r * 0.18, r * 0.24, 322, 8, 0.15), INK, { alpha, wash: 1 });
    },
  };
};

/** Shadowy hands reaching out of the ground to grab the target. */
export const hands = (o: { color?: string; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 820;
  const color = o.color ?? PAL.spectre[1];
  return {
    start: 0, sounds: [['ghost', 0]], dur, impact: dur * 0.5,
    draw(b, t) {
      const T = env.target, s = S(env);
      const reach = easeOut(seg(t, 0, 0.45)), close = easeIn(seg(t, 0.4, 0.55));
      const alpha = 1 - seg(t, 0.78, 1);
      for (const sgn of [-1, 1]) {
        const bx = T.x + sgn * lerp(s * 0.9, s * (0.32 - close * 0.12), reach);
        const by = T.y + lerp(s * 0.8, s * 0.1, reach);
        b.shape(b.blob(bx, by, s * 0.16, s * 0.19, 330 + sgn, 10, 0.15), color, { alpha, seed: 330 + sgn });
        for (let f = 0; f < 4; f++) {
          const ang = -Math.PI / 2 + sgn * (-0.9 + f * 0.45 + close * 0.6);
          const L = s * 0.24;
          const pts: P[] = [[bx, by], [bx + Math.cos(ang) * L * 0.6, by + Math.sin(ang) * L * 0.6], [bx + Math.cos(ang + sgn * 0.3) * L, by + Math.sin(ang + sgn * 0.3) * L]];
          b.shape(ribbon(pts, (v) => s * 0.07 * (1 - v * 0.5)), color, { alpha, seed: 334 + f + sgn });
        }
      }
    },
  };
};

/** Spiral eyes staring over the target. */
export const eyes = (o: { color?: string; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 900;
  return {
    start: 0, sounds: [['psychic', 0]], dur, impact: dur * 0.4,
    draw(b, t) {
      const T = env.target, s = S(env);
      const alpha = fade(t, 0.15, 0.25);
      for (const ex of [-0.22, 0.22]) {
        const cx = T.x + ex * s, cy = T.y - s * 0.2;
        b.shape(b.blob(cx, cy, s * 0.17, s * 0.2, 340, 12, 0.08), PAPER, { alpha, line: GRAPHITE, wash: 0.95 });
        const pts: P[] = [];
        for (let k = 0; k < 30; k++) {
          const a = k * 0.42 + t * 14 * (ex > 0 ? 1 : -1), rad = (k / 30) * s * 0.15;
          pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 1.15]);
        }
        b.line(pts, o.color ?? PAL.spectre[2], 2.2, { alpha, seed: 342 });
      }
    },
  };
};

/** A long tongue licking the target. */
export const tongue = (o: { color?: string; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 640;
  return {
    start: 0, sounds: [['sludge', dur * 0.3]], dur, impact: dur * 0.42,
    draw(b, t) {
      const U = env.user, T = env.target;
      const reach = easeOut(seg(t, 0, 0.42)) * (1 - easeIn(seg(t, 0.6, 1)));
      if (reach <= 0.02) return;
      const a = mouth(U, env.dir), c = centre(T);
      const pts = along(a, c, -Math.abs(c[0] - a[0]) * 0.2, 0, reach, 14);
      const w = lerp(U.size, T.size, 0.5) * 0.13;
      b.shape(ribbon(pts, (v) => w * lerp(0.7, 1.1, v)), o.color ?? '#ef7aa0', { seed: 350 });
      const end = pts[pts.length - 1];
      b.shape(b.blob(end[0], end[1], w * 0.65, w * 0.65, 351, 10, 0.1), o.color ?? '#ef7aa0', { seed: 351 });
    },
  };
};

/** A dark scribbled shadow with eyes, sliding over to swallow the target. */
export const shade = (o: { color?: string; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 880;
  const color = o.color ?? PAL.spectre[2];
  return {
    start: 0, sounds: [['ghost', 0]], dur, impact: dur * 0.55,
    draw(b, t) {
      const U = env.user, T = env.target;
      const u = easeInOut(seg(t, 0, 0.55));
      const [x, y] = arc(centre(U), centre(T), u, 20);
      const s = lerp(U.size, T.size, u) * lerp(0.35, 0.95, seg(t, 0.4, 0.7));
      const alpha = 0.92 * (1 - seg(t, 0.78, 1));
      b.shape(b.blob(x, y, s * 0.55, s * 0.5, 360, 16, 0.3), color, { alpha, seed: 360, gap: 2.4, wash: 0.75 });
      for (const ex of [-0.18, 0.18]) b.shape(b.blob(x + ex * s, y - s * 0.12, s * 0.07, s * 0.1, 362, 8, 0.1), '#ffffff', { alpha, wash: 1, line: false });
    },
  };
};

/** A splat of goo (or ink) on the target, dripping. */
export const splat = (o: { color: string; dur?: number; size?: number }): Builder => (env) => {
  const dur = o.dur ?? 640;
  return {
    start: 0, sounds: [['sludge', 0]], dur, impact: 0,
    draw(b, t) {
      const T = env.target, s = S(env) * (o.size ?? 0.7);
      const g = easeOut(seg(t, 0, 0.2));
      const alpha = 1 - seg(t, 0.8, 1);
      b.star(T.x, T.y, s * 0.55 * g, o.color, { points: 11, inner: 0.62, alpha, seed: 370 });
      const r = fixed(env, 67);
      for (let i = 0; i < 4; i++) {
        const x = T.x + (r() - 0.5) * s * 0.7, y0 = T.y + s * 0.1;
        const len = s * (0.25 + r() * 0.35) * easeOut(seg(t, 0.2, 0.8));
        if (len > 1) b.shape(ribbon([[x, y0], [x, y0 + len]], (v) => s * 0.07 * (1 - v * 0.4)), o.color, { alpha, seed: 371 + i });
      }
    },
  };
};

/** Sound: arcs from the user's mouth and notes (or Zzz, hearts) floating to the target. */
export const notes = (o: { colors: string[]; n?: number; dur?: number; kind?: DoodleKind; arcs?: boolean; size?: number }): Builder => (env) => {
  const n = o.n ?? 6, dur = o.dur ?? 920;
  return {
    start: 0, sounds: [[o.kind === 'zzz' ? 'snore' : 'song', 0]], dur, impact: dur * 0.5,
    draw(b, t) {
      const U = env.user, T = env.target;
      const a = mouth(U, env.dir), c = centre(T);
      if (o.arcs !== false) for (let k = 0; k < 3; k++) {
        const u = ((t * 3 + k / 3) % 1);
        const rad = U.size * (0.12 + u * 0.3);
        const ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
        b.ring(a[0], a[1], rad, rad, GRAPHITE, 2, { alpha: (1 - u) * fade(t, 0.1, 0.2), from: ang - 0.6, to: ang + 0.6, seed: 380 + k });
      }
      for (let i = 0; i < n; i++) {
        const u = seg(t, i * (0.5 / n), i * (0.5 / n) + 0.5);
        if (u <= 0 || u >= 1) continue;
        const [x, y] = arc(a, c, u, 0);
        const wobble = Math.sin(u * Math.PI * 3 + i) * T.size * 0.15;
        const size = lerp(U.size, T.size, u) * (o.size ?? 0.3);
        b.doodle(o.kind ?? 'note', o.colors[i % o.colors.length], x, y + wobble, size, { alpha: 1 - seg(u, 0.8, 1), rot: Math.sin(u * 6 + i) * 0.3, seed: i });
      }
    },
  };
};

/** Buzzing: wiggly lines vibrating on both sides of the target. */
export const buzz = (o: { color?: string; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 820;
  return {
    start: 0, sounds: [['buzz', 0]], dur, impact: dur * 0.25,
    draw(b, t) {
      const T = env.target, s = S(env);
      const alpha = fade(t, 0.1, 0.25);
      const r = b.rand(390);
      for (const sgn of [-1, 1]) for (let k = 0; k < 3; k++) {
        const x = T.x + sgn * s * (0.5 + k * 0.12), pts: P[] = [];
        for (let i = 0; i <= 6; i++) pts.push([x + (i % 2 ? sgn : -sgn) * s * 0.04 + (r() - 0.5) * s * 0.02, T.y - s * 0.25 + i * s * 0.08]);
        b.line(pts, o.color ?? PAL.insecte[2], 2.2, { alpha: alpha * (1 - k * 0.25), seed: 391 + k });
      }
    },
  };
};

/** Glowing bits flowing from the target back to the user (draining moves). */
export const drain = (o: { color?: string; n?: number; dur?: number } = {}): Builder => (env) => {
  const n = o.n ?? 5, dur = o.dur ?? 720;
  return {
    start: 0, sounds: [['heal', dur * 0.5]], dur,
    draw(b, t) {
      const U = env.user, T = env.target;
      for (let i = 0; i < n; i++) {
        const u = seg(t, i * 0.1, i * 0.1 + 0.5);
        if (u <= 0 || u >= 1) continue;
        const [x, y] = arc(centre(T), centre(U), easeInOut(u), 30 + i * 8);
        b.doodle('orb', o.color ?? PAL.plante[1], x, y, lerp(T.size, U.size, u) * 0.14, { seed: i });
      }
      const v = seg(t, 0.55, 1);
      if (v > 0 && v < 1) b.doodle('spark', SPARK, U.x, U.y, U.size * 0.4 * bell(v), {});
    },
  };
};

/** Light gathering on the user (charging a beam). */
export const gather = (o: { color?: string; n?: number; dur?: number } = {}): Builder => (env) => {
  const n = o.n ?? 12, dur = o.dur ?? 900;
  const R = fixed(env, 71);
  const parts = Array.from({ length: n }, () => [R() * Math.PI * 2, R() * 0.4]);
  return {
    start: 0, sounds: [['charge', 0]], dur,
    draw(b, t) {
      const U = env.user, s = U.size;
      const color = o.color ?? PAL.electrique[0];
      parts.forEach(([ang, delay], i) => {
        const u = seg(t, delay, delay + 0.55);
        if (u <= 0 || u >= 1) return;
        const d = s * 0.9 * (1 - easeIn(u));
        b.doodle('spark', color, U.x + Math.cos(ang) * d, U.y + Math.sin(ang) * d * 0.8, s * 0.12, { seed: i });
      });
      b.doodle('orb', color, U.x, U.y, s * 0.5 * easeOut(seg(t, 0.2, 0.9)) * (1 - seg(t, 0.92, 1)), {});
    },
  };
};

