import type { Draft } from './kid.ts';

/** A rocky pterosaur in flight: huge wings, long toothy beak, a crest, stone spots. Faces left. */
export default {
  id: '050', slug: 'pterocaille', seed: 21, layered: true, size: [1250, 1000], tilt: -4, pivot: [620, 500],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot, bumps } = k;
    const ROCK = '#8a83a6', WING = '#b3aac8', DARK = '#5e577a';
    // far wing, up and back
    shape([[600, 450], [760, 160], [1000, 60], ...bumps([[1000, 60], [960, 260], [820, 380], [660, 500]], 1, 45)], WING, { gap: 14, miss: 0.08 });
    stroke([[600, 450], [760, 160], [1000, 60]], 9);
    // tail and legs
    shape(shake([[760, 580], [960, 640], [1100, 620], [1110, 660], [950, 690], [750, 640]], 8), ROCK, { gap: 12 });
    for (const x of [640, 720]) {
      stroke([[x, 640], [x + 20, 760]], 8);
      for (const dx of [-25, 0, 25]) stroke([[x + 20, 760], [x + 20 + dx + j(6), 800]], 6);
    }
    // body
    shape(potato(620, 560, 200, 110, 9, 0.05), ROCK, { gap: 14, miss: 0.04, angle: -30 });
    for (const [x, y, r] of [[560, 520, 20], [680, 580, 16], [620, 610, 14], [720, 520, 18]]) shape(potato(x, y, r, r * 0.8, 6, 0.15), DARK, { gap: 7, w: 8, miss: 0 }, 4);
    // near wing, spread down and forward
    shape([[560, 520], [380, 280], [120, 200], ...bumps([[120, 200], [170, 420], [330, 560], [560, 600]], 1, -45)], WING, { gap: 14, miss: 0.08 });
    stroke([[560, 520], [380, 280], [120, 200]], 9);
    for (const t of [0.35, 0.7]) stroke([[380 + (120 - 380) * t, 280 + (200 - 280) * t], [400 - t * 120, 520]], 4.5);
    // head: long beak with teeth, a crest, a fierce eye
    shape(shake([[470, 400], [380, 330], [300, 300], [520, 330]], 6), DARK, { gap: 10, w: 10, miss: 0 }, 5.5);
    shape(shake([[520, 430], [440, 380], [300, 400], [110, 450], [300, 470], [470, 480]], 8), ROCK, { gap: 13, miss: 0.03 });
    stroke([[130, 448], [300, 440], [460, 445]], 5);
    k.raw(`<path d='M180 452 L190 470 L200 452 Z M240 450 L250 470 L262 449 Z M300 448 L310 468 L322 447 Z' fill='#fff' stroke='#2e2a35' stroke-width='4' stroke-linejoin='round'/>`);
    dot(445, 405, 10, 12);
    stroke([[410, 380], [480, 395]], 8);
  },
} satisfies Draft;
