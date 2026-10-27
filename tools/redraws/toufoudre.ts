import type { Redraw } from './crayon.ts';

/** The electric one: a bright yellow fox leaping, all zig-zag fur, a white spiky collar, sparks. */
export default {
  id: '019', slug: 'toufoudre', seed: 119, size: [1100, 900], tilt: 2,
  draw(c) {
    const { shape, paper, stroke, dot, band, spikes } = c;
    const YELLOW = '#f7da2c', GREY = '#55505c';
    // back legs, a spiky tail of lightning fur
    shape(band([[760, 560], [850, 680], [900, 820]], 80, 62), YELLOW, { angle: 70 });
    shape(band([[650, 590], [640, 720], [620, 840]], 74, 60), YELLOW, { angle: 95 });
    shape(spikes([[820, 420], [950, 300], [1060, 240], [1000, 380], [880, 480]], 4, 45), YELLOW, { angle: 30, press: 1.1 }, {}, false);
    // the body, zig-zag fur along the back
    shape(spikes([[330, 470], [470, 400], [640, 380], [820, 420]], 3, 55).concat([[860, 520], [780, 610], [560, 640], [380, 620], [300, 560]]), YELLOW, { angle: 15, over: 0.5 }, {}, false);
    // front legs stretched forward
    shape(band([[360, 580], [260, 680], [150, 740]], 70, 58), YELLOW, { angle: 30 });
    shape(band([[430, 600], [380, 720], [330, 840]], 70, 58), YELLOW, { angle: 70 });
    // white collar of spiky fur
    paper(spikes([[200, 420], [330, 600], [470, 540], [450, 380]], 3, 50).concat([[300, 330]]), {}, false);
    // the head, long ears with grey insides
    shape([[240, 230], [330, 40], [370, 240]], YELLOW, { angle: 70 }, {}, false);
    shape([[275, 220], [325, 100], [345, 225]], GREY, { angle: 70, over: 0, press: 0.9 }, { w: 3 }, false);
    shape([[330, 250], [520, 120], [430, 300]], YELLOW, { angle: 40 }, {}, false);
    shape([[370, 255], [480, 160], [420, 285]], GREY, { angle: 40, over: 0, press: 0.9 }, { w: 3 }, false);
    shape([[120, 330], [180, 250], [300, 220], [420, 290], [430, 380], [330, 440], [190, 430], [110, 390]], YELLOW, { angle: 60, over: 0.5 });
    // face: a big eye with a shine, a little nose, a smile
    shape(c.potato(270, 320, 34, 40, 9, 0.05), GREY, { angle: 80, over: 0, press: 1.2 });
    dot(260, 305, 8, 10, '#ffffff');
    dot(125, 345, 9, 7);
    stroke([[130, 390], [175, 410], [215, 395]]);
    // sparks
    stroke([[960, 120], [990, 170], [965, 175], [1000, 230]], { w: 4.5 }, false);
    stroke([[60, 170], [95, 210], [70, 215], [105, 260]], { w: 4.5 }, false);
  },
} satisfies Redraw;
