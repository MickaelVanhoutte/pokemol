import type { Draft, P } from './kid.ts';

/** Lunelle's evolution: rounder, little wings, a crescent moon on its forehead, stars around. */
export default {
  id: '028', slug: 'luneclat', seed: 21, layered: true, size: [1100, 1100], tilt: 2, pivot: [550, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot } = k;
    const PINK = '#f39ac0', WHITE = '#f6eef6', YEL = '#f6d22c', RED = '#e8606a';
    // little wings behind the shoulders
    shape(shake([[340, 540], [170, 440], [150, 520], [200, 560], [150, 610], [320, 640]], 6), WHITE, { gap: 13 });
    shape(shake([[680, 540], [850, 440], [870, 520], [820, 560], [870, 610], [700, 640]], 6), WHITE, { gap: 13 });
    // long ears with brown insides
    for (const dir of [-1, 1]) {
      const x = 510 + dir * 90;
      shape(shake([[x - 50, 320], [x + dir * 60 - 30, 40], [x + dir * 60 + 30, 50], [x + 50, 300]], 6), PINK, { gap: 12 });
      stroke([[x + dir * 30, 280], [x + dir * 58, 90]], 9);
    }
    // feet, round body, white belly, stubby arms
    shape(potato(420, 975, 80, 42, 7, 0.1), PINK, { gap: 12, miss: 0 });
    shape(potato(600, 975, 80, 42, 7, 0.1), PINK, { gap: 12, miss: 0 });
    shape(potato(510, 720, 215, 240, 10, 0.05), PINK, { gap: 15, miss: 0.08 });
    shape(potato(510, 780, 115, 135, 8, 0.07), WHITE, { gap: 13, miss: 0.1 });
    shape(potato(300, 640, 60, 38, 6, 0.1), PINK, { gap: 11, miss: 0 });
    shape(potato(720, 640, 60, 38, 6, 0.1), PINK, { gap: 11, miss: 0 });
    // head with big round eyes and a crescent moon
    shape(potato(510, 370, 160, 135, 9, 0.05), PINK, { gap: 14, miss: 0.04 });
    for (const x of [448, 575]) {
      shape(potato(x, 365, 36, 40, 7, 0.04), '#ffffff', { gap: 9, w: 6, miss: 0.5 }, 5);
      dot(x + 6, 372, 12, 14);
    }
    shape(potato(512, 430, 26, 20, 6, 0.1), RED, { gap: 7, w: 8, miss: 0 }, 4.5);
    stroke([[470, 470], [512, 488], [555, 468]], 5.5);
    const moon: P[] = [];
    for (let a = -1.2; a <= 4.3; a += 0.4) moon.push([510 + Math.cos(a) * 46, 262 + Math.sin(a) * 46]);
    for (let a = 4.0; a >= -0.9; a -= 0.45) moon.push([526 + Math.cos(a) * 34, 250 + Math.sin(a) * 34]);
    shape(moon, YEL, { gap: 8, w: 9, miss: 0 }, 5);
    stroke([[468, 240], [462, 250]], 3);
    // stars
    for (const [x, y, s] of [[180, 220, 1], [880, 260, 0.8], [900, 820, 0.7], [140, 860, 0.8]] as [number, number, number][]) {
      const star: P[] = [];
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = (i % 2 ? 18 : 42) * s; star.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
      shape(star, YEL, { gap: 7, w: 8, miss: 0 }, 4.5);
    }
  },
} satisfies Draft;
