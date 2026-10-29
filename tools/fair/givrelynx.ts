import type { Fair, P } from '../redraws/crayon.ts';

/**
 * Givrelynx's fair copy, Ice, the same drawing grown up and still as sweet: its frost wings spread wide with
 * more crystal points, the ice crystals on its ears twice as big, longer icicles hanging from its snow collar,
 * a crown of frost on its forehead snowflake, little crystals bristling round the snowball of its tail,
 * determined brows over its big round eyes, and the gold star on its flank.
 */
export default {
  id: '109', slug: 'givrelynx', seed: 109109, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const SNOW = '#d4ebfa', ICE = '#9fd0f2', BLUE = '#4f8fd6', DEEP = '#2f5f9e', CRYSTAL = '#eef8ff', CHEEK = '#7fb8ec';
    const flake = (x: number, y: number, r: number, w = 4.5) => {
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI + 0.2;
        stroke([[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { w, col: BLUE });
      }
    };
    const crystal = (x: number, y: number, rx: number, ry: number) => {
      shape([[x, y - ry], [x + rx, y], [x, y + ry * 0.6], [x - rx, y]], CRYSTAL, { over: 0, wash: 0.6 }, { col: BLUE, w: 4 }, false);
      c.shine([[x - rx * 0.3, y - ry * 0.4], [x - rx * 0.1, y - ry * 0.7]], 5);
    };
    // the long curled tail, little crystals bristling round its snowball
    c.part('queue', { pivot: [790, 820], motion: 'swing', amp: 10, period: 2.1, behind: true }, () => {
      shape(band([[760, 840], [880, 760], [920, 620], [880, 500]], 100, 78), SNOW, { angle: 60, over: 0.3 });
      for (let k = 0; k < 6; k++) {
        const a = -2.6 + k * 0.62;
        crystal(870 + Math.cos(a) * 100, 440 + Math.sin(a) * 96, 14, 30);
      }
      shape(potato(870, 440, 96, 92, 11, 0.07), SNOW, { angle: 40, over: 0.3 });
      flake(870, 440, 38);
    });
    // its frost wings spread wide, more crystal points: in battle they beat
    c.part('ailes', { pivot: [640, 500], motion: 'flap', amp: 14, period: 1.4, behind: true }, () => {
      shape([[600, 510], [630, 330], [690, 150], [740, 300], [810, 170], [830, 320], [920, 250], [880, 430], [960, 420], [840, 520], [700, 540]], CRYSTAL, { angle: 60, over: 0, wash: 0.55 }, { col: BLUE }, false);
      for (const t of [[690, 170], [810, 190], [910, 270], [940, 425]] as P[]) stroke([[660, 500], t], { w: 3.5, col: ICE });
      c.shine([[700, 240], [712, 300]], 6);
    });
    // the far front leg and paw, behind
    shape(band([[400, 640], [390, 790], [385, 890]], 74, 66), ICE, { angle: 90 });
    shape(potato(372, 905, 62, 32, 8, 0.06), ICE, { angle: 10 });
    // the body, sitting tall
    const body: P[] = [[440, 450], [610, 440], [760, 560], [830, 740], [780, 890], [580, 925], [440, 890], [390, 710]];
    shape(body, SNOW, { angle: 80, over: 0.45 });
    c.tint(potato(560, 760, 120, 120, 10, 0.05), '#ffffff', { wash: 0.9, angle: 80 });
    flake(700, 610, 30);
    // the folded hind leg and its paw
    shape(potato(700, 800, 128, 108, 11, 0.04), SNOW, { angle: 60, over: 0.3 });
    shape(potato(650, 915, 80, 36, 9, 0.06), SNOW, { angle: 10 });
    c.star(708, 795, 46, 6);
    // the near front leg, long and straight
    shape(band([[510, 650], [512, 790], [506, 895]], 84, 76), SNOW, { angle: 90 });
    shape(potato(500, 912, 72, 36, 9, 0.06), SNOW, { angle: 10 });
    stroke([[478, 920], [480, 945]], { w: 3.5 });
    stroke([[518, 922], [518, 946]], { w: 3.5 });
    // the collar of snow fluff, longer icicles hanging from it
    const collar: P[] = [];
    for (let i = 0; i <= 14; i++) {
      const a = -0.5 + (i / 14) * 3.9, r = i % 2 ? 165 : 215;
      collar.push([390 + Math.cos(a) * r, 470 + Math.sin(a) * r * 0.9]);
    }
    shape(collar, CRYSTAL, { angle: 80, over: 0, wash: 0.5 });
    for (const [x, y, h] of [[260, 630, 56], [320, 655, 72], [385, 668, 64], [450, 655, 76], [510, 630, 52]] as const) {
      shape([[x - 14, y - 22], [x + 14, y - 22], [x, y + h]], ICE, { over: 0 }, { col: BLUE, w: 3.5 }, false);
    }
    // long ears, their ice crystals twice as big
    shape([[170, 280], [140, 90], [290, 200]], SNOW, { angle: 70 }, {}, false);
    shape([[185, 250], [165, 140], [255, 205]], ICE, { angle: 70, over: 0 }, { w: 3.5 }, false);
    crystal(138, 70, 30, 62);
    shape([[400, 200], [500, 30], [540, 250]], SNOW, { angle: 70 }, {}, false);
    shape([[430, 200], [495, 95], [512, 230]], ICE, { angle: 70, over: 0 }, { w: 3.5 }, false);
    crystal(500, 66, 34, 64);
    // the round head
    shape(potato(330, 345, 208, 178, 14, 0.03), SNOW, { angle: 78, over: 0.45 });
    // the forehead snowflake under a crown of frost
    flake(345, 238, 50, 5.5);
    for (const [dx, h] of [[-36, 30], [0, 46], [36, 30]] as const) crystal(345 + dx, 196 - h * 0.4, 12, h);
    // big round eyes with a lash, determined little brows, blue cheeks, a tiny nose and a smile
    for (const [x, y, rx, ry] of [[225, 355, 32, 44], [395, 350, 44, 54]] as const) {
      shape(potato(x, y, rx, ry, 10, 0.03), DEEP, { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
      dot(x - rx * 0.3, y - ry * 0.35, rx * 0.32, ry * 0.26, '#ffffff');
      dot(x + rx * 0.25, y + ry * 0.3, rx * 0.14, ry * 0.12, '#ffffff');
      stroke([[x + rx * 0.7, y - ry * 0.6], [x + rx * 1.1, y - ry * 0.9]], { w: 4 });
      stroke([[x - rx * 0.9, y - ry * 1.1], [x + rx * 0.6, y - ry * 1.25]], { w: 6, col: DEEP });
    }
    shape(potato(180, 440, 30, 18, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    shape(potato(470, 440, 40, 22, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    dot(290, 420, 12, 9, BLUE);
    stroke([[250, 455], [272, 472], [292, 440], [314, 472], [338, 455]], { w: 4.5 });
    // only in battle: frost sparkles round it (drawn last, the card stays the same)
    c.part('givre', { pivot: [500, 500], motion: 'flicker', period: 2.4, extra: true }, () => {
      for (const [x, y, r] of [[90, 560, 24], [600, 300, 20], [960, 700, 22], [250, 820, 18]] as const) {
        shape([[x, y - r], [x + r / 4, y - r / 4], [x + r, y], [x + r / 4, y + r / 4], [x, y + r], [x - r / 4, y + r / 4], [x - r, y], [x - r / 4, y - r / 4]], CRYSTAL, { over: 0 }, { col: BLUE, w: 3 }, false);
      }
    });
  },
} satisfies Fair;
