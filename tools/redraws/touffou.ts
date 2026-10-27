import type { Redraw } from './crayon.ts';

/** A scruffy brown fox-pup: huge ears, a fluffy cream collar of fur, a bushy tail with a cream tip. */
export default {
  id: '016', slug: 'touffou', seed: 1616, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, spikes, potato } = c;
    const BROWN = '#b2733a', DEEP = '#7c4a22', CREAM = '#f4e2b4';
    // the bushy tail, waving
    shape([[650, 600], [760, 520], [840, 400], [900, 300], [930, 380], [900, 480], [830, 590], [720, 660]], BROWN, { angle: 50, press: 1.05 });
    shape(spikes([[880, 330], [905, 280], [935, 350]], 2, 18).concat([[915, 400]]), CREAM, { over: 0 }, {}, false);
    // four stick legs
    for (const [x0, x1] of [[350, 330], [440, 450], [580, 600], [660, 690]]) shape(band([[x0, 680], [(x0 + x1) / 2, 800], [x1, 900]], 54, 48), BROWN, { angle: 90 });
    // the body
    shape([[320, 560], [480, 520], [680, 540], [730, 620], [690, 720], [360, 720], [300, 640]], BROWN, { angle: 80, over: 0.5 });
    // the fluffy collar
    c.paper(spikes([[240, 420], [300, 600], [450, 650], [520, 520], [470, 400]], 3, 40).concat([[360, 380]]), {}, false);
    // huge ears with dark insides
    shape([[220, 260], [140, 50], [330, 200]], BROWN, { angle: 70 }, {}, false);
    shape([[200, 210], [165, 105], [280, 195]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 }, false);
    shape([[420, 190], [560, 40], [520, 270]], BROWN, { angle: 110 }, {}, false);
    shape([[450, 195], [535, 95], [510, 230]], DEEP, { over: 0, press: 0.9 }, { w: 3.5 }, false);
    // the head
    shape(potato(350, 320, 150, 125, 12, 0.05), BROWN, { angle: 80, over: 0.5 });
    c.paper(potato(300, 300, 32, 38, 9, 0.04));
    c.paper(potato(410, 295, 32, 38, 9, 0.04));
    dot(305, 308, 18, 23);
    dot(405, 303, 18, 23);
    dot(300, 296, 6, 7, '#ffffff');
    dot(400, 291, 6, 7, '#ffffff');
    dot(355, 360, 12, 9);
    stroke([[320, 395], [355, 410], [390, 395]]);
  },
} satisfies Redraw;
