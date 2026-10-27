import type { Redraw } from './crayon.ts';

/** A lime-green kitten on four stubby legs, a spiky bud growing on its back with two curly tendrils. */
export default {
  id: '001', slug: 'minousse', seed: 103, felt: true, size: [1000, 820], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const LIME = '#a6dd3f', LEAF = '#5cb52e';
    // legs behind the body
    shape([[690, 600], [760, 600], [770, 760], [700, 768]], LIME, { angle: 90 });
    shape([[400, 600], [470, 600], [462, 765], [395, 760]], LIME, { angle: 90 });
    // the body, low and long
    shape([[330, 480], [560, 455], [790, 470], [850, 560], [820, 660], [560, 680], [360, 660], [300, 570]], LIME, { angle: 85, over: 0.55 });
    // a little tail
    stroke([[845, 545], [905, 520], [930, 470]], { w: 7 });
    // front legs
    shape([[460, 620], [530, 615], [535, 780], [465, 785]], LIME, { angle: 90 });
    shape([[740, 620], [810, 615], [815, 775], [748, 780]], LIME, { angle: 90 });
    // the bud on its back: round at the bottom, pointed on top, little spikes down one side
    shape([[548, 495], [540, 405], [570, 325], [620, 262], [655, 212], [692, 268], [740, 340], [758, 425], [735, 498]], LEAF, { angle: 100, press: 1.1, over: 0.6 });
    stroke([[690, 280], [705, 300], [712, 290], [728, 330], [738, 322], [748, 365], [756, 360]], { w: 4.5 }, false);
    for (const [x, y] of [[600, 400], [660, 440], [612, 465], [670, 350]]) shape(potato(x, y, 14, 13, 7, 0.1), LIME, { over: 0 }, { w: 4.5 });
    stroke([[652, 220], [620, 140], [650, 85], [700, 95], [700, 140]]);
    stroke([[660, 222], [730, 165], [800, 180], [810, 235], [770, 250]]);
    // ears behind the head
    shape([[150, 250], [190, 60], [300, 215]], LIME, { angle: 70 }, {}, false);
    shape([[190, 220], [205, 125], [262, 215]], LEAF, { angle: 70, press: 1.1, over: 0 }, { w: 4 }, false);
    shape([[360, 210], [440, 50], [480, 260]], LIME, { angle: 70 }, {}, false);
    shape([[392, 215], [435, 120], [455, 235]], LEAF, { angle: 70, press: 1.1, over: 0 }, { w: 4 }, false);
    // a big, slightly square head
    shape([[140, 260], [300, 210], [455, 215], [500, 310], [490, 450], [425, 525], [285, 545], [175, 520], [125, 420]], LIME, { angle: 80, over: 0.55 });
    // face: round eyes, a little nose, a cat mouth, whiskers
    dot(240, 345, 22, 27);
    dot(392, 338, 22, 27);
    dot(318, 405, 10, 8);
    stroke([[258, 440], [288, 465], [318, 418], [348, 465], [380, 438]]);
    stroke([[135, 410], [200, 425]], { w: 4.5 });
    stroke([[145, 460], [205, 450]], { w: 4.5 });
    stroke([[428, 425], [498, 410]], { w: 4.5 });
    stroke([[428, 455], [493, 462]], { w: 4.5 });
  },
} satisfies Redraw;
