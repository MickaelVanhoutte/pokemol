/**
 * Effect builders for status moves and battle events: stat arrows, things rising or circling around
 * a drawing, powders, a paper shield, weather arriving, the Crayon-ball… Same rules as `effects.ts`.
 */
import { GRAPHITE } from '../../paper/pencilCanvas';
import type { DoodleKind } from './doodles';
import type { FxSound } from '../../../audio/sfx';
import { along, feet, fixed, kindSound, who, type Who } from './effects';
import { arc, bell, centre, easeIn, easeOut, fade, lerp, mix, mouth, seg, PAL, PAPER, SPARK, type Builder, type P } from './core';

/** FRLG-style stat change: chevrons rising (up) or falling (down) over a drawing. */
export const aura = (o: { color: string; down?: boolean; who?: Who; dur?: number }): Builder => (env) => {
  const dur = o.dur ?? 760;
  return {
    start: 0, sounds: [[o.down ? 'statDown' : 'statUp', 0]], dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      const alpha = fade(t, 0.12, 0.25) * 0.95;
      for (let col = -1; col <= 1; col++) for (let row = 0; row < 4; row++) {
        const u = (t * 1.6 + row / 4 + (col + 1) * 0.13) % 1;
        const y = o.down ? lerp(A.top, A.bottom, u) : lerp(A.bottom, A.top, u);
        const x = A.x + col * s * 0.3, w = s * 0.12, d = o.down ? -1 : 1;
        b.line([[x - w, y + d * w * 0.7], [x, y], [x + w, y + d * w * 0.7]], o.color, 4.5, { alpha: alpha * bell(u), seed: 400 + col * 4 + row });
      }
    },
  };
};

/** Doodles drifting up from a drawing (Zzz, bubbles, flames, plus signs…). */
export const rise = (o: { kind: DoodleKind; color: string; n?: number; dur?: number; size?: number; who?: Who }): Builder => (env) => {
  const n = o.n ?? 5, dur = o.dur ?? 860;
  const R = fixed(env, 83);
  const bits = Array.from({ length: n }, (_, i) => [R() - 0.5, (i / n) * 0.5, R() * 0.6 - 0.3]);
  return {
    start: 0, sounds: [[kindSound(o.kind), 0]], dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      bits.forEach(([dx, delay, rot], i) => {
        const u = seg(t, delay, delay + 0.5);
        if (u <= 0 || u >= 1) return;
        const x = A.x + dx * s * 0.8 + Math.sin(u * 6 + i) * s * 0.05;
        const y = lerp(A.y + s * 0.15, A.top - s * 0.1, easeOut(u));
        b.doodle(o.kind, o.color, x, y, s * (o.size ?? 0.22) * (0.6 + 0.4 * bell(u)), { alpha: fade(u, 0.15, 0.35), rot, seed: i });
      });
    },
  };
};

/** Doodles circling around a drawing's head (confusion stars). */
export const orbit = (o: { kind: DoodleKind; color: string; n?: number; dur?: number; size?: number; who?: Who }): Builder => (env) => {
  const n = o.n ?? 3, dur = o.dur ?? 900;
  return {
    start: 0, sounds: [['psychic', 0]], dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      const cy = A.top + s * 0.08;
      for (let i = 0; i < n; i++) {
        const a = t * Math.PI * 4 + (i / n) * Math.PI * 2;
        b.doodle(o.kind, o.color, A.x + Math.cos(a) * s * 0.35, cy + Math.sin(a) * s * 0.1, s * (o.size ?? 0.18) * (Math.sin(a) > 0 ? 1.15 : 0.85), { alpha: fade(t, 0.12, 0.25), seed: i });
      }
    },
  };
};

/** A powder cloud above the target, sprinkling down on it. */
export const powder = (o: { color: string; n?: number; dur?: number }): Builder => (env) => {
  const n = o.n ?? 22, dur = o.dur ?? 900;
  const R = fixed(env, 89);
  const grains = Array.from({ length: n }, () => [R() - 0.5, R() * 0.5, R()]);
  return {
    start: 0, sounds: [['twinkle', 0], ['twinkle', dur * 0.4]], dur, impact: dur * 0.35,
    draw(b, t) {
      const T = env.target, s = T.size;
      const cloud = easeOut(seg(t, 0, 0.25)) * (1 - seg(t, 0.75, 1));
      b.doodle('puff', mix(o.color, PAPER, 0.4), T.x, T.top - s * 0.05, s * 0.85 * cloud, { alpha: 0.85 });
      grains.forEach(([dx, delay, k], i) => {
        const u = seg(t, 0.15 + delay, 0.15 + delay + 0.4);
        if (u <= 0 || u >= 1) return;
        b.doodle(i % 3 ? 'spark' : 'star', o.color, T.x + dx * s * 0.9 + Math.sin(u * 8 + i) * s * 0.04, lerp(T.top, T.bottom - s * 0.1, u), s * (0.07 + k * 0.06), { alpha: fade(u, 0.1, 0.3), seed: i });
      });
    },
  };
};

