import type { Draft } from './kid.ts';

/** Rocailloux's evolution: a giant round boulder of rock plates, head and stubby limbs poking out. */
export default {
  id: '040', slug: 'montagnoc', seed: 21, layered: true, size: [1200, 1100], tilt: -3, pivot: [600, 560],
  draw(k) {
    const { potato, shake, shape, stroke, dot } = k;
    const ROCK = '#8a7f72', BODY = '#b08a62', DARK = '#5e564d';
    // stubby legs and arms
    for (const [x, y] of [[400, 950], [780, 950]]) shape(potato(x, y, 100, 70, 7, 0.08), BODY, { gap: 12, miss: 0 });
    shape(shake([[250, 620], [140, 600], [100, 680], [160, 740], [260, 720]], 8), BODY, { gap: 12, miss: 0 });
    shape(shake([[950, 620], [1060, 600], [1100, 680], [1040, 740], [940, 720]], 8), BODY, { gap: 12, miss: 0 });
    for (const [x, y, d] of [[110, 690, -1], [1090, 690, 1]] as [number, number, number][]) {
      for (const dy of [-30, 0, 30]) stroke([[x, y + dy], [x + d * 40, y + dy * 1.3]], 6);
    }
    // the shell: a big round boulder covered in plates
    shape(potato(600, 600, 370, 330, 12, 0.05), ROCK, { gap: 17, miss: 0.05 });
    for (const [x, y, rx, ry] of [[470, 430, 110, 80], [700, 420, 110, 85], [380, 620, 90, 100], [600, 600, 120, 95], [820, 610, 95, 105], [480, 800, 110, 75], [720, 800, 110, 75]]) {
      shape(potato(x, y, rx, ry, 7, 0.12), ROCK, { gap: 14, miss: 0.1 }, 5.5);
    }
    for (const [x, y] of [[560, 700], [650, 500], [420, 520], [790, 720]]) shape(potato(x, y, 20, 16, 6, 0.15), DARK, { gap: 7, w: 8, miss: 0 }, 4);
    // the head poking out at the front
    shape(potato(600, 360, 140, 115, 8, 0.05), BODY, { gap: 13, miss: 0.04 });
    stroke([[520, 335], [585, 362]], 10);
    stroke([[620, 362], [685, 335]], 10);
    dot(553, 385, 11, 13);
    dot(650, 385, 11, 13);
    stroke([[545, 430], [600, 412], [660, 432]], 7);
    k.raw(`<path d='M558 430 L566 446 L576 425 Z M622 425 L632 446 L642 431 Z' fill='#fff' stroke='#2e2a35' stroke-width='4' stroke-linejoin='round'/>`);
  },
} satisfies Draft;
