import type { Colour, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Râpépic's fair copy, Ground/Steel, the same drawing grown up: its fan of sandpaper quills half as long
 * again and more of them, longest at the back, its grey files turned to shining steel blades; the short quills over its
 * back grown nearly twice as long; its gnawing teeth bigger, longer digging claws of steel, a fiercer eye under a
 * heavier brow, and the gold star on its side.
 */
export default {
  id: '106', slug: 'rapepic', seed: 106106, size: [1340, 1100], tilt: -2,
  draw(c) {
    // the whole drawing sits lower on the sheet, to make room for its great fan of quills
    const DY = 100;
    const T = (pts: P[]): P[] => pts.map(([x, y]) => [x, y + DY]);
    const shape = (pts: P[], col: string, o?: Colour, l?: Line, round?: boolean) => c.shape(T(pts), col, o, l, round);
    const paper = (pts: P[], l?: Line, round?: boolean) => c.paper(T(pts), l, round);
    const stroke = (pts: P[], l?: Line, round?: boolean) => c.stroke(T(pts), l, round);
    const tint = (pts: P[], col: string, o?: Colour) => c.tint(T(pts), col, o);
    const dot = (x: number, y: number, rx: number, ry?: number, col?: string) => c.dot(x, y + DY, rx, ry, col);
    const shine = (pts: P[], w?: number) => c.shine(T(pts), w);
    const { potato, band, spikes, rnd } = c;
    const FUR = '#6b4a2e', FUR2 = '#8a5f3a', CREAM = '#e9d2a6', GRIT = '#4a3420', PINK = '#f29ac8', STEEL = '#8d9ab0';
    const STRIPS = ['#d9b77a', '#c4704a', STEEL, '#e39aa6'];
    const at = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    /** One quill: a strip of sandpaper from its root to a sharp tip, specks of grit along it; or a blade of shining steel (the old metal files). */
    const quill = (root: P, tip: P, w: number, col: string) => {
      const angle = (Math.atan2(tip[1] - root[1], tip[0] - root[0]) * 180) / Math.PI;
      if (col === STEEL) {
        shape(band([root, at(root, tip, 0.5), tip], w * 1.1, 4), STEEL, { angle: angle + 90, over: 0.3, press: 1.25 });
        stroke([at(root, tip, 0.12), at(root, tip, 0.8)], { w: 3.5, col: '#566178' });
        shine([at(root, tip, 0.25), at(root, tip, 0.85)], 8);
        return;
      }
      shape(band([root, at(root, tip, 0.5), tip], w, 4), col, { angle, over: 0.2 });
      for (let k = 1; k < 6; k++) {
        const t = k / 7;
        dot(root[0] + (tip[0] - root[0]) * t + (rnd() - 0.5) * 8, root[1] + (tip[1] - root[1]) * t + (rnd() - 0.5) * 8, 2.4, 2.2, GRIT);
      }
    };
    // the fan of quills raised over its back, half as long again and more of them, longest at the back: in battle it rattles
    c.part('piquants', { pivot: [620, 600 + DY], motion: 'swing', amp: 4, period: 2, behind: true }, () => {
      const o: P = [640, 660];
      for (let k = 0; k < 23; k++) {
        const a = ((-168 + k * 8.4) * Math.PI) / 180, want = 660 + k * 11 + (k % 3) * 45 - Math.abs(k - 11) * 4;
        // the quills on the right stop short of the edge of the sheet
        const len = Math.cos(a) > 0 ? Math.min(want, (1300 - o[0]) / (Math.cos(a) * 0.92)) : want;
        quill([o[0] + Math.cos(a) * 170, o[1] + Math.sin(a) * 150], [o[0] + Math.cos(a) * len * 0.92, o[1] + Math.sin(a) * len * 0.9], 80, STRIPS[k % 4]);
      }
    });
    // the far legs, behind
    shape(band([[420, 720], [400, 840]], 70, 60), FUR, { angle: 90, over: 0 });
    shape(band([[760, 720], [790, 840]], 76, 64), FUR, { angle: 90, over: 0 });
    // the body, dark fur
    shape(potato(590, 650, 270, 175, 12, 0.04), FUR, { angle: 70, over: 0.5 });
    // much longer, sharper quills over the top of its back, in front of the fan
    shape(spikes([[820, 640], [760, 520], [640, 470], [500, 490], [400, 560]], 3, 165).concat([[430, 600], [560, 560], [700, 580], [790, 680]]), '#d9b77a', { angle: 40, over: 0.4 }, {}, false);
    for (let k = 0; k < 24; k++) dot(450 + rnd() * 330, 530 + rnd() * 70, 2.4, 2, GRIT);
    c.star(625, 705 + DY, 48, 8);
    // the near legs, strong, with longer digging claws
    for (const [x, w] of [[480, 92], [720, 96]] as const) {
      shape(band([[x, 720], [x - 10, 870]], w, w * 0.85), FUR2, { angle: 90, over: 0.2 });
      for (const dx of [-38, -8, 22]) {
        shape([[x + dx - 11, 866], [x + dx - 46, 935], [x + dx + 11, 880]], STEEL, { over: 0, press: 1.25 }, { w: 3.5 }, false);
        shine([[x + dx - 8, 880], [x + dx - 28, 915]], 4);
      }
    }
    // the head held high, dark fur with a cream muzzle
    shape([[470, 500], [500, 640], [420, 720], [300, 740], [175, 710], [130, 650], [190, 590], [300, 500], [390, 470]], FUR2, { angle: 60, over: 0.4 });
    shape([[250, 610], [300, 690], [240, 740], [160, 720], [125, 660], [170, 615]], CREAM, { angle: 20, over: 0.2 });
    dot(130, 650, 20, 17);
    dot(124, 644, 5, 4, '#ffffff');
    // two bigger orange gnawing teeth
    shape([[172, 712], [174, 790], [206, 792], [206, 716]], '#f0a040', { over: 0 }, { w: 4 }, false);
    shape([[208, 716], [210, 786], [240, 782], [238, 712]], '#f0a040', { over: 0 }, { w: 4 }, false);
    for (const [a, b] of [[[220, 650], [300, 625]], [[222, 668], [305, 665]]] as [P, P][]) stroke([a, b], { w: 3, col: '#f4ead6' });
    // a fiercer eye under a heavier cream brow, slanting down to the snout; a round ear
    paper([[262, 566], [304, 572], [306, 594], [266, 590]]);
    dot(280, 582, 10, 11);
    dot(276, 577, 3.5, 3.5, '#ffffff');
    shape([[220, 562], [330, 528], [350, 552], [236, 584]], CREAM, { over: 0 }, { w: 4 });
    shape(potato(430, 480, 36, 34, 8, 0.06), FUR, { over: 0 });
    tint(potato(430, 482, 17, 15, 7, 0.06), PINK, { gap: 3 });
  },
} satisfies Fair;