/** Big angry doodled eyes flying from the user to stare at the target. */
export const glare = (o: { color?: string; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 800;
  return {
    start: 0, sounds: [['ghost', 0]], dur, impact: dur * 0.5,
    draw(b, t) {
      const U = env.user, T = env.target;
      const u = easeOut(seg(t, 0, 0.5));
      const [x, y] = arc(mouth(U, env.dir), centre(T), u, 10);
      const s = lerp(U.size, T.size, u) * lerp(0.4, 0.75, u);
      const alpha = 1 - seg(t, 0.8, 1);
      for (const sgn of [-1, 1]) {
        const ex = x + sgn * s * 0.24;
        b.shape(b.blob(ex, y, s * 0.17, s * 0.12, 410, 12, 0.08), PAPER, { alpha, line: GRAPHITE, wash: 0.95 });
        b.shape(b.blob(ex + sgn * -s * 0.03, y + s * 0.02, s * 0.06, s * 0.07, 411, 8, 0.1), o.color ?? '#c8361f', { alpha, wash: 1 });
        b.line([[ex - s * 0.18, y - s * 0.15 - sgn * s * 0.05], [ex + s * 0.16, y - s * 0.15 + sgn * s * 0.05]], GRAPHITE, 4, { alpha, seed: 412 });
      }
    },
  };
};

/** Handwritten words floating around the target (a creepy « hi hi »). */
export const scribble = (o: { text: string; color: string; n?: number; dur?: number; who?: Who }): Builder => (env) => {
  const n = o.n ?? 4, dur = o.dur ?? 900;
  const R = fixed(env, 97);
  const words = Array.from({ length: n }, () => [R() - 0.5, R() - 0.5, R() * 0.4, R() - 0.5]);
  return {
    start: 0, sounds: [['ghost', 0]], dur, impact: dur * 0.3,
    draw(b, t) {
      const A = who(env, o.who), s = A.size;
      words.forEach(([dx, dy, delay, rot], i) => {
        const u = seg(t, delay, delay + 0.55);
        if (u <= 0 || u >= 1) return;
        const jig = Math.sin(b.boil * 2 + i) * s * 0.02;
        b.text(o.text, A.x + dx * s * 1.1 + jig, A.y + dy * s * 0.9 - u * s * 0.2, s * 0.22 * (0.7 + 0.3 * bell(u)), o.color, { rot: rot * 0.6, alpha: fade(u, 0.15, 0.3) });
      });
    },
  };
};

/** Curly vines growing up around a drawing (Graine gourmande). */
export const vines = (o: { color?: string; dur?: number; who?: Who } = {}): Builder => (env) => {
  const dur = o.dur ?? 900;
  const color = o.color ?? PAL.plante[1];
  return {
    start: 0, sounds: [['wind', 0]], dur, impact: dur * 0.3,
    draw(b, t) {
      const A = who(env, o.who), s = A.size;
      const [fx, fy] = feet(A);
      const grow = easeOut(seg(t, 0, 0.55)), alpha = 1 - seg(t, 0.8, 1);
      for (const sgn of [-1, 1]) {
        const pts: P[] = [];
        for (let k = 0; k <= 14 * grow; k++) {
          const v = k / 14;
          pts.push([fx + sgn * s * (0.35 + Math.sin(v * 9) * 0.1), fy - v * s * 0.9]);
        }
        b.line(pts, color, 5, { alpha, seed: 420 + sgn });
        for (let k = 4; k < pts.length; k += 4) b.doodle('leaf', color, pts[k][0] + sgn * s * 0.06, pts[k][1], s * 0.16, { alpha, rot: sgn * 0.6, flip: sgn < 0, seed: k });
      }
    },
  };
};

/** A sheet of paper held up in front of a drawing (Bouclier de papier). */
export const shield = (o: { who?: Who; dur?: number; flash?: boolean } = {}): Builder => (env) => {
  const dur = o.dur ?? 760;
  return {
    start: 0, sounds: [['shield', 0]], dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      const facing = A === env.user ? env.dir : -env.dir;
      const g = easeOut(seg(t, 0, 0.3)) * (o.flash ? 1 + 0.1 * bell(seg(t, 0.2, 0.5)) : 1);
      const alpha = (1 - seg(t, 0.75, 1)) * 0.92;
      const cx = A.x + facing * s * 0.32, cy = A.y, hw = s * 0.32 * g, hh = s * 0.5 * g;
      const sheet: P[] = [[cx - hw, cy - hh], [cx + hw * 0.6, cy - hh], [cx + hw, cy - hh * 0.75], [cx + hw, cy + hh], [cx - hw, cy + hh]];
      b.shape(sheet, '#fffdf4', { alpha, line: GRAPHITE, wash: 0.85, gap: 7 });
      b.line([[cx + hw * 0.6, cy - hh], [cx + hw * 0.6, cy - hh * 0.75], [cx + hw, cy - hh * 0.75]], GRAPHITE, 1.4, { alpha, seed: 431 });
      for (let k = 1; k < 5; k++) b.line([[cx - hw * 0.8, cy - hh + k * hh * 0.4], [cx + hw * 0.8, cy - hh + k * hh * 0.4]], '#8fb6ee', 1, { alpha: alpha * 0.7, seed: 432 + k, passes: 1 });
      b.doodle('spark', SPARK, cx + hw * 0.5, cy - hh * 0.5, s * 0.25 * bell(seg(t, 0.25, 0.7)), {});
    },
  };
};

