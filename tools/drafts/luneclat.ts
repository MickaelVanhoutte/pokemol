import type { Draft, P } from './kid.ts';

/** Lunelle's evolution: rounder, little wings, a crescent moon on its forehead, stars around. */
export default {
  id: '028', slug: 'luneclat', seed: 21, layered: true, size: [1100, 1100], tilt: 2, pivot: [550, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot } = k;
    const PINK = '#f39ac0', WHITE = '#f6eef6', YEL = '#f6d22c', RED = '#e8606a';
    // the far wing, small, behind on the left; the near wing big on the right
    shape(shake([[360, 540], [230, 470], [215, 530], [250, 560], [215, 600], [340, 630]], 6), WHITE, { gap: 13 });
    shape(shake([[660, 520], [860, 400], [890, 490], [830, 540], [890, 610], [690, 650]], 6), WHITE, { gap: 13 });
    // the far ear, the far foot
    shape(shake([[380, 320], [300, 50], [360, 50], [440, 300]], 6), PINK, { gap: 12 });
    stroke([[400, 280], [345, 90]], 9);
    shape(potato(420, 975, 75, 40, 7, 0.1), PINK, { gap: 12, miss: 0 });
    // round body, white belly shifted left, stubby arms
    shape(potato(530, 720, 215, 240, 10, 0.05), PINK, { gap: 15, miss: 0.08 });
    shape(potato(460, 780, 105, 130, 8, 0.07), WHITE, { gap: 13, miss: 0.1 });
    shape(potato(320, 640, 50, 34, 6, 0.1), PINK, { gap: 11, miss: 0 });
    shape(potato(610, 978, 85, 44, 7, 0.1), PINK, { gap: 12, miss: 0 });
    shape(potato(730, 650, 62, 40, 6, 0.1), PINK, { gap: 11, miss: 0 });
    // the near ear
    shape(shake([[520, 300], [620, 40], [680, 60], [590, 320]], 6), PINK, { gap: 12 });
    stroke([[560, 280], [640, 80]], 9);
    // head turned left: eyes shifted left (the far one smaller), a crescent moon on the forehead
    shape(potato(480, 370, 160, 135, 9, 0.05), PINK, { gap: 14, miss: 0.04 });
    shape(potato(380, 365, 28, 38, 7, 0.04), '#ffffff', { gap: 9, w: 6, miss: 0.5 }, 5);
    dot(382, 372, 9, 13);
    shape(potato(500, 365, 36, 40, 7, 0.04), '#ffffff', { gap: 9, w: 6, miss: 0.5 }, 5);
    dot(506, 372, 12, 14);
    shape(potato(412, 430, 24, 18, 6, 0.1), RED, { gap: 7, w: 8, miss: 0 }, 4.5);
    stroke([[360, 470], [405, 486], [450, 468]], 5.5);
    const moon: P[] = [];
    for (let a = -1.2; a <= 4.3; a += 0.4) moon.push([460 + Math.cos(a) * 46, 262 + Math.sin(a) * 46]);
    for (let a = 4.0; a >= -0.9; a -= 0.45) moon.push([476 + Math.cos(a) * 34, 250 + Math.sin(a) * 34]);
    shape(moon, YEL, { gap: 8, w: 9, miss: 0 }, 5);
    // stars
    for (const [x, y, s] of [[160, 220, 1], [880, 260, 0.8], [920, 820, 0.7], [150, 860, 0.8]] as [number, number, number][]) {
      const star: P[] = [];
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = (i % 2 ? 18 : 42) * s; star.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
      shape(star, YEL, { gap: 7, w: 8, miss: 0 }, 4.5);
    }
  },
} satisfies Draft;
