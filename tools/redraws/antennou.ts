import type { P, Redraw } from './crayon.ts';

/**
 * A little fluffy lemur sitting up, turned to the left: silver-grey fur that stands on end and crackles with static,
 * huge round amber eyes, a pale face, and its ringed tail raised straight up behind it like a radio antenna, a silver
 * ball at the tip. It listens to the storms on it.
 */
export default {
  id: '035', slug: 'antennou', seed: 3511, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const FUR = '#b4bac6', DEEP = '#8a92a2', FACE = '#eef0f4', RING = '#4e5464', SILVER = '#dfe4ec', AMBER = '#f2a93a', SPARK = '#ffe34a';
    // the antenna tail standing straight up behind, ringed, a silver ball at the tip (it sways in battle)
    c.part('antenne', { pivot: [620, 720], motion: 'swing', amp: 5, period: 2, behind: true }, () => {
      const tail: P[] = [[620, 720], [700, 600], [730, 420], [720, 240], [700, 140]];
      shape(band(tail, 56, 36), FUR, { angle: 80 });
      for (const [a, b] of [[[686, 620], [708, 580]], [[728, 470], [732, 420]], [[726, 320], [722, 270]], [[712, 196], [706, 166]]] as [P, P][]) shape(band([a, b], 58, 50), RING, { angle: 80, over: 0 }, { w: 4 });
      shape(potato(698, 110, 40, 40, 10, 0.03), SILVER, { press: 1.1 });
      dot(686, 98, 8, 10, '#ffffff');
    });
    // only in battle: a spark crackling at the tip
    c.part('etincelle', { pivot: [700, 110], motion: 'flicker', extra: true }, () => {
      shape([[730, 40], [760, 80], [742, 84], [770, 130], [726, 88], [744, 84]], SPARK, { over: 0 }, { w: 3.5 }, false);
    });
    // the far foot
    shape(potato(600, 870, 60, 34, 8, 0.06), DEEP, { angle: 10 });
    // the round fluffy body, its fur standing on end with static
    const body: P[] = spikes([[420, 860], [360, 760], [370, 620], [440, 540], [560, 530], [650, 600], [680, 720], [650, 860]], 2, 22);
    shape(body, FUR, { angle: 80, over: 0.3 }, {}, false);
    c.tint(potato(500, 720, 90, 110, 10, 0.06), FACE, { angle: 80, wash: 0.6 });
    shape(potato(450, 880, 64, 34, 8, 0.06), FUR, { angle: 10 });
    // round ears, the head with its fluffy crackling edge, a pale face
    shape(potato(300, 260, 56, 54, 9, 0.05), DEEP, { angle: 60 });
    shape(potato(560, 250, 66, 62, 9, 0.05), FUR, { angle: 60 });
    c.tint(potato(560, 254, 34, 32, 8, 0.05), '#f2b4c4', { wash: 0.6 });
    const head: P[] = spikes([[240, 440], [260, 330], [330, 260], [440, 240], [550, 270], [600, 350], [600, 460], [540, 540], [420, 560], [300, 530]], 2, 18);
    shape(head, FUR, { angle: 78, over: 0.3 }, {}, false);
    c.tint(potato(380, 420, 140, 110, 12, 0.04), FACE, { angle: 60, wash: 0.8 });
    // huge round amber eyes, a little dark nose, a small smile
    c.eye(320, 390, 44, 46, AMBER);
    c.eye(450, 384, 56, 58, AMBER);
    c.cheek(520, 470, 28, 16);
    dot(276, 470, 14, 10);
    stroke([[268, 496], [290, 508], [314, 498]], { w: 4.5 });
    c.part('paupieres', { pivot: [384, 386], motion: 'blink', extra: true }, () => {
      c.lid(320, 390, 44, 46, FACE);
      c.lid(450, 384, 56, 58, FACE);
    });
  },
} satisfies Redraw;