/** A paper doll popping out (Pantin de papier), or torn into scraps when it breaks. */
export const doll = (o: { who?: Who; torn?: boolean; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 700;
  const R = fixed(env, 101);
  const scraps = Array.from({ length: 7 }, () => [R() * Math.PI * 2, 0.5 + R() * 0.6, R() * 6]);
  return {
    start: 0, sounds: [[o.torn ? 'slash' : 'pop', 0]], dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      b.doodle('puff', '#efeae0', A.x, A.y + s * 0.2, s * 0.9 * bell(seg(t, 0, 0.6)), { alpha: 0.8 });
      if (!o.torn) return b.doodle('doll', '#ffffff', A.x, A.y, s * 0.8 * easeOut(seg(t, 0.15, 0.5)), { alpha: 1 - seg(t, 0.8, 1), rot: Math.sin(t * 12) * 0.1 * (1 - t) });
      scraps.forEach(([a, sp, rot], i) => {
        const u = easeOut(seg(t, 0, 0.8));
        b.doodle('scrap', '#ffffff', A.x + Math.cos(a) * s * sp * u, A.y + Math.sin(a) * s * sp * u * 0.6 + u * u * s * 0.3, s * 0.18, { rot: rot + u * 4, alpha: 1 - seg(t, 0.7, 1), seed: i });
      });
    },
  };
};

/** Pulsing rings around a drawing (a drum beat, a talent waking up, a sharpened focus). */
export const pulse = (o: { color: string; who?: Who; n?: number; dur?: number }): Builder => (env) => {
  const n = o.n ?? 2, dur = o.dur ?? 640;
  return {
    start: 0, sounds: [['pop', 0]], dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      for (let i = 0; i < n; i++) {
        const u = seg(t, i * 0.25, i * 0.25 + 0.6);
        if (u <= 0 || u >= 1) continue;
        b.ring(A.x, A.y, s * (0.3 + u * 0.45), s * (0.18 + u * 0.3), o.color, 4 * (1 - u) + 1, { alpha: 1 - u, seed: 440 + i });
      }
    },
  };
};

/** A sweat drop sliding down next to the head (flinching). */
export const sweat = (o: { who?: Who; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 700;
  return {
    start: 0, dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      const side = A === env.user ? -env.dir : env.dir;
      b.doodle('drop', '#8fc6f2', A.x + side * s * 0.3, A.top + s * 0.15 + easeIn(t) * s * 0.2, s * 0.18, { alpha: fade(t, 0.1, 0.3) });
    },
  };
};

