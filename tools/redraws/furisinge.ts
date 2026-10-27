import type { Redraw } from './crayon.ts';

/** Fâchinge grown: a bigger, furious ball of fur turned to the left, iron bands on its wrists, fists up, teeth gritted. */
export default {
  id: '068', slug: 'furisinge', seed: 6801, size: [1050, 1050], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, potato, spikes } = c;
    const FUR = '#dfbf85', BROWN = '#9a6a3a', PINK = '#f29ab0', IRON = '#7a8496';
    // the far arm raised behind, its fist and iron band; the far foot
    shape(band([[330, 520], [230, 430], [200, 330]], 54, 48), FUR, { angle: 60 });
    shape(potato(200, 300, 46, 42, 8, 0.08), BROWN, { over: 0 });
    shape([[175, 350], [235, 345], [240, 375], [180, 380]], IRON, { over: 0 }, { w: 3.5 }, false);
    shape(potato(420, 930, 70, 36, 8, 0.06), BROWN, { over: 0 });
    // the big furry body, its edge spiky with anger
    const body: [number, number][] = [];
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2, r = i % 2 ? 330 : 380;
      body.push([520 + Math.cos(a) * r, 590 + Math.sin(a) * r * 0.9]);
    }
    shape(body, FUR, { angle: 75, over: 0.5, press: 1.05 }, {}, false);
    // the near foot, the near arm with its fist up and iron band
    shape(potato(640, 940, 80, 38, 8, 0.06), BROWN, { over: 0 });
    shape(band([[740, 560], [850, 480], [890, 380]], 58, 50), FUR, { angle: 120 });
    shape(potato(900, 350, 52, 48, 8, 0.08), BROWN, { over: 0 });
    shape([[860, 410], [930, 420], [925, 455], [855, 445]], IRON, { over: 0 }, { w: 3.5 }, false);
    // pointy ears
    shape([[300, 360], [210, 240], [350, 290]], BROWN, { over: 0 }, {}, false);
    shape([[620, 280], [720, 190], [690, 330]], BROWN, { over: 0 }, {}, false);
    // the furious face shifted left: a heavy brow, a pig nose, gritted teeth
    shape(spikes([[250, 420], [370, 395], [490, 400]], 3, -20), BROWN, { over: 0, press: 1.1 }, {}, false);
    c.paper(potato(305, 460, 22, 22, 8, 0.05));
    c.paper(potato(420, 455, 30, 28, 8, 0.05));
    dot(305, 466, 10, 10, '#e8302c');
    dot(420, 462, 12, 12, '#e8302c');
    shape(potato(330, 545, 58, 42, 9, 0.06), PINK, { over: 0 }, { w: 4 });
    dot(312, 545, 7, 9);
    dot(350, 543, 7, 9);
    c.paper([[270, 610], [400, 605], [395, 640], [275, 645]], {}, false);
    for (const x of [300, 330, 360]) stroke([[x, 608], [x, 643]], { w: 3 });
  },
} satisfies Redraw;
