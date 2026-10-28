import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Lamacorne's fair copy, Psychic/Flying, the same drawing grown up: its rainbow grown into a wing of
 * rainbow feathers rising from its back where the mane ends, its horn longer, its rainbow longer, its
 * blue mane and tail bigger with more curls, a double flower on its side, a sharper eye under a brow, bigger
 * hooves, and the gold star on its side. It faces right, like its drawing.
 */
export default {
  id: '014', slug: 'lamacorne', seed: 14014, size: [1000, 1070], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const RED = '#ec4a3a', BLUE = '#3d6fd8', GREEN = '#86cf4a', LEAF = '#4fae3a', YELLOW = '#f7d33a', BLACK = '#3a3440';
    const RB = ['#ef5350', '#f7a530', '#f7d21e', '#5cb33c', '#4a92e0', '#8a6cd0'];
    // the drawing sits 70 px lower than its pencil one, so the longer horn and rainbow fit
    const Y = 70;
    const m = (pts: P[]): P[] => pts.map(([x, y]) => [x, y + Y]);
    const pot = (x: number, y: number, rx: number, ry: number, n = 10, mess = 0.06) => potato(x, y + Y, rx, ry, n, mess);
    /**
     * A rainbow wing: long round feathers fanned out from its root, one per colour of its horn's rainbow, from the
     * violet one at the bottom to the red one along the top (drawn last, over the others).
     */
    const wing = (root: P, tips: P[], w: number) => {
      tips.forEach((tip, i) => {
        const col = RB[tips.length - 1 - i];
        const dx = tip[0] - root[0], dy = tip[1] - root[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
        const pts: P[] = Array.from({ length: 14 }, (_, k) => {
          const a = (k / 14) * Math.PI * 2, along = (1 + Math.cos(a)) / 2, across = Math.sin(a) * w * (0.55 + 0.45 * Math.sqrt(along));
          return [root[0] + ux * along * l - uy * across, root[1] + uy * along * l + ux * across];
        });
        shape(m(pts), col, { angle: (Math.atan2(dy, dx) * 180) / Math.PI + 80, over: 0 }, { w: 5 });
        stroke(m([[root[0] + ux * l * 0.2, root[1] + uy * l * 0.2], [root[0] + ux * l * 0.85, root[1] + uy * l * 0.85]]), { w: 3.5 });
      });
    };
    // the longer rainbow from the horn
    c.part('arc', { pivot: [780, 50 + Y], motion: 'flicker', period: 2.6, behind: true }, () => {
      RB.forEach((col, i) => stroke(m([[778 + i * 5, 50 - i * 11], [825 + i * 2, -2 - i * 11], [895, -22 - i * 10], [960, 5 - i * 7], [985, 50 - i * 4]]), { col, w: 12 }));
    });
    // legs at a trot, bigger black hooves
    shape(band(m([[300, 690], [270, 820], [230, 900]]), 68, 60), RED, { angle: 75 });
    shape(band(m([[400, 700], [410, 830], [420, 910]]), 68, 60), RED, { angle: 90 });
    shape(band(m([[600, 700], [640, 820], [690, 890]]), 68, 60), RED, { angle: 100 });
    shape(band(m([[690, 690], [700, 820], [710, 910]]), 68, 60), RED, { angle: 90 });
    for (const [x, y] of [[225, 918], [420, 928], [697, 906], [714, 928]]) shape(pot(x, y, 48, 26, 7, 0.05), BLACK, { over: 0 }, { w: 3.5 });
    // a bigger curly blue tail
    c.part('queue', { pivot: [235, 505 + Y], motion: 'swing', amp: 10, period: 1.5, behind: true }, () => {
      shape(m([[235, 465], [150, 400], [80, 430], [100, 490], [50, 530], [80, 590], [40, 640], [110, 660], [170, 610], [240, 545]]), BLUE, { angle: 60, press: 1.1 });
    });
    // the rainbow wing, rising from its back where the mane ends
    c.part('aile', { pivot: [520, 470 + Y], motion: 'flap', amp: -12, period: 1, behind: true }, () => {
      wing([520, 470], [[200, 400], [165, 300], [180, 200], [235, 115], [320, 55], [425, 30]], 52);
    });
    // the boxy body, a double flower on its side, the star
    shape(m([[240, 450], [600, 440], [740, 470], [760, 620], [720, 720], [270, 720], [230, 600]]), RED, { angle: 85, over: 0.7, press: 1.05 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      shape(pot(390 + Math.cos(a) * 68, 575 + Math.sin(a) * 62, 42, 38, 8, 0.06), LEAF, { over: 0 }, { w: 4 });
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - 0.4;
      shape(pot(390 + Math.cos(a) * 40, 575 + Math.sin(a) * 37, 34, 30, 8, 0.06), GREEN, { over: 0 }, { w: 4 });
    }
    shape(pot(390, 575, 34, 32, 9, 0.05), YELLOW, { over: 0, press: 1.1 }, { w: 4 });
    c.star(640, 640 + Y, 44, -8);
    // the long neck and head
    shape(m([[620, 470], [640, 300], [680, 200], [760, 170], [870, 200], [880, 260], [790, 290], [740, 330], [745, 480]]), RED, { angle: 80, over: 0.5 });
    // a bigger blue mane, curls from between its ears down to its back
    for (let i = 0; i < 7; i++) shape(pot(650 - i * 9, 160 + i * 52, 40 - i * 0.5, 36, 8, 0.08), BLUE, { over: 0, angle: 80 }, { w: 4 });
    for (const [x, y] of [[590, 488], [545, 478]] as P[]) shape(pot(x, y, 36, 30, 8, 0.08), BLUE, { over: 0, angle: 80 }, { w: 4 });
    // the longer horn with its spiral, the ear, a sharper eye under a brow, a sure smile
    shape(m([[748, 178], [770, 110], [784, 36], [806, 178]]), BLUE, { angle: 80, press: 1.1, over: 0 }, {}, false);
    c.shine(m([[786, 160], [781, 100]]), 6);
    shape(m([[700, 192], [682, 115], [738, 175]]), RED, { over: 0 }, {}, false);
    c.paper(m([[758, 222], [785, 205], [806, 220], [784, 238]]), { w: 5 });
    dot(788, 222 + Y, 10, 12);
    stroke(m([[750, 200], [812, 192]]), { w: 9 });
    stroke(m([[818, 262], [850, 260], [866, 248]]), { w: 4.5 });
  },
} satisfies Fair;