/** A pencil "pop" when a Bestiole comes out: strokes bursting out, stars and a puff. */
export const popOut = (o: { who?: Who; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 560;
  return {
    start: 0, sounds: [['pop', 0]], dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      const u = easeOut(t), alpha = 1 - seg(t, 0.5, 1);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const r0 = s * (0.2 + u * 0.45), r1 = r0 + s * 0.15;
        b.line([[A.x + Math.cos(a) * r0, A.y + Math.sin(a) * r0 * 0.8], [A.x + Math.cos(a) * r1, A.y + Math.sin(a) * r1 * 0.8]], GRAPHITE, 2, { alpha, seed: 450 + i, passes: 1 });
      }
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        b.doodle('star', SPARK, A.x + Math.cos(a) * s * 0.5 * u, A.y + Math.sin(a) * s * 0.4 * u, s * 0.15, { alpha, seed: i });
      }
    },
  };
};

/**
 * « Mise au propre »: a gold felt-tip goes round the drawing, then a big gold star is stamped on it. The Great
 * Eraser's (`dark`) goes round in black scribbles and stamps a grey star.
 */
export const fairTrace = (o: { who?: Who; dur?: number; dark?: boolean } = {}): Builder => (env) => {
  const dur = o.dur ?? 1300;
  return {
    start: 0, sounds: [['marker', 0], [o.dark ? 'ghost' : 'shiny', 720]], dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      const u = seg(t, 0, 0.55), alpha = 1 - seg(t, 0.85, 1);
      const pts: P[] = [];
      const steps = Math.ceil(48 * u);
      for (let k = 0; k <= steps; k++) {
        const a = -Math.PI / 2 + (k / 48) * Math.PI * 2.1;
        const r = o.dark ? 1 + 0.14 * Math.sin(k * 2.3) : 1;
        pts.push([A.x + Math.cos(a) * s * 0.55 * r, A.y + Math.sin(a) * s * 0.5 * r]);
      }
      if (pts.length > 1) {
        b.line(pts, o.dark ? '#1a1420' : '#f4b81c', 7, { alpha, seed: 520 });
        if (!o.dark) b.line(pts, GRAPHITE, 1.4, { alpha: alpha * 0.8, seed: 521, passes: 1 });
      }
      const v = seg(t, 0.5, 0.95);
      if (v > 0 && v < 1) b.doodle('star', o.dark ? '#4a4252' : '#ffd84a', A.x, A.y, s * 0.55 * bell(v), { seed: 522 });
    },
  };
};

/** A sparkly Bestiole coming out: two rings of gold stars bursting from it, then glitter twinkling all over. */
export const shinyBurst = (o: { who?: Who; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 1400;
  const R = fixed(env, 97);
  const glitter = Array.from({ length: 10 }, () => [R() - 0.5, R() - 0.5, 0.45 + R() * 0.4]);
  return {
    start: 0, sounds: [['shiny', 0], ['shiny', 560]], dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      ([[0, 8, 0], [0.4, 7, 0.45]] as const).forEach(([from, n, turn], w) => {
        const u = seg(t, from, from + 0.55);
        if (u <= 0 || u >= 1) return;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + turn + u * 0.9;
          const r = s * (0.12 + easeOut(u) * 0.6);
          b.doodle('star', i % 2 ? '#ffd84a' : SPARK, A.x + Math.cos(a) * r, A.y + Math.sin(a) * r * 0.85, s * 0.22 * bell(u), { seed: w * 20 + i });
        }
      });
      glitter.forEach(([dx, dy, at0], i) => {
        const u = seg(t, at0, at0 + 0.35);
        if (u <= 0 || u >= 1) return;
        b.doodle('spark', '#ffd84a', A.x + dx * s * 0.9, A.y + dy * s * 0.9, s * 0.15 * bell(u), { seed: 60 + i });
      });
    },
  };
};

/** A pencil whirl closing in on a drawing called back. */
export const whirl = (o: { who?: Who; dur?: number } = {}): Builder => (env) => {
  const dur = o.dur ?? 520;
  return {
    start: 0, sounds: [['wind', 0]], dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      const pts: P[] = [];
      for (let k = 0; k < 30; k++) {
        const a = k * 0.42 + t * 10, rad = (1 - k / 30) * s * 0.55 * (1 - t * 0.6);
        pts.push([A.x + Math.cos(a) * rad, A.y + Math.sin(a) * rad * 0.8]);
      }
      b.line(pts, GRAPHITE, 2, { alpha: fade(t, 0.1, 0.3), seed: 460 });
    },
  };
};

export type WeatherKind = 'pluie' | 'soleil' | 'sable' | 'grele';

