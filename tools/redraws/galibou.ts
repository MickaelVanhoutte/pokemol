import type { P, Redraw } from './crayon.ts';

/**
 * A little owl painted on a round pebble, as children paint the stones they pick up, turned to the left: big
 * painted eyes ringed with orange, painted ear tufts, a coral front covered in painted feathers and dots, a teal
 * wing it flutters (it would love to fly, but it's a stone), the varnish still shining.
 */
export default {
  id: '107', slug: 'galibou', seed: 10733, size: [1000, 1000], tilt: -3,
  draw(c) {
    const { shape, paper, stroke, dot, potato, rnd } = c;
    const STONE = '#aaa69e', SPECK = '#7d7a74', CORAL = '#f4a582', CREAMY = '#f6dcae', TEAL = '#3fa7a0', ORANGE = '#f08a2c', TUFT = '#7a5236';
    // the pebble, rounder at the bottom
    const pebble: P[] = [[480, 260], [610, 285], [700, 380], [740, 540], [720, 700], [640, 820], [500, 860], [360, 830], [280, 720], [262, 560], [300, 390], [380, 290]];
    shape(pebble, STONE, { angle: 70, over: 0.4 });
    for (let k = 0; k < 40; k++) {
      const x = 300 + rnd() * 420, y = 300 + rnd() * 540;
      if (((x - 500) / 230) ** 2 + ((y - 560) / 280) ** 2 < 0.85) dot(x, y, 2.5 + rnd() * 2, 2 + rnd() * 2, SPECK);
    }
    // its painted front: coral, rows of painted feathers, a ring of dots
    shape(potato(450, 650, 150, 165, 11, 0.04), CORAL, { angle: 20, over: 0.3 });
    shape(potato(440, 680, 100, 115, 10, 0.04), CREAMY, { angle: 0, over: 0.2 });
    for (let r = 0; r < 3; r++) {
      for (let k = 0; k < 3; k++) {
        const x = 395 + k * 46 + (r % 2) * 23, y = 620 + r * 48;
        stroke([[x - 18, y - 8], [x - 10, y + 10], [x, y + 16], [x + 10, y + 10], [x + 18, y - 8]], { w: 5, col: r % 2 ? TEAL : ORANGE });
      }
    }
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      dot(450 + Math.cos(a) * 168, 650 + Math.sin(a) * 182, 7, 7, ['#ffffff', TEAL, ORANGE][k % 3]);
    }
    // the far wing, painted on the edge of the stone
    shape([[300, 520], [272, 610], [296, 700], [330, 610]], TEAL, { angle: 80, over: 0 });
    // painted ear tufts
    shape([[350, 345], [330, 270], [410, 330]], TUFT, { over: 0 }, { w: 3.5 }, false);
    shape([[540, 320], [580, 245], [610, 335]], TUFT, { over: 0 }, { w: 3.5 }, false);
    // big painted eyes ringed with orange, the far one smaller
    for (const [x, y, r] of [[390, 435, 60], [530, 420, 74]] as const) {
      shape(potato(x, y, r, r, 12, 0.02), ORANGE, { over: 0, press: 1.1 });
      paper(potato(x, y, r * 0.72, r * 0.72, 12, 0.02));
      dot(x - r * 0.12, y + r * 0.06, r * 0.4, r * 0.42);
      dot(x - r * 0.24, y - r * 0.14, r * 0.13, r * 0.13, '#ffffff');
    }
    // a little painted beak
    shape([[440, 482], [492, 478], [458, 540]], ORANGE, { over: 0 }, { w: 3.5 }, false);
    // painted feet at the bottom
    for (const x of [410, 520]) stroke([[x - 22, 830], [x, 800], [x + 22, 830], [x, 800], [x, 836]], { w: 6, col: ORANGE }, false);
    // the varnish shining
    stroke([[640, 360], [680, 420], [700, 490]], { w: 9, col: '#ffffff' });
    stroke([[660, 530], [668, 560]], { w: 7, col: '#ffffff' });
    // the near wing, painted teal with white dots: in battle it flutters
    c.part('aile-peinte', { pivot: [620, 500], motion: 'nod', amp: -12, period: 0.9 }, () => {
      shape([[612, 480], [700, 530], [725, 650], [670, 760], [600, 700], [590, 580]], TEAL, { angle: 80, over: 0.3 });
      for (const [x, y] of [[650, 560], [680, 620], [650, 680], [620, 610]] as const) dot(x, y, 7, 7, '#ffffff');
    });
    // only in battle: its painted eyes blink
    c.part('paupiere', { pivot: [460, 430], motion: 'blink', extra: true }, () => {
      for (const [x, y, r] of [[390, 435, 60], [530, 420, 74]] as const) {
        shape(potato(x, y, r * 1.02, r * 1.02, 12, 0.02), STONE, { over: 0, wash: 1 });
        stroke([[x - r * 0.8, y + 4], [x - r * 0.3, y + r * 0.35], [x + r * 0.3, y + r * 0.35], [x + r * 0.8, y + 4]], { w: 6, col: ORANGE });
      }
    });
  },
} satisfies Redraw;
