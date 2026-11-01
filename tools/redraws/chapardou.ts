import type { P, Redraw } from './crayon.ts';

/**
 * A little thief of a kitten sitting on its haunches, turned to the left. It keeps its violet-grey fur, its love of
 * anything shiny and the red pencil it stole; it is no longer standing like a person: a bandit's mask across its big
 * amber eyes, a ringed tail curling behind, a gold ring in one ear, tufted ears, and your favourite pencil held
 * crosswise in its mouth.
 */
export default {
  id: '054', slug: 'chapardou', seed: 5419, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const FUR = '#8a7aa6', MASK = '#3f3560', CREAM = '#f3e6c6', AMBER = '#f2b43a', GOLD = '#f2c43a', PINK = '#f29ab0';
    const PENCIL = '#e2423a', WOOD = '#f0d0a0';
    // the ringed tail curling up behind (it swishes in battle)
    c.part('queue', { pivot: [620, 800], motion: 'swing', amp: 9, period: 1.8, behind: true }, () => {
      const tail: P[] = [[600, 800], [720, 790], [810, 700], [820, 580], [770, 500], [720, 520]];
      shape(band(tail, 80, 56), FUR, { angle: 40, over: 0.3 });
      for (const [a, b] of [[[700, 800], [740, 776]], [[796, 712], [814, 660]], [[818, 590], [800, 540]]] as [P, P][]) {
        shape(band([a, b], 82, 76), MASK, { angle: 40, over: 0 }, { w: 4 });
      }
    });
    // the far ear and the far front leg
    shape([[270, 260], [220, 140], [340, 220]], FUR, { angle: 70 }, {}, false);
    shape(band([[480, 640], [490, 780], [482, 880]], 54, 48), FUR, { angle: 90 });
    shape(potato(476, 890, 44, 26, 8, 0.06), FUR, { angle: 10 });
    // the body sitting up, a cream chest, the near haunch
    shape([[400, 880], [370, 740], [390, 610], [460, 530], [580, 530], [660, 610], [690, 740], [680, 880]], FUR, { angle: 80, over: 0.5 });
    c.tint(potato(470, 650, 80, 110, 10, 0.08), CREAM, { angle: 80, wash: 0.55 });
    shape(potato(630, 780, 100, 112, 11, 0.05), FUR, { angle: 70, over: 0.3 });
    shape(potato(560, 900, 70, 30, 8, 0.06), FUR, { angle: 10 });
    // the near front leg
    shape(band([[410, 640], [400, 790], [392, 880]], 58, 52), FUR, { angle: 90 });
    shape(potato(384, 892, 48, 28, 8, 0.06), FUR, { angle: 10 });
    stroke([[366, 896], [368, 914]], { w: 3.5 });
    stroke([[392, 898], [394, 916]], { w: 3.5 });
    // the near ear with its tuft and its gold ring
    shape([[470, 250], [560, 100], [590, 290]], FUR, { angle: 70 }, {}, false);
    shape([[500, 250], [552, 156], [566, 270]], PINK, { angle: 70, over: 0 }, { w: 3.5 }, false);
    stroke([[560, 100], [572, 66]], { w: 4 });
    stroke([[560, 100], [548, 70]], { w: 4 });
    // a big round head, fluffy cheeks
    const head: P[] = [[220, 400], [230, 320], [290, 240], [390, 210], [500, 226], [580, 290], [612, 380], [596, 460], [540, 520], [440, 548], [330, 530], [250, 480]];
    shape(head, FUR, { angle: 78, over: 0.45 });
    stroke([[596, 460], [626, 476], [604, 492], [630, 512], [590, 516]], { w: 4 }, false);
    c.tint(potato(330, 470, 90, 50, 9, 0.08), CREAM, { angle: 60, wash: 0.6 });
    // the bandit's mask across the eyes
    shape([[226, 340], [300, 304], [400, 300], [500, 306], [584, 336], [570, 398], [490, 404], [420, 418], [360, 404], [280, 412], [232, 392]], MASK, { angle: 20, over: 0.3 });
    // big amber eyes inside it (the far one smaller)
    c.eye(304, 360, 32, 40, AMBER);
    c.eye(436, 356, 44, 54, AMBER);
    // the gold ring at the base of the near ear
    shape(potato(590, 300, 26, 26, 9, 0.02), GOLD, { over: 0, press: 1.2 }, { w: 4 });
    c.paper(potato(590, 300, 13, 13, 8, 0.02), { w: 3 });
    c.cheek(520, 450, 34, 20);
    // a pink nose, whiskers, and the stolen pencil held crosswise in its mouth
    dot(238, 432, 14, 10, '#e07a96');
    stroke([[160, 420], [80, 400]], { w: 3 });
    stroke([[160, 444], [76, 448]], { w: 3 });
    const pencil: P[] = [[180, 470], [380, 490], [380, 520], [180, 500]];
    shape(pencil, PENCIL, { angle: 0, over: 0 }, { w: 4 }, false);
    shape([[180, 470], [180, 500], [126, 488]], WOOD, { over: 0 }, { w: 4 }, false);
    dot(130, 488, 8, 6);
    stroke([[230, 474], [228, 506]], { w: 3 });
    stroke([[280, 478], [278, 510]], { w: 3 });
    stroke([[330, 484], [328, 514]], { w: 3 });
    // only in battle: its eyes blink
    c.part('paupieres', { pivot: [370, 358], motion: 'blink', extra: true }, () => {
      c.lid(304, 360, 32, 40, MASK);
      c.lid(436, 356, 44, 54, MASK);
    });
  },
} satisfies Redraw;