/** Weather arriving over the whole scene (the overlay that stays is drawn in CSS). */
export const weatherIn = (o: { kind: WeatherKind; dur?: number }): Builder => (env) => {
  const dur = o.dur ?? 1000;
  const R = fixed(env, 103);
  const bits = Array.from({ length: 34 }, () => [R(), R(), R()]);
  return {
    start: 0, sounds: [[o.kind === 'pluie' ? 'rain' : o.kind === 'soleil' ? 'shine' : o.kind === 'sable' ? 'wind' : 'ice', 0]], dur,
    draw(b, t) {
      const { w, h } = env;
      const alpha = fade(t, 0.12, 0.3);
      if (o.kind === 'soleil') {
        b.flash(0.25 * bell(t), PAL.electrique[0]);
        const size = Math.min(w, h) * 0.45 * easeOut(seg(t, 0, 0.4));
        b.doodle('sun', PAL.electrique[1], w * 0.82, h * 0.12, size, { alpha, rot: t * 1.5 });
        return;
      }
      if (o.kind === 'pluie') b.wash('#4a78c4', 0.18 * alpha, { angle: 1.2, gap: 6 });
      if (o.kind === 'sable') b.wash('#c99a4e', 0.25 * alpha, { angle: 0.1, gap: 5 });
      bits.forEach(([x0, y0, k], i) => {
        const u = (t * (1.4 + k) + y0) % 1;
        if (o.kind === 'pluie') {
          const x = x0 * w * 1.2 - u * w * 0.2, y = u * h * 1.1 - h * 0.05;
          b.line([[x, y], [x - w * 0.03, y + h * 0.09]], '#4a92e0', 2.2, { alpha: alpha * 0.9, seed: 470 + i, passes: 1 });
        } else if (o.kind === 'sable') {
          b.doodle('clod', '#c99a4e', (u * 1.3 - 0.15) * w, y0 * h, Math.min(w, h) * (0.04 + k * 0.04), { alpha, rot: u * 9, seed: i });
        } else {
          b.doodle(i % 2 ? 'snow' : 'shard', PAL.glace[1], x0 * w, u * h * 1.1 - h * 0.05, Math.min(w, h) * (0.06 + k * 0.05), { alpha, rot: u * 6, seed: i });
        }
      });
    },
  };
};

/** Sand or hail battering a drawing at the end of the turn. */
export const batter = (o: { kind: 'sable' | 'grele'; who?: Who; dur?: number }): Builder => (env) => {
  const dur = o.dur ?? 700;
  const R = fixed(env, 107);
  const bits = Array.from({ length: 12 }, () => [R() - 0.5, R() * 0.5, R()]);
  return {
    start: 0, dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      bits.forEach(([dx, delay, k], i) => {
        const u = seg(t, delay, delay + 0.4);
        if (u <= 0 || u >= 1) return;
        if (o.kind === 'grele') b.doodle('shard', PAL.glace[1], A.x + dx * s, lerp(A.top - s * 0.4, A.y + s * 0.1, u), s * (0.08 + k * 0.08), { alpha: 1 - seg(u, 0.7, 1), seed: i });
        else b.doodle('clod', '#c99a4e', lerp(A.x - s * 0.9, A.x + s * 0.4, u), A.y + dx * s * 0.8, s * (0.05 + k * 0.06), { alpha: 1 - seg(u, 0.7, 1), rot: u * 6, seed: i });
      });
    },
  };
};

