import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Furisinge's fair copy, Fighting/Fire, the same drawing grown up: its shaggy fur bigger, its tufts
 * longer, and the tufts on its crown burst into big flames (the steam of its anger caught fire); its fists half as
 * big again, with their knuckles; its iron cuffs bigger; a spikier brow over its red eyes, its gritted teeth bared
 * with two fangs, and the gold star in its fur. Drawn on a bigger sheet, so the fists have room.
 */
export default {
  id: '068', slug: 'furisinge', seed: 6868, size: [1200, 1140], tilt: 0,
  draw(c) {
    const { band, potato, spikes, rnd } = c;
    // the pencil drawing's coordinates, moved on the bigger sheet
    const DX = 60, DY = 40;
    const mv = (pts: P[]): P[] => pts.map(([x, y]) => [x + DX, y + DY]);
    const shape: typeof c.shape = (pts, ...r) => c.shape(mv(pts), ...r);
    const paper: typeof c.paper = (pts, ...r) => c.paper(mv(pts), ...r);
    const tint: typeof c.tint = (pts, ...r) => c.tint(mv(pts), ...r);
    const stroke: typeof c.stroke = (pts, ...r) => c.stroke(mv(pts), ...r);
    const shine: typeof c.shine = (pts, ...r) => c.shine(mv(pts), ...r);
    const dot: typeof c.dot = (x, y, ...r) => c.dot(x + DX, y + DY, ...r);
    const part: typeof c.part = (name, def, draw) => c.part(name, { ...def, pivot: [def.pivot[0] + DX, def.pivot[1] + DY] }, draw);
    const FUR = '#d9ad6e', BROWN = '#8a5a30', PINK = '#f29ab0', IRON = '#7a8496', RED = '#e8302c';
    const FIRE = '#ec4a16', FLAME = '#f7a21e', CORE = '#ffe27a';
    const cuff = (x: number, y: number, w: number, h: number, tilt: number) => {
      const r = (tilt * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r);
      const at = (u: number, v: number): P => [x + u * co - v * si, y + u * si + v * co];
      shape([at(-w, -h), at(w, -h), at(w, h), at(-w, h)], IRON, { over: 0, angle: tilt + 90 }, { w: 4 }, false);
      dot(...at(-w * 0.55, 0), 6, 6, '#ffffff');
      dot(...at(w * 0.55, 0), 6, 6, '#ffffff');
    };
    /** A flame: base at (x, y), pointing at angle `deg` (0 = up). */
    const flame = (x: number, y: number, w: number, h: number, deg: number) => {
      const a = (deg * Math.PI) / 180;
      const unit: P[] = [[-0.5, 0], [-0.6, -0.35], [-0.32, -0.5], [-0.4, -0.85], [-0.08, -0.58], [0.04, -1], [0.2, -0.58], [0.45, -0.82], [0.36, -0.38], [0.58, -0.25], [0.48, 0.08], [0, 0.16]];
      const at = (f: number): P[] => unit.map(([ux, uy]) => {
        const px = ux * w * f, py = uy * h * f + h * (1 - f) * -0.12;
        return [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
      });
      shape(at(1), FIRE, { angle: deg - 90 });
      tint(at(0.66), FLAME, { angle: deg - 90 });
      tint(at(0.36), CORE, { angle: deg - 90 });
    };
    /** A big fist: the ball of the hand and its knuckles facing `dir` (-1 left, 1 up). */
    const fist = (x: number, y: number, rx: number, ry: number, up: boolean) => {
      shape(potato(x, y, rx, ry, 9, 0.05), BROWN, { angle: 80, over: 0.3 });
      for (const k of [-0.5, 0, 0.5]) {
        if (up) stroke([[x + k * rx * 1.2, y - ry * 0.95], [x + k * rx * 1.1 + 4, y - ry * 0.55]], { w: 4 });
        else stroke([[x - rx * 0.95, y + k * ry * 1.2], [x - rx * 0.55, y + k * ry * 1.1 + 4]], { w: 4 });
      }
      shine(up ? [[x - rx * 0.55, y - ry * 0.35], [x - rx * 0.3, y - ry * 0.65]] : [[x - rx * 0.4, y - ry * 0.6], [x - rx * 0.05, y - ry * 0.75]], 6);
    };
    // the shaggy body, bigger, its tufts longer (worked out first: the flames grow from the crown's tufts)
    const body: P[] = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2, r = i % 2 ? 330 : 400 + rnd() * 60;
      body.push([560 + Math.cos(a) * r, 600 + Math.sin(a) * r * 0.9]);
    }
    // the crown's tufts burning (they flicker in battle)
    part('flammes', { pivot: [560, 600], motion: 'swing', amp: 2.5, period: 0.9, behind: true }, () => {
      for (const [i, h] of [[18, 200], [22, 230], [20, 260], [24, 250], [26, 200]] as P[]) {
        const [x, y] = body[i], a = Math.atan2(y - 600, x - 560);
        flame(560 + (x - 560) * 0.8, 600 + (y - 600) * 0.8, h * 0.62, h, (a * 180) / Math.PI + 90);
      }
    });
    // the far arm punching out to the left, its cuff and bigger fist; the far foot
    shape(band([[400, 610], [280, 625], [200, 602]], 100, 90), FUR, { angle: 10 });
    cuff(240, 608, 32, 60, 0);
    fist(98, 598, 118, 106, false);
    shape(potato(395, 975, 100, 42, 8, 0.06), BROWN, { over: 0 });
    cuff(410, 928, 66, 24, -4);
    shape(body, FUR, { angle: 75, over: 0.55, press: 1.1 }, {}, false);
    for (const [x, y] of [[600, 730], [720, 600], [500, 840], [800, 820], [660, 470], [420, 790]] as const) stroke([[x - 24, y - 15], [x, y + 11], [x + 24, y - 15]], { w: 4 });
    c.star(700 + DX, 720 + DY, 48, 8);
    // the near foot stamping, the near arm raised, its cuff and bigger fist
    shape(potato(700, 990, 110, 46, 8, 0.06), BROWN, { over: 0 });
    cuff(690, 938, 70, 24, 3);
    part('poing', { pivot: [760, 500], motion: 'swing', amp: 6, period: 1.4 }, () => {
      shape(band([[760, 500], [860, 380], [905, 250]], 106, 94), FUR, { angle: 120 });
      cuff(892, 306, 66, 28, -18);
      fist(922, 145, 124, 112, true);
    });
    // pointy ears, longer
    shape([[318, 385], [195, 215], [368, 300]], BROWN, { over: 0 }, {}, false);
    shape([[640, 285], [760, 150], [712, 335]], BROWN, { over: 0 }, {}, false);
    // the furious face shifted left: a heavier spiky brow, red eyes, a pig nose, teeth bared with two fangs, an angry vein
    shape(spikes([[245, 435], [380, 398], [520, 405]], 4, -34), BROWN, { over: 0, press: 1.2 }, {}, false);
    paper([[292, 458], [342, 470], [336, 492], [296, 488]]);
    paper([[408, 462], [466, 452], [466, 486], [414, 490]]);
    dot(318, 478, 11, 11, RED);
    dot(438, 472, 14, 13, RED);
    dot(318, 478, 4, 4);
    dot(438, 472, 5, 5);
    shape(potato(345, 562, 66, 48, 9, 0.06), PINK, { over: 0 }, { w: 4 });
    dot(324, 562, 8, 11);
    dot(367, 560, 8, 11);
    paper([[268, 690], [282, 726], [298, 688]], { w: 4 }, false);
    paper([[400, 686], [414, 722], [428, 684]], { w: 4 }, false);
    paper([[252, 628], [440, 618], [436, 678], [262, 684]], {}, false);
    stroke([[256, 652], [438, 646]], { w: 3.5 });
    for (const x of [292, 330, 368, 404]) stroke([[x, 624], [x, 680]], { w: 3.5 });
    for (const [a, b] of [[[540, 380], [562, 402]], [[584, 380], [564, 404]], [[540, 430], [562, 410]], [[586, 430], [566, 408]]] as [P, P][]) stroke([a, b], { w: 6, col: RED });
  },
} satisfies Fair;
