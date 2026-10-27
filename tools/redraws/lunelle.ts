import type { Redraw } from './crayon.ts';

/** A big, round pink moon bunny, three-quarters to the left: long ears, a curl, a white tummy with a crescent moon. */
export default {
  id: '006', slug: 'lunelle', seed: 608, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const PINK = '#f28fb8', DEEP = '#d95b93', MOON = '#f7dd5a';
    // the far ear and far foot, behind
    shape([[330, 320], [220, 140], [230, 50], [330, 110], [410, 300]], PINK, { angle: 80 });
    shape([[310, 255], [262, 135], [300, 115], [355, 245]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    shape(potato(640, 900, 90, 42, 8, 0.06), PINK, { angle: 10 });
    shape(band([[820, 560], [880, 610], [890, 670]], 66, 58), PINK, { angle: 140 });
    // one big round body, turned left
    shape(potato(520, 560, 330, 350, 16, 0.03), PINK, { angle: 82, over: 0.6 });
    c.paper(potato(440, 720, 160, 150, 12, 0.04));
    const moon: [number, number][] = [];
    for (let i = 0; i <= 10; i++) { const a = -1.9 + (i / 10) * 3.8; moon.push([445 + Math.cos(a) * 56, 720 + Math.sin(a) * 56]); }
    for (let i = 10; i >= 0; i--) { const a = -1.5 + (i / 10) * 3; moon.push([421 + Math.cos(a) * 44, 720 + Math.sin(a) * 48]); }
    shape(moon, MOON, { angle: 80, over: 0 }, { w: 3.5 });
    shape(potato(360, 905, 96, 44, 8, 0.06), PINK, { angle: 10 });
    // the near ear
    shape([[520, 290], [600, 90], [700, 30], [710, 130], [610, 320]], PINK, { angle: 75 });
    shape([[550, 260], [620, 125], [660, 120], [595, 270]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    // the near arm, waving
    c.part('bras', { pivot: [235, 565], motion: 'swing', amp: 14, period: 1.6 }, () => {
      shape(band([[230, 560], [160, 520], [120, 450]], 66, 58), PINK, { angle: 60 });
    });
    // the curl
    stroke([[460, 215], [430, 160], [460, 110], [510, 125], [505, 170], [470, 175]], { w: 5.5 });
    // eyes shifted left (the far one smaller), a closed smile, a cheek
    c.paper(potato(300, 440, 44, 66, 10, 0.04));
    c.paper(potato(475, 440, 60, 72, 10, 0.04));
    shape(potato(295, 455, 24, 42, 9, 0.04), '#3e6fd0', { angle: 90, over: 0, press: 1.2 }, { w: 3.5 });
    shape(potato(462, 455, 34, 44, 9, 0.04), '#3e6fd0', { angle: 90, over: 0, press: 1.2 }, { w: 3.5 });
    dot(288, 440, 7, 11, '#ffffff');
    dot(452, 440, 11, 14, '#ffffff');
    stroke([[300, 560], [360, 590], [430, 570]], { w: 5 });
    shape(potato(560, 530, 36, 22, 7, 0.1), DEEP, { over: 0 }, { w: 0.1 });
  },
} satisfies Redraw;