/** A thrown Crayon-ball: arc, opening pop, drop, shakes, then stars (caught) or a burst (broke free). */
export const crayonBall = (o: { kind: 'ball' | 'superball'; color: string; shakes: number; caught: boolean }): Builder => (env) => {
  const THROW = 450, OPEN = 220, DROP = 220, SHAKE = 650, END = 380;
  const dur = THROW + OPEN + DROP + SHAKE * o.shakes + END;
  return {
    start: 0, sounds: [['whoosh', 0], ['pop', THROW], ...Array.from({ length: o.shakes }, (_, k) => ['tick', THROW + OPEN + DROP + k * SHAKE + 150] as [FxSound, number]), ...(o.caught ? [] : [['pop', dur - END] as [FxSound, number]])], dur, impact: THROW,
    draw(b, t) {
      const T = env.target, s = T.size, ms = t * dur;
      const size = Math.max(30, s * 0.3);
      const [fx, fy] = feet(T);
      const rest: P = [fx, fy - size * 0.45];
      if (ms < THROW) {
        const u = ms / THROW;
        const start: P = [-size, env.h * 0.85];
        const [x, y] = arc(start, [T.x, T.y], u, env.h * 0.35);
        for (let k = 1; k <= 3; k++) {
          const [gx, gy] = arc(start, [T.x, T.y], Math.max(0, u - k * 0.06), env.h * 0.35);
          b.line([[gx, gy], [x, y]], GRAPHITE, 1.2, { alpha: 0.25, seed: 480 + k, passes: 1 });
        }
        return b.doodle(o.kind, o.color, x, y, size, { rot: u * Math.PI * 4 });
      }
      if (ms < THROW + OPEN + DROP) {
        const v = (ms - THROW) / (OPEN + DROP);
        if (ms < THROW + OPEN) {
          const w = (ms - THROW) / OPEN;
          b.flash(0.35 * (1 - w));
          b.star(T.x, T.y, s * 0.4 * (0.6 + w * 0.6), '#fffdf4', { alpha: 1 - w, seed: 490 });
        }
        const y = lerp(T.y, rest[1], easeIn(seg(v, 0.45, 1)));
        return b.doodle(o.kind, o.color, T.x, y, size, {});
      }
      const sm = ms - THROW - OPEN - DROP;
      if (sm < SHAKE * o.shakes) {
        const v = (sm % SHAKE) / SHAKE;
        const rot = Math.sin(seg(v, 0.1, 0.7) * Math.PI * 2) * 0.4;
        return b.doodle(o.kind, o.color, rest[0] + rot * size * 0.25, rest[1], size, { rot });
      }
      const e = seg(sm - SHAKE * o.shakes, 0, END);
      if (o.caught) {
        b.doodle(o.kind, mix(o.color, GRAPHITE, 0.25 * e), rest[0], rest[1], size, {});
        for (let i = 0; i < 3; i++) b.doodle('star', SPARK, rest[0] + (i - 1) * size * 0.9, rest[1] - size * (0.6 + e * 0.7) + Math.abs(i - 1) * size * 0.3, size * 0.7, { alpha: 1 - seg(e, 0.7, 1), seed: i });
        return;
      }
      b.star(rest[0], rest[1] - size * 0.3, size * (0.6 + e * 1.4), '#fffdf4', { alpha: 1 - e, seed: 491 });
      b.doodle(o.kind, o.color, rest[0], rest[1], size * (1 - e), { alpha: 1 - e });
    },
  };
};

/** Bits of a held item or a snack (crumbs of a berry). */
export const crumbs = (o: { color: string; who?: Who; dur?: number }): Builder => (env) => {
  const dur = o.dur ?? 700;
  const R = fixed(env, 109);
  const bits = Array.from({ length: 7 }, () => [R() - 0.5, R() * 0.3]);
  return {
    start: 0, dur,
    draw(b, t) {
      const A = who(env, o.who ?? 'user'), s = A.size;
      bits.forEach(([dx, delay], i) => {
        const u = seg(t, delay, delay + 0.6);
        if (u <= 0 || u >= 1) return;
        b.doodle('seed', o.color, A.x + dx * s * 0.5, lerp(A.y - s * 0.1, A.bottom, easeIn(u)), s * 0.09, { alpha: 1 - seg(u, 0.7, 1), rot: u * 5, seed: i });
      });
    },
  };
};

/** A thin thread (or silk) shot at the target. */
export const thread = (o: { color?: string; n?: number; dur?: number } = {}): Builder => (env) => {
  const n = o.n ?? 3, dur = o.dur ?? 600;
  return {
    start: 0, sounds: [['slash', 0]], dur, impact: dur * 0.45,
    draw(b, t) {
      const U = env.user, T = env.target;
      const a = mouth(U, env.dir), c = centre(T);
      for (let i = 0; i < n; i++) {
        const head = easeOut(seg(t, i * 0.08, i * 0.08 + 0.4));
        if (head <= 0) continue;
        const off = (i - (n - 1) / 2) * T.size * 0.18;
        const pts = along(a, [c[0], c[1] + off], Math.abs(c[0] - a[0]) * 0.1, 0, head, 10);
        b.line(pts, o.color ?? '#f4efe4', 2.6, { alpha: 1 - seg(t, 0.75, 1), seed: 500 + i });
        b.line(pts, GRAPHITE, 0.8, { alpha: 0.6 * (1 - seg(t, 0.75, 1)), seed: 504 + i, passes: 1 });
      }
    },
  };
};

