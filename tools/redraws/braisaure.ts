import type { Redraw } from './crayon.ts';

/** Braisou grown into an orange lizard: striding, claws out, a cream belly, a big flame on its tail. */
export default {
  id: '021', slug: 'braisaure', seed: 221, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, spikes } = c;
    const ORANGE = '#f28a2e', CREAM = '#fbe2a6', RED = '#ea3f22', YELLOW = '#f8d23c', BLUE = '#3f74d8';
    // the tail sweeping back and up, a big flame on it
    shape(band([[560, 700], [700, 760], [820, 720], [880, 610]], 80, 40), ORANGE, { angle: 30 });
    shape([[850, 640], [820, 520], [860, 420], [880, 300], [930, 400], [970, 340], [975, 470], [940, 600]], RED, { angle: 95, press: 1.15 }, {}, false);
    shape([[870, 610], [865, 520], [895, 450], [915, 530], [935, 480], [925, 590]], YELLOW, { angle: 95, over: 0 }, { w: 3.5 }, false);
    // legs, one striding forward, claws
    shape(band([[480, 720], [430, 830], [380, 920]], 92, 70), ORANGE, { angle: 70 });
    shape(band([[600, 720], [640, 830], [680, 920]], 92, 70), ORANGE, { angle: 100 });
    for (const [x, y, d] of [[340, 935, -1], [720, 935, 1]]) stroke([[x, y], [x + d * 22, y + 22]], { w: 4 });
    // the body, cream belly
    shape([[420, 380], [560, 360], [650, 470], [670, 640], [620, 760], [470, 770], [400, 650], [390, 490]], ORANGE, { angle: 80, over: 0.55 });
    shape([[450, 470], [550, 450], [600, 560], [590, 700], [510, 740], [450, 680], [430, 560]], CREAM, { angle: 80, over: 0 });
    // arms, claws out
    shape(band([[430, 470], [330, 520], [250, 500]], 58, 48), ORANGE, { angle: 20 });
    shape(spikes([[250, 470], [200, 450], [215, 520], [255, 530]], 1, 20), ORANGE, { angle: 20, over: 0 }, {}, false);
    shape(band([[620, 470], [700, 400], [740, 320]], 58, 48), ORANGE, { angle: 120 });
    shape(spikes([[720, 330], [740, 260], [790, 290], [770, 340]], 1, 18), ORANGE, { angle: 120, over: 0 }, {}, false);
    // the head: a long snout, a horn at the back, a blue eye
    shape([[400, 260], [470, 170], [520, 120], [540, 200], [580, 260], [570, 360], [480, 400], [330, 380], [250, 350], [240, 300], [320, 280]], ORANGE, { angle: 70, over: 0.5 });
    shape([[440, 260], [490, 240], [500, 285], [455, 300]], '#ffffff', { over: 0, press: 0.5 }, { w: 3.5 });
    shape([[462, 252], [488, 248], [490, 288], [466, 292]], BLUE, { angle: 90, over: 0, press: 1.2 }, { w: 3 });
    dot(262, 320, 7, 6);
    stroke([[255, 345], [330, 352], [400, 340]]);
  },
} satisfies Redraw;
