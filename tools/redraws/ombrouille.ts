import type { P, Redraw } from './crayon.ts';

/**
 * A tall purple ghost rising out of a puddle of shadow, leaning to the left. From her drawing it keeps the purple,
 * the points on its head, the red eyes, the huge toothy grin and the clawed arm thrown forward. It has no legs now:
 * it lives in your shadow and comes up out of it. Grimouille's curls have grown into four smoky spikes with ghostly
 * blue flames at their tips, its floating hands are joined to long wispy arms, and pale swirls mark its chest.
 */
export default {
  id: '011', slug: 'ombrouille', seed: 11209, size: [1000, 1000], tilt: -3,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    const PURPLE = '#7a48c8', DEEP = '#4e2c86', NIGHT = '#2e2350', LAV = '#c3a2f0', RED = '#e0453a', PINK = '#f07aa8';
    const BLUE = '#4f8fe8', CYAN = '#9fe0ff';
    const swirl = (x: number, y: number, r: number, col: string, w = 5) =>
      stroke(Array.from({ length: 9 }, (_, i): P => {
        const a = i * 0.8, rr = r * (1 - i / 11);
        return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8];
      }), { w, col });
    /** A ghostly blue flame at (x, y), leaning `lean` px. */
    const flame = (x: number, y: number, s: number, lean: number) => {
      shape([[x - 22 * s, y + 10 * s], [x - 14 * s, y - 30 * s], [x + lean * 0.5, y - 50 * s], [x + lean, y - 76 * s], [x + 18 * s, y - 30 * s], [x + 22 * s, y + 10 * s], [x, y + 22 * s]], BLUE, { angle: 90, over: 0 }, { w: 3.5 });
      c.tint(potato(x + lean * 0.2, y - 6 * s, 9 * s, 16 * s, 7, 0.1), CYAN, { wash: 0.9 });
    };
    /** A clawed hand of mist: a round palm, three curved claws towards `dir` (degrees). */
    const hand = (x: number, y: number, s: number, dir: number, col: string) => {
      const a = (dir * Math.PI) / 180;
      for (const k of [-0.6, 0, 0.6]) {
        const b = a + k;
        shape(band([[x + Math.cos(b) * 30 * s, y + Math.sin(b) * 30 * s], [x + Math.cos(b) * 80 * s, y + Math.sin(b) * 80 * s], [x + Math.cos(b + 0.4) * 104 * s, y + Math.sin(b + 0.4) * 104 * s]], 30 * s, 8 * s), col, { over: 0 }, { w: 4 });
      }
      shape(potato(x, y, 48 * s, 44 * s, 9, 0.06), col, { angle: 60, over: 0.3 });
    };
    // the puddle of shadow it comes out of
    c.part('ombre', { pivot: [560, 900], motion: 'swing', amp: 2, period: 3, behind: true }, () => {
      shape(potato(560, 905, 330, 62, 14, 0.05), NIGHT, { angle: 5, over: 0.4, press: 1.1 });
    });
    // the far arm, raised behind on the right
    c.part('brasLoin', { pivot: [690, 440], motion: 'swing', amp: 8, period: 1.9, behind: true }, () => {
      shape(band([[680, 450], [790, 400], [860, 300]], 70, 46), DEEP, { angle: 120 });
      hand(870, 270, 0.9, -80, DEEP);
    });
    // the four smoky spikes, ghostly flames at their tips (they flicker in battle)
    c.part('pointes', { pivot: [460, 230], motion: 'nod', amp: 4, period: 1.6 }, () => {
      shape(band([[300, 270], [220, 190], [150, 160]], 110, 18), DEEP, { angle: 60 });
      shape(band([[640, 270], [730, 200], [800, 180]], 110, 18), DEEP, { angle: 60 });
      shape(band([[380, 220], [340, 120], [300, 50]], 120, 18), PURPLE, { angle: 60 });
      shape(band([[540, 220], [570, 110], [620, 40]], 120, 18), PURPLE, { angle: 60 });
      flame(146, 152, 0.8, -20);
      flame(806, 172, 0.8, 20);
      flame(298, 44, 0.9, -14);
      flame(624, 34, 0.9, 16);
    });
    // the body, rising out of the shadow and leaning forward
    const body: P[] = [[500, 900], [470, 780], [400, 660], [310, 570], [245, 450], [240, 330], [290, 240], [380, 196], [500, 190], [610, 226], [690, 320], [720, 450], [700, 590], [650, 720], [640, 830], [670, 900]];
    shape(body, PURPLE, { angle: 75, over: 0.5, press: 1.05 });
    // darker towards the shadow it comes out of
    c.tint([[500, 900], [478, 800], [560, 770], [660, 760], [648, 840], [670, 900]], NIGHT, { angle: 80, wash: 0.3, press: 0.8 });
    swirl(560, 560, 50, LAV);
    swirl(620, 360, 36, LAV, 4.5);
    // wisps of shadow climbing up from the puddle
    stroke([[420, 890], [440, 840], [420, 800]], { w: 4, col: LAV });
    stroke([[720, 890], [700, 840], [720, 790]], { w: 4, col: LAV });
    // sly red eyes, heavy brows
    c.eye(305, 352, 44, 56, RED, { lid: 0.32, skin: PURPLE, tilt: 14 });
    c.eye(458, 340, 58, 70, RED, { lid: 0.32, skin: PURPLE, tilt: -10 });
    stroke([[252, 274], [340, 300]], { w: 7 });
    stroke([[404, 262], [518, 252]], { w: 7 });
    // the huge toothy grin, laughing
    const grin: P[] = [[236, 448], [380, 466], [540, 452], [612, 420], [600, 494], [520, 556], [400, 572], [290, 540]];
    c.paper(grin);
    c.tint([[330, 540], [420, 524], [510, 534], [480, 562], [400, 568]], PINK, { wash: 0.7, angle: 90 });
    stroke([[250, 462], [276, 490], [302, 466], [330, 494], [356, 470], [384, 498], [412, 472], [440, 500], [468, 470], [496, 496], [524, 464], [552, 486], [580, 446], [600, 460]], { w: 3.5 }, false);
    c.cheek(232, 432, 26, 16, PINK);
    c.cheek(640, 412, 36, 20, PINK);
    // the near arm thrown forward, claws out
    c.part('bras', { pivot: [330, 560], motion: 'swing', amp: 10, period: 1.4 }, () => {
      shape(band([[340, 580], [230, 620], [140, 590]], 84, 60), PURPLE, { angle: 20, over: 0.3 });
      hand(100, 570, 1.35, 200, PURPLE);
    });
    // only in battle: its eyes blink
    c.part('paupieres', { pivot: [380, 345], motion: 'blink', extra: true }, () => {
      c.lid(305, 352, 44, 56, PURPLE);
      c.lid(458, 340, 58, 70, PURPLE);
    });
  },
} satisfies Redraw;
