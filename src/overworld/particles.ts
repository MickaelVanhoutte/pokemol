/**
 * Little things flying off where people walk, in map pixels: blades of grass kicked up in tall grass,
 * a puff of dust when landing from a ledge, rings spreading behind the paper boat. A small pool, stepped
 * and drawn by `Game` each frame; the maths here are pure.
 */
import type { Rand } from '../ui/paper/pencilCanvas';

export type ParticleKind = 'blade' | 'dust' | 'ripple';

export interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Age and lifetime, ms. */
  t: number;
  life: number;
  /** Which of a few shades. */
  shade: number;
}

/** No more than this many at once (phones): the oldest go first. */
export const MAX_PARTICLES = 60;

const GRAVITY = 0.00045;

/** Ages and moves the particles by `dt` ms; the dead ones are dropped. */
export function stepParticles(ps: Particle[], dt: number): Particle[] {
  const out: Particle[] = [];
  for (const p of ps) {
    const t = p.t + dt;
    if (t >= p.life) continue;
    // blades fall back down, dust drifts and slows, ripples stay where they are (they only grow)
    const vy = p.kind === 'blade' ? p.vy + GRAVITY * dt : p.kind === 'dust' ? p.vy * 0.96 : 0;
    const vx = p.kind === 'dust' ? p.vx * 0.95 : p.vx;
    out.push({ ...p, t, x: p.x + vx * dt, y: p.y + vy * dt, vx, vy });
  }
  return out.slice(-MAX_PARTICLES);
}

/** Blades of grass kicked up from a tile of tall grass (its top-left corner in map pixels). */
export function grassBurst(tx: number, ty: number, r: Rand): Particle[] {
  return Array.from({ length: 6 }, (_, i) => {
    const side = i % 2 ? 1 : -1;
    return {
      kind: 'blade' as const, x: tx + 8 + side * (2 + r() * 4), y: ty + 11 + r() * 2,
      vx: side * (0.012 + r() * 0.02), vy: -(0.05 + r() * 0.04), t: 0, life: 360 + r() * 140, shade: i % 3,
    };
  });
}

/** A puff of dust at someone's feet (the middle of the tile they land on). */
export function dustPuff(tx: number, ty: number, r: Rand): Particle[] {
  return Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI + (i / 7) * Math.PI;
    return {
      kind: 'dust' as const, x: tx + 8 + Math.cos(a) * 3, y: ty + 14,
      vx: Math.cos(a) * (0.02 + r() * 0.015), vy: Math.sin(a) * 0.012 - 0.004, t: 0, life: 380 + r() * 120, shade: i % 2,
    };
  });
}

/** A ring spreading on the water behind the boat. */
export function ripple(tx: number, ty: number): Particle {
  return { kind: 'ripple', x: tx + 8, y: ty + 13, vx: 0, vy: 0, t: 0, life: 700, shade: 0 };
}

// light enough to read against the grass, like the GBA's flying leaves
const BLADES = ['#c4e889', '#e6f5b0', '#9ed36a'];
const DUST = ['rgba(244, 234, 210, ALPHA)', 'rgba(222, 202, 160, ALPHA)'];

/** Draws the particles; `camX`/`camY` is the view's corner in map pixels. */
export function drawParticles(ctx: CanvasRenderingContext2D, ps: Particle[], camX: number, camY: number) {
  for (const p of ps) {
    const u = p.t / p.life;
    const x = Math.round(p.x - camX), y = Math.round(p.y - camY);
    if (p.kind === 'blade') {
      // a blade tilting as it flies, with a dark edge so it shows on any grass
      const tip = p.vx > 0 ? 1 : -1;
      ctx.fillStyle = 'rgba(40, 70, 30, 0.6)';
      ctx.fillRect(x - tip, y + 1, 2, 2);
      ctx.fillStyle = BLADES[p.shade % BLADES.length];
      ctx.fillRect(x, y, 2, 2);
      ctx.fillRect(x + tip, y - 1, 1, 1);
    } else if (p.kind === 'dust') {
      ctx.fillStyle = DUST[p.shade % DUST.length].replace('ALPHA', (0.9 * (1 - u)).toFixed(2));
      const s = u < 0.35 ? 3 : u < 0.7 ? 2 : 1;
      ctx.fillRect(x - (s >> 1), y - (s >> 1), s, s);
    } else {
      ctx.strokeStyle = `rgba(235, 248, 255, ${(0.75 * (1 - u)).toFixed(2)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x + 0.5, y + 0.5, 3 + u * 7, 1 + u * 2.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
