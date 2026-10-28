import type { P, Redraw } from './crayon.ts';

/** A little squirrel sitting up, turned to the left: a big green maple leaf for a tail, an acorn held to nibble. */
export default {
  id: '093', slug: 'erabou', seed: 9302, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, band, tint, potato } = c;
    const FUR = '#c8743a', CREAM = '#f4e2b4', GREEN = '#5cbf4a', NUT = '#d9a35c', CAP = '#8a5a32', PINK = '#f29ab0';
    /** A maple leaf: five pointed lobes, its stalk at the bottom; s its size, a its turn in degrees. */
    const maple = (x: number, y: number, s: number, a: number): P[] => {
      const r = (a * Math.PI) / 180;
      return ([[0, 0.35], [-0.15, 0.25], [-0.45, 0.32], [-0.38, 0.18], [-0.75, 0.05], [-0.55, -0.02], [-0.7, -0.3], [-0.42, -0.25], [-0.38, -0.5],
        [-0.18, -0.38], [0, -0.85], [0.18, -0.38], [0.38, -0.5], [0.42, -0.25], [0.7, -0.3], [0.55, -0.02], [0.75, 0.05], [0.38, 0.18], [0.45, 0.32],
        [0.15, 0.25]] as P[]).map(([u, v]) => [x + (u * Math.cos(r) - v * Math.sin(r)) * s, y + (u * Math.sin(r) + v * Math.cos(r)) * s]);
    };
    // the leaf tail, curling up behind: in battle it sways
    c.part('queue', { pivot: [640, 770], motion: 'swing', amp: 7, period: 2, behind: true }, () => {
      shape(band([[630, 780], [712, 700], [735, 600], [702, 505]], 64, 22), '#3f9a3a', { angle: 60, over: 0.3 });
      const leaf = maple(730, 400, 290, 18);
      shape(leaf, GREEN, { angle: 70, over: 0.5 }, {}, false);
      const [bx, by] = leaf[0];
      for (const k of [10, 6, 14, 4, 16]) stroke([[bx, by], [leaf[k][0] * 0.8 + bx * 0.2, leaf[k][1] * 0.8 + by * 0.2]], { w: 3 });
    });
    // the far ear and far foot, behind
    shape([[300, 300], [270, 170], [350, 255]], FUR, { angle: 70 }, {}, false);
    shape(potato(640, 870, 55, 26, 8, 0.06), FUR, { angle: 0, over: 0 });
    // the plump body sitting up, its cream tummy
    shape([[380, 520], [500, 482], [620, 520], [672, 650], [652, 800], [560, 862], [420, 862], [360, 780], [350, 640]], FUR, { angle: 80, over: 0.5 });
    shape(potato(470, 705, 82, 118, 10, 0.05), CREAM, { over: 0 });
    // the near haunch and foot
    shape(potato(575, 790, 92, 72, 10, 0.05), FUR, { angle: 60, over: 0.4 });
    shape(band([[530, 852], [440, 872]], 54, 48), FUR, { angle: 0, over: 0 });
    // the near ear with a tuft, the head
    shape([[410, 280], [470, 120], [500, 275]], FUR, { angle: 110 }, {}, false);
    shape([[452, 150], [470, 92], [488, 150]], '#7c4a22', { over: 0 }, { w: 3 }, false);
    shape(potato(362, 385, 142, 126, 12, 0.05), FUR, { angle: 80, over: 0.5 });
    // puffy cheeks, big eyes (the far one smaller), a little nose and two teeth
    shape(potato(300, 445, 62, 46, 9, 0.05), CREAM, { over: 0 });
    c.paper(potato(300, 360, 26, 32, 8, 0.04));
    c.paper(potato(396, 352, 32, 38, 8, 0.04));
    dot(296, 368, 14, 20);
    dot(390, 360, 17, 23);
    dot(290, 356, 5, 6, '#ffffff');
    dot(383, 348, 6, 7, '#ffffff');
    dot(250, 420, 13, 10);
    stroke([[250, 432], [262, 455], [290, 462]], { w: 4 });
    c.paper([[262, 458], [288, 462], [286, 484], [264, 482]], { w: 3 }, false);
    tint(potato(420, 430, 24, 14, 7, 0.1), PINK, { gap: 3 });
    // the near arm holding an acorn: in battle it brings it to its mouth
    c.part('gland', { pivot: [450, 548], motion: 'reach', amp: 55, period: 4.2 }, () => {
      shape(band([[452, 548], [400, 590], [360, 600]], 44, 38), FUR, { angle: 40, over: 0 });
      shape(potato(345, 610, 44, 54, 9, 0.04), NUT, { angle: 90, over: 0.3 });
      shape([[296, 600], [302, 562], [345, 545], [390, 562], [396, 600], [345, 592]], CAP, { angle: 0, over: 0 });
      stroke([[312, 570], [372, 595]], { w: 3 });
      stroke([[330, 556], [385, 580]], { w: 3 });
      stroke([[378, 565], [318, 592]], { w: 3 });
      stroke([[345, 545], [350, 520]], { w: 5 });
      shape(potato(378, 600, 22, 18, 7, 0.06), FUR, { over: 0 });
    });
  },
} satisfies Redraw;
