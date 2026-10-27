import type { Redraw } from './crayon.ts';

/** A slim little brown bird singing on its twig legs: yellow chest and face, a black stripe through the eye, a tuft on its head. */
export default {
  id: '013', slug: 'piafou', seed: 1314, size: [900, 1000], tilt: 4,
  draw(c) {
    const { shape, stroke, dot } = c;
    const BROWN = '#9a5a2c', YELLOW = '#f6d23a', ORANGE = '#f28a2a';
    // twig legs
    stroke([[420, 700], [410, 880], [370, 930]], { w: 5.5 });
    stroke([[410, 880], [445, 930]], { w: 4.5 });
    stroke([[500, 700], [520, 880], [480, 930]], { w: 5.5 });
    stroke([[520, 880], [560, 930]], { w: 4.5 });
    // long tail feathers
    shape([[330, 640], [160, 760], [185, 790], [120, 840], [210, 830], [200, 880], [360, 730]], BROWN, { angle: 40, press: 1.1 }, {}, false);
    // a slim body leaning forward: brown back, yellow chest
    shape([[330, 420], [420, 340], [560, 360], [600, 470], [580, 620], [500, 720], [380, 730], [310, 640]], BROWN, { angle: 60, over: 0.6, press: 1.1 });
    shape([[480, 380], [590, 400], [615, 520], [575, 660], [500, 715], [450, 600]], YELLOW, { angle: 80, over: 0.4 });
    // the folded wing (it flutters in battle)
    c.part('aile', { pivot: [430, 460], motion: 'flap', amp: 22, period: 0.4 }, () => {
      shape([[330, 470], [430, 450], [470, 560], [420, 680], [340, 650]], BROWN, { angle: 30, press: 1.25, over: 0.3 });
      for (const [x, y] of [[350, 540], [360, 600]]) stroke([[x, y], [x + 70, y - 15]], { w: 3.5 });
    });
    // the head, a tuft, the beak open to sing
    shape([[440, 240], [520, 190], [620, 210], [670, 290], [640, 380], [540, 410], [450, 370], [425, 300]], YELLOW, { angle: 80, over: 0.45 });
    shape([[470, 210], [450, 120], [500, 160], [510, 95], [545, 170], [530, 205]], BROWN, { angle: 80, press: 1.1, over: 0 }, {}, false);
    shape([[450, 290], [540, 262], [660, 280], [660, 304], [545, 296], [455, 318]], '#3a3440', { angle: 0, over: 0 }, { w: 3.5 });
    c.paper(c.potato(570, 283, 28, 32, 9, 0.04));
    dot(575, 286, 14, 18);
    shape([[660, 290], [770, 262], [672, 320]], ORANGE, { angle: 0, over: 0 }, {}, false);
    shape([[664, 335], [760, 360], [655, 362]], ORANGE, { angle: 0, over: 0 }, {}, false);
  },
} satisfies Redraw;
