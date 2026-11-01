import type { P, Redraw } from './crayon.ts';

/**
 * A little lime-green kitten sitting up, turned to the left, drawn after her drawing: a big rounded-square head, wider
 * than tall, a « w » smile, and on its back a tall jagged leaf with a curly tendril, which grows a little each time it
 * purrs. Big shiny eyes, a pale chest, a pink nose.
 */
export default {
  id: '001', slug: 'minousse', seed: 1077, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const LIME = '#a6dd3f', DEEP = '#86c02e', LEAF = '#4fa83a', PALE = '#f0f7d6', PINK = '#f29ab0';
    // the tail curling up behind (it swishes in battle)
    c.part('queue', { pivot: [620, 800], motion: 'swing', amp: 9, period: 1.8, behind: true }, () => {
      shape(band([[600, 800], [720, 790], [800, 710], [810, 610], [770, 560]], 70, 50), LIME, { angle: 40, over: 0.3 });
    });
    // the leaf on its back, tall and jagged, a curly tendril beside it (it sways in battle, from the top of its stem)
    c.part('feuille', { pivot: [684, 500], motion: 'swing', amp: 7, period: 2.4, behind: true }, () => {
      stroke([[686, 520], [740, 470], [800, 440], [830, 470], [810, 500], [784, 480]], { w: 7, col: LEAF });
      // a wide leaf with jagged edges and a middle vein
      const left = spikes([[684, 500], [620, 430], [610, 330], [650, 250], [720, 200]], 2, 18);
      const right = spikes([[684, 500], [760, 440], [790, 340], [770, 260], [720, 200]], 2, -18);
      shape([...left, ...right.reverse()], LEAF, { angle: 80, over: 0.3 }, {}, false);
      stroke([[684, 500], [700, 360], [716, 220]], { w: 4, col: '#3a8a2c' });
      for (const [a, b] of [[[694, 420], [650, 370]], [[698, 380], [750, 330]], [[704, 320], [670, 270]]] as [P, P][]) stroke([a, b], { w: 3, col: '#3a8a2c' });
    });
    // the far front leg
    shape(band([[480, 640], [490, 780], [482, 880]], 54, 48), DEEP, { angle: 90 });
    shape(potato(476, 890, 44, 26, 8, 0.06), DEEP, { angle: 10 });
    // the body sitting up, a pale chest, the near haunch
    shape([[400, 880], [370, 740], [390, 610], [460, 530], [580, 530], [660, 610], [690, 740], [680, 880]], LIME, { angle: 80, over: 0.5 });
    c.tint(potato(470, 650, 80, 110, 10, 0.08), PALE, { angle: 80, wash: 0.65 });
    shape(potato(630, 780, 100, 112, 11, 0.05), LIME, { angle: 70, over: 0.3 });
    shape(potato(560, 900, 70, 30, 8, 0.06), LIME, { angle: 10 });
    // the leaf's stem grows out of its back: rooted in the fur, thick at the root, a little tuft round it
    shape(band([[600, 616], [622, 580], [654, 540], [686, 504]], 26, 10), LEAF, { angle: 60 });
    shape([[566, 630], [590, 606], [604, 590], [618, 604], [642, 628], [604, 620]], LEAF, { angle: 20 });
    for (const [a, b] of [[[580, 606], [566, 584]], [[624, 620], [646, 606]]] as [P, P][]) stroke([a, b], { w: 4 });
    // the near front leg
    shape(band([[410, 640], [400, 790], [392, 880]], 58, 52), LIME, { angle: 90 });
    shape(potato(384, 892, 48, 28, 8, 0.06), LIME, { angle: 10 });
    stroke([[366, 896], [368, 914]], { w: 3.5 });
    stroke([[392, 898], [394, 916]], { w: 3.5 });
    // rounded ears, like her drawing
    shape([[250, 290], [250, 170], [300, 140], [340, 170], [350, 270]], DEEP, { angle: 70 });
    shape([[450, 270], [470, 150], [530, 130], [570, 170], [570, 290]], LIME, { angle: 70 });
    c.tint([[480, 260], [492, 180], [530, 168], [548, 196], [548, 270]], PINK, { wash: 0.55 });
    // the big rounded-square head, wider than tall
    const head: P[] = [[200, 330], [230, 260], [320, 236], [460, 236], [570, 256], [610, 320], [612, 430], [580, 500], [480, 530], [330, 530], [230, 500], [196, 430]];
    shape(head, LIME, { angle: 78, over: 0.45 });
    c.tint(potato(330, 460, 96, 52, 9, 0.08), PALE, { angle: 60, wash: 0.7 });
    // big shiny eyes, a pink nose, her « w » smile, whiskers, cheeks
    c.eye(300, 380, 34, 44);
    c.eye(430, 374, 44, 56);
    c.cheek(520, 460, 32, 18);
    dot(330, 440, 13, 10, '#e07a96');
    stroke([[270, 470], [300, 500], [330, 458], [360, 500], [390, 470]], { w: 5 }, false);
    stroke([[230, 450], [150, 438]], { w: 3 });
    stroke([[230, 470], [152, 478]], { w: 3 });
    c.part('paupieres', { pivot: [366, 376], motion: 'blink', extra: true }, () => {
      c.lid(300, 380, 34, 44, LIME);
      c.lid(430, 374, 44, 56, LIME);
    });
  },
} satisfies Redraw;
