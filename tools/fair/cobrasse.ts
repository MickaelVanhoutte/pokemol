import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Cobrasse's fair copy, Poison/Ground, the same drawing grown up: its hood spread wider, the scary face
 * on it much bigger and bolder (dark rims round big eyes with slit pupils, thick brows, a wide zig-zag mouth full of
 * fangs) and big sandy diamonds round its edge,
 * a third coil under its neck, long fangs under its snout and heavy brows over its slit eyes, its tail tipped with
 * a stony spike, and the gold star on its coils.
 */
export default {
  id: '043', slug: 'cobrasse', seed: 43043, size: [1100, 1150], tilt: 2,
  draw(c) {
    const { shape, stroke, dot, potato, shake, band } = c;
    const PURPLE = '#8448c0', DEEP = '#3e1a6e', YEL = '#f2cf3a', EYE = '#ffd21a', RED = '#e04040', MOUTH = '#e8222e', SAND = '#d39a48', STONE = '#9a6a3a';
    // the tail, longer, ending in a stony spike
    c.part('queue', { pivot: [645, 995], motion: 'swing', amp: 5, period: 1.8, behind: true }, () => {
      shape([[985, 875], [1080, 745], [1035, 900]], SAND, { over: 0 }, { w: 5 }, false);
      stroke([[1000, 870], [1060, 790]], { w: 4, col: STONE });
      shape(band([[640, 1000], [800, 990], [930, 930], [1010, 860]], 72, 34), PURPLE, { angle: 20 });
    });
    // three coils on the ground, their scales
    shape(potato(520, 975, 345, 112, 11, 0.04), PURPLE, { angle: -20 });
    for (const x of [270, 395, 530, 665, 785]) stroke([[x, 930], [x + 10, 965 + 100 * Math.sqrt(1 - ((x - 520) / 345) ** 2)]], { w: 5, col: DEEP });
    shape(potato(525, 855, 278, 98, 10, 0.04), PURPLE, { angle: -20 });
    for (const x of [340, 455, 590, 705]) stroke([[x, 820], [x + 8, 848 + 88 * Math.sqrt(1 - ((x - 525) / 278) ** 2)]], { w: 5, col: DEEP });
    c.star(690, 1010, 46, 8);
    shape(potato(545, 755, 190, 76, 9, 0.04), PURPLE, { angle: -20 });
    // the neck up to the hood
    shape(band([[560, 790], [600, 680], [570, 560]], 140, 124), PURPLE, { angle: 70 });
    // the hood, spread wider, big sandy diamonds round its edge
    shape(shake([[300, 430], [335, 240], [505, 150], [715, 205], [835, 420], [770, 640], [560, 725], [385, 655]], 6), PURPLE, { angle: 70 });
    for (const [x, y, a] of [[352, 300, -25], [375, 600, 40], [755, 600, 135], [768, 300, 205]] as [number, number, number][]) {
      const r = (a * Math.PI) / 180, u: P = [Math.cos(r), Math.sin(r)];
      shape([[x - u[0] * 34, y - u[1] * 34], [x - u[1] * 22, y + u[0] * 22], [x + u[0] * 34, y + u[1] * 34], [x + u[1] * 22, y - u[0] * 22]], SAND, { over: 0 }, { w: 4.5 }, false);
    }
    // the face drawn on it, much bigger and bolder: big yellow eyes with slit pupils under thick brows, a wide
    // V of a mouth full of fangs
    for (const [x, y, rx, ry] of [[440, 432, 82, 74], [645, 428, 100, 82]] as [number, number, number, number][]) {
      shape(potato(x, y, rx, ry, 10, 0.03), EYE, { angle: 60, over: 0, press: 1.2 }, { w: 10 });
      dot(x + rx * 0.05, y + 10, rx * 0.16, ry * 0.58);
      dot(x - rx * 0.4, y - ry * 0.05, rx * 0.12, rx * 0.12, '#ffffff');
    }
    stroke([[338, 352], [512, 408]], { w: 30, col: DEEP });
    stroke([[568, 404], [770, 330]], { w: 32, col: DEEP });
    const mouth: P[] = [[392, 538], [470, 576], [545, 612], [620, 576], [700, 532], [650, 618], [545, 692], [446, 622]];
    shape(mouth, MOUTH, { angle: 20, over: 0, press: 1.2 }, { w: 8 });
    for (const [x, y, d] of [[452, 574, 54], [500, 596, 44], [590, 596, 44], [640, 571, 54]] as [number, number, number][]) {
      c.paper([[x - 15, y - 4], [x, y + d], [x + 15, y + 2]], { w: 5 }, false);
    }
    // the head on top, turned left: slit eyes under heavy brows, long fangs, the tongue
    shape(shake([[400, 220], [440, 150], [540, 130], [620, 170], [630, 240], [560, 290], [440, 295], [390, 260]], 4), PURPLE, { angle: 60 });
    shape(potato(455, 196, 20, 18, 7, 0.06), YEL, { over: 0 }, { w: 4 });
    stroke([[455, 182], [456, 210]], { w: 5 });
    shape(potato(540, 193, 28, 21, 7, 0.06), YEL, { over: 0 }, { w: 4 });
    stroke([[540, 176], [542, 211]], { w: 6 });
    stroke([[425, 162], [478, 186]], { w: 11 });
    stroke([[510, 186], [582, 160]], { w: 12 });
    stroke([[395, 262], [460, 280], [545, 282]], { w: 5 });
    c.paper([[425, 270], [437, 338], [452, 274]], { w: 4.5 }, false);
    c.paper([[485, 280], [496, 344], [510, 281]], { w: 4.5 }, false);
    dot(408, 238, 4); dot(425, 241, 4);
    c.shine([[470, 152], [520, 142]], 6);
    c.part('langue', { pivot: [410, 278], motion: 'peek', to: [40, 0], shrink: 0.4, fade: true, period: 1.8 }, () => {
      shape([[410, 268], [335, 298], [290, 274], [318, 308], [286, 338], [342, 314], [416, 288]], RED, { over: 0 }, { w: 4 }, false);
    });
  },
} satisfies Fair;
