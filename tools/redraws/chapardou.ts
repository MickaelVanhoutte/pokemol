import type { Redraw } from './crayon.ts';

/** A sneaky alley cat standing on its hind legs, turned to the left: violet-grey fur, a gold coin on its brow, a stolen pencil. */
export default {
  id: '054', slug: 'chapardou', seed: 5401, size: [1000, 1000], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const FUR = '#8a7aa6', CREAM = '#f3e6c6', GOLD = '#f2c43a', PINK = '#f29ab0', PENCIL = '#e2423a';
    // the curly tail behind, the far leg and far ear
    c.part('queue', { pivot: [605, 760], motion: 'swing', amp: 8, period: 1.7, behind: true }, () => {
      shape(band([[600, 760], [740, 760], [820, 660], [800, 560], [740, 560]], 46, 30), FUR, { angle: 40 });
    });
    shape(band([[440, 760], [420, 860], [400, 930]], 62, 56), CREAM, { angle: 90 });
    shape([[320, 300], [250, 130], [390, 260]], FUR, { angle: 70 }, {}, false);
    // the body and its cream belly
    shape([[390, 520], [520, 490], [630, 540], [650, 700], [600, 800], [430, 800], [370, 690]], FUR, { angle: 85, over: 0.5 });
    shape(potato(470, 680, 85, 105, 10, 0.05), CREAM, { over: 0 });
    // the near leg, the near arm hiding a stolen pencil behind its back
    shape(band([[560, 780], [580, 870], [590, 935]], 66, 60), CREAM, { angle: 90 });
    shape(band([[620, 560], [690, 640], [700, 720]], 52, 46), FUR, { angle: 100 });
    shape(band([[710, 760], [790, 600]], 26, 22), PENCIL, { angle: 60, over: 0 });
    shape([[790, 600], [820, 545], [808, 610]], '#f3d6a8', { over: 0 }, { w: 3 }, false);
    // the near ear
    shape([[450, 260], [560, 110], [550, 300]], FUR, { angle: 110 }, {}, false);
    shape([[480, 250], [545, 160], [540, 270]], PINK, { over: 0 }, { w: 3 }, false);
    // the head turned left, a gold coin on the brow, a sly smile
    shape([[250, 380], [300, 280], [430, 240], [560, 290], [590, 390], [540, 470], [420, 500], [310, 480], [230, 430]], FUR, { angle: 80, over: 0.5 });
    shape(potato(330, 410, 70, 55, 10, 0.06), CREAM, { over: 0 });
    shape(potato(420, 280, 34, 34, 10, 0.04), GOLD, { over: 0, press: 1.1 }, { w: 3.5 });
    c.paper(potato(320, 360, 20, 22, 8, 0.05));
    c.paper(potato(450, 355, 30, 26, 8, 0.05));
    dot(316, 366, 8, 11);
    dot(446, 362, 10, 13);
    stroke([[300, 340], [340, 330]], { w: 4.5 });
    stroke([[420, 330], [480, 336]], { w: 5 });
    dot(245, 405, 9, 7);
    stroke([[260, 440], [310, 455], [360, 440], [380, 425]], { w: 4.5 });
    stroke([[230, 420], [160, 405]], { w: 3.5 });
    stroke([[235, 440], [165, 455]], { w: 3.5 });
  },
} satisfies Redraw;
