import type { Redraw } from './crayon.ts';

/** A big, round pink moon bunny: long ears, a curl on its head, a white tummy with a crescent moon. */
export default {
  id: '006', slug: 'lunelle', seed: 607, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const PINK = '#f28fb8', DEEP = '#d95b93', MOON = '#f7dd5a';
    // long ears behind
    shape([[350, 330], [250, 130], [270, 40], [370, 100], [440, 300]], PINK, { angle: 80 });
    shape([[330, 260], [295, 130], [335, 110], [385, 240]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    shape([[560, 300], [640, 100], [740, 40], [750, 140], [650, 330]], PINK, { angle: 75 });
    shape([[590, 270], [660, 135], [700, 130], [630, 280]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 });
    // stubby feet
    shape(potato(360, 905, 95, 45, 8, 0.06), PINK, { angle: 10 });
    shape(potato(640, 905, 95, 45, 8, 0.06), PINK, { angle: 10 });
    // one big round body (head and tummy all in one)
    shape(potato(500, 560, 330, 350, 16, 0.03), PINK, { angle: 82, over: 0.6 });
    c.paper(potato(500, 720, 175, 150, 12, 0.04));
    const moon: [number, number][] = [];
    for (let i = 0; i <= 10; i++) { const a = -1.9 + (i / 10) * 3.8; moon.push([505 + Math.cos(a) * 58, 720 + Math.sin(a) * 58]); }
    for (let i = 10; i >= 0; i--) { const a = -1.5 + (i / 10) * 3; moon.push([480 + Math.cos(a) * 46, 720 + Math.sin(a) * 50]); }
    shape(moon, MOON, { angle: 80, over: 0 }, { w: 3.5 });
    // stubby arms
    shape(band([[185, 560], [120, 600], [100, 660]], 70, 62), PINK, { angle: 40 });
    shape(band([[815, 560], [880, 600], [900, 660]], 70, 62), PINK, { angle: 140 });
    // the curl on top
    stroke([[500, 215], [470, 160], [500, 110], [550, 125], [545, 170], [510, 175]], { w: 5.5 });
    // big round eyes, an open happy mouth, cheeks
    c.paper(potato(400, 440, 62, 72, 10, 0.04));
    c.paper(potato(600, 440, 62, 72, 10, 0.04));
    shape(potato(410, 455, 34, 44, 9, 0.04), '#3e6fd0', { angle: 90, over: 0, press: 1.2 }, { w: 3.5 });
    shape(potato(590, 455, 34, 44, 9, 0.04), '#3e6fd0', { angle: 90, over: 0, press: 1.2 }, { w: 3.5 });
    dot(400, 440, 11, 14, '#ffffff');
    dot(580, 440, 11, 14, '#ffffff');
    shape([[455, 545], [545, 545], [530, 590], [500, 605], [470, 590]], '#d9384a', { over: 0 }, { w: 4 });
    shape(potato(320, 530, 34, 20, 7, 0.1), DEEP, { over: 0 }, { w: 0.1 });
    shape(potato(680, 530, 34, 20, 7, 0.1), DEEP, { over: 0 }, { w: 0.1 });
  },
} satisfies Redraw;
