import type { Redraw } from './crayon.ts';

/** A round pink singer: two pointy ears, a curl on top, huge shiny eyes, singing into a green microphone. */
export default {
  id: '005', slug: 'chantouille', seed: 505, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const PINK = '#f6a7c8', DEEP = '#e26fa2', GREEN = '#6cc23e', GREY = '#8a8494';
    // little feet
    shape(potato(390, 900, 70, 34, 8, 0.06), PINK, { angle: 10 });
    shape(potato(600, 900, 70, 34, 8, 0.06), PINK, { angle: 10 });
    // pointy ears
    shape([[300, 300], [300, 110], [410, 230]], PINK, { angle: 70 }, {}, false);
    shape([[320, 250], [318, 160], [370, 220]], DEEP, { over: 0 }, { w: 3.5 }, false);
    shape([[590, 230], [700, 100], [700, 290]], PINK, { angle: 110 }, {}, false);
    shape([[630, 225], [685, 160], [688, 250]], DEEP, { over: 0 }, { w: 3.5 }, false);
    // the round body
    shape(potato(500, 560, 290, 330, 14, 0.04), PINK, { angle: 80, over: 0.5 });
    // the curl on top
    stroke([[500, 240], [470, 290], [440, 330], [470, 360], [510, 340], [500, 300]], { w: 5 });
    c.tint([[455, 250], [530, 240], [520, 330], [470, 340], [445, 300]], DEEP, { gap: 3.2 });
    // a stubby arm holding the microphone
    shape(band([[720, 560], [790, 520], [830, 470]], 52, 46), PINK, { angle: 120 });
    shape(band([[820, 470], [850, 560]], 26, 20), GREY, { angle: 90, over: 0 });
    shape(potato(815, 440, 40, 40, 9, 0.05), GREEN, { angle: 60, press: 1.1 });
    shape(band([[290, 580], [220, 620], [200, 680]], 52, 46), PINK, { angle: 40 });
    // huge eyes with shine, a singing mouth
    shape(potato(395, 480, 80, 95, 11, 0.04), '#ffffff', { over: 0, press: 0.3 }, { w: 5 });
    shape(potato(610, 470, 80, 95, 11, 0.04), '#ffffff', { over: 0, press: 0.3 }, { w: 5 });
    shape(potato(410, 500, 42, 55, 9, 0.04), '#3e6fd0', { angle: 90, over: 0, press: 1.2 }, { w: 4 });
    shape(potato(595, 490, 42, 55, 9, 0.04), '#3e6fd0', { angle: 90, over: 0, press: 1.2 }, { w: 4 });
    dot(398, 480, 12, 15, '#ffffff');
    dot(583, 470, 12, 15, '#ffffff');
    // singing: a wide open mouth
    shape([[440, 640], [570, 635], [555, 700], [505, 730], [455, 700]], '#d9384a', { angle: 0, over: 0 }, { w: 4.5 });
    shape([[470, 700], [540, 698], [505, 726]], '#f39ab0', { over: 0 }, { w: 0.1 });
  },
} satisfies Redraw;
