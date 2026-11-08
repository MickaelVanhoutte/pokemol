/**
 * Small animation maths shared by the battle effects, the transitions and the cut-scenes.
 * Everything takes a progress `t` from 0 to 1.
 */

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Progress of `t` inside [a, b], clamped. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const easeIn = (t: number) => t * t * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** Overshoots a little, then settles (a stamp, a pop). */
export const easeBack = (t: number) => {
  const c = 1.70158;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
};
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

/** Mixes two #rrggbb colours (0 = a, 1 = b). */
export function mix(a: string, b: string, t: number): string {
  const p = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  const ch = (i: number) => Math.round(lerp(p(a, i), p(b, i), t)).toString(16).padStart(2, '0');
  return `#${ch(0)}${ch(1)}${ch(2)}`;
}
