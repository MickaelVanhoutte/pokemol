import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Montagnoc's fair copy, Rock/Fire, the same drawing grown up: the rock plates on its back piled up into a
 * tall volcano peak with a crater full of lava and lava running down its sides, lava glowing in the cracks between the
 * plates of its shell, white claws instead of its pencil ones, heavier brows and more fangs, and the gold star on a
 * plate of its shell. In battle its head still hides in its shell, and the volcano erupts now and then. It faces
 * left, like its drawing.
 */
export default {
  id: '040', slug: 'montagnoc', seed: 40040, size: [1200, 1300], tilt: -3,
  draw(c) {
    const { shape, stroke, dot, potato, band } = c;
    const ROCK = '#8a7f72', BODY = '#b08a62', DARK = '#5e564d', LAVA = '#f2662a', GLOW = '#ffc23a', CRUST = '#6e665c';
    // the drawing sits 200 px lower than its pencil one, so the volcano fits
    const Y = 200;
    const m = (pts: P[]): P[] => pts.map(([x, y]) => [x, y + Y]);
    const pot = (x: number, y: number, rx: number, ry: number, n = 8, mess = 0.08) => potato(x, y + Y, rx, ry, n, mess);
    /** Three white claws from a paw's edge, pointing at `deg` (0 = right). */
    const claws = (x: number, y: number, deg: number) => {
      for (const k of [-1, 0, 1]) {
        const a = ((deg + k * 22) * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a);
        const bx = x + k * -uy * 34, by = y + k * ux * 34;
        shape(m([[bx - uy * 15, by + ux * 15], [bx + ux * 72, by + uy * 72], [bx + uy * 15, by - ux * 15]]), '#ffffff', { over: 0 }, { w: 4 }, false);
      }
    };
    /** A flame standing on (x, y), `w` wide and `h` high, glowing yellow inside. */
    const flame = (x: number, y: number, w: number, h: number) => {
      const unit: P[] = [[-0.5, 0], [-0.6, -0.35], [-0.32, -0.5], [-0.4, -0.85], [-0.08, -0.58], [0.04, -1], [0.2, -0.58], [0.45, -0.82], [0.36, -0.38], [0.58, -0.25], [0.48, 0.08], [0, 0.16]];
      const at = (f: number) => m(unit.map(([u, v]) => [x + u * w * f, y + v * h * f + h * (1 - f) * -0.1] as P));
      shape(at(1), LAVA, { angle: 80, over: 0 }, { w: 5 });
      c.tint(at(0.6), GLOW, { angle: 80, press: 1.2 });
    };
    // the far leg and far arm, behind the shell on the left
    shape(pot(430, 950, 95, 64), BODY, { angle: 0 });
    claws(178, 680, 180);
    shape(m([[300, 620], [200, 600], [160, 680], [220, 740], [310, 720]]), BODY, { angle: 60 });
    // the volcano: the rocks of its back piled up into a tall peak, a crater of lava, lava running down
    shape(m([[370, 420], [470, 330], [505, 305], [548, 225], [532, 205], [588, 110], [598, 40], [772, 35], [786, 110], [842, 190], [828, 214], [900, 330], [970, 410]]), CRUST, { angle: 75 }, {}, false);
    for (const [x, y, rx, ry] of [[595, 300, 92, 56], [790, 295, 96, 58], [690, 190, 80, 52]]) shape(pot(x, y, rx, ry, 8, 0.1), ROCK, { angle: 60 }, { w: 5.5 });
    for (const [path, w0, w1] of [[[[628, 48], [610, 100], [630, 150], [600, 200], [612, 250]], 36, 16], [[[748, 46], [762, 90], [752, 125]], 28, 14]] as [P[], number, number][]) {
      shape(band(m(path), w0, w1), LAVA, { angle: 80, over: 0 }, { w: 4.5 });
      stroke(m(path.slice(0, -1)), { w: 7, col: GLOW });
    }
    // the crater brimming with glowing lava
    shape(pot(685, 38, 90, 25, 9, 0.03), LAVA, { over: 0, press: 1.3 }, { w: 5.5 });
    c.tint(pot(685, 36, 56, 11, 8, 0.04), GLOW, { over: 0, press: 1.3 });
    // the shell: its plates bigger, lava glowing in every crack between them
    shape(pot(640, 600, 370, 330, 12, 0.05), ROCK, { angle: 70 });
    const plates = [[560, 420, 112, 82], [790, 420, 120, 92], [500, 620, 96, 104], [700, 600, 128, 104], [890, 610, 104, 118], [570, 805, 118, 80], [800, 805, 122, 82], [375, 520, 70, 90], [370, 760, 72, 80]].map(([x, y, rx, ry]) => pot(x, y, rx, ry, 8, 0.1));
    for (const p of plates) c.tint(c.grow(p, 12), LAVA, { angle: 60, press: 1.2 });
    for (const p of plates) shape(p, ROCK, { angle: 60 }, { w: 5.5 });
    for (const [x, y] of [[640, 700], [760, 500], [540, 530], [860, 720]]) shape(pot(x, y, 18, 14, 8, 0.15), DARK, { over: 0 }, { w: 4 });
    c.star(700, 600 + Y, 48, 10);
    // the near leg and near arm, in front on the right
    shape(pot(820, 960, 112, 76), BODY, { angle: 0 });
    claws(1095, 680, 0);
    shape(m([[960, 620], [1070, 600], [1110, 680], [1050, 740], [950, 720]]), BODY, { angle: 60 });
    // the head poking out at the front left: heavier brows, a snout, four fangs; it hides in the shell in battle
    c.part('tete', { pivot: [500, 420 + Y], motion: 'peek', to: [25, 15], shrink: 0.5, fade: true, inside: true, period: 4.4 }, () => {
      shape(m([[260, 330], [330, 250], [460, 240], [540, 300], [550, 400], [480, 460], [330, 460], [250, 420], [215, 380]]), BODY, { angle: 60 });
      stroke(m([[280, 305], [345, 338]]), { w: 13 });
      stroke(m([[388, 342], [470, 305]]), { w: 14 });
      dot(318, 360 + Y, 9, 12);
      dot(428, 362 + Y, 11, 13);
      dot(232, 380 + Y, 7, 6);
      shape(m([[250, 410], [320, 398], [395, 418], [360, 440], [290, 438]]), '#5a2430', { over: 0 }, { w: 5 });
      for (const x of [268, 305, 345, 378]) c.paper(m([[x, 408], [x + 9, 432], [x + 18, 410]]), { w: 3.5 }, false);
      c.shine(m([[330, 270], [370, 260]]), 6);
    });
    // only in battle: now and then the volcano erupts
    c.part('eruption', { pivot: [685, 38 + Y], motion: 'flicker', period: 3.2, extra: true }, () => flame(685, 36, 250, 210));
  },
} satisfies Fair;
