import type { P, Redraw } from './crayon.ts';

/**
 * Floconnet grown up, as sweet as ever: a tall snow lynx sitting proud, turned to the left, in the same white and
 * pale blue pencil. Its big round eyes, blue cheeks and forehead snowflake stay; new are the long ears tipped
 * with ice crystals, a soft collar of snow fluff with little icicles, frost wings growing on its back, and its
 * pom-pom tail grown long and curled, a snowball at its tip.
 */
export default {
  id: '109', slug: 'givrelynx', seed: 10907, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, band, potato } = c;
    const SNOW = '#d4ebfa', ICE = '#9fd0f2', BLUE = '#4f8fd6', DEEP = '#2f5f9e', CRYSTAL = '#eef8ff', CHEEK = '#7fb8ec';
    const flake = (x: number, y: number, r: number, w = 4.5) => {
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI + 0.2;
        stroke([[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { w, col: BLUE });
      }
    };
    const crystal = (x: number, y: number, rx: number, ry: number) =>
      shape([[x, y - ry], [x + rx, y], [x, y + ry * 0.6], [x - rx, y]], CRYSTAL, { over: 0, wash: 0.6 }, { col: BLUE, w: 3.5 }, false);
    // the long curled tail, its pom-pom grown into a snowball
    c.part('queue', { pivot: [790, 820], motion: 'swing', amp: 10, period: 2.1, behind: true }, () => {
      shape(band([[760, 840], [880, 760], [920, 620], [880, 500]], 96, 74), SNOW, { angle: 60, over: 0.3 });
      shape(potato(870, 440, 92, 88, 11, 0.07), SNOW, { angle: 40, over: 0.3 });
      flake(870, 440, 34);
    });
    // frost wings growing on its back: in battle they flutter
    c.part('ailes', { pivot: [640, 500], motion: 'flap', amp: 12, period: 1.4, behind: true }, () => {
      shape([[600, 500], [660, 330], [720, 250], [740, 360], [800, 300], [790, 430], [700, 520]], CRYSTAL, { angle: 60, over: 0, wash: 0.5 }, { col: BLUE }, false);
      stroke([[640, 470], [700, 330]], { w: 3.5, col: ICE });
      stroke([[680, 480], [770, 360]], { w: 3.5, col: ICE });
    });
    // the far front leg and paw, behind
    shape(band([[400, 640], [390, 790], [385, 890]], 72, 64), ICE, { angle: 90 });
    shape(potato(372, 905, 60, 32, 8, 0.06), ICE, { angle: 10 });
    // the body, sitting tall
    const body: P[] = [[440, 450], [610, 440], [760, 560], [830, 740], [780, 890], [580, 925], [440, 890], [390, 710]];
    shape(body, SNOW, { angle: 80, over: 0.45 });
    c.tint(potato(560, 760, 120, 120, 10, 0.05), '#ffffff', { wash: 0.9, angle: 80 });
    flake(690, 640, 30);
    // the folded hind leg and its paw
    shape(potato(700, 800, 125, 105, 11, 0.04), SNOW, { angle: 60, over: 0.3 });
    shape(potato(650, 915, 78, 36, 9, 0.06), SNOW, { angle: 10 });
    // the near front leg, long and straight
    shape(band([[510, 650], [512, 790], [506, 895]], 82, 74), SNOW, { angle: 90 });
    shape(potato(500, 912, 70, 36, 9, 0.06), SNOW, { angle: 10 });
    stroke([[478, 920], [480, 945]], { w: 3.5 });
    stroke([[518, 922], [518, 946]], { w: 3.5 });
    // the collar of snow fluff, little icicles hanging from it
    const collar: P[] = [];
    for (let i = 0; i <= 14; i++) {
      const a = -0.5 + (i / 14) * 3.9, r = i % 2 ? 160 : 205;
      collar.push([390 + Math.cos(a) * r, 470 + Math.sin(a) * r * 0.9]);
    }
    shape(collar, CRYSTAL, { angle: 80, over: 0, wash: 0.5 });
    for (const [x, y] of [[300, 640], [370, 660], [450, 650]] as const) shape([[x - 12, y - 20], [x + 12, y - 20], [x, y + 34]], ICE, { over: 0 }, { col: BLUE, w: 3 }, false);
    // long ears tipped with ice crystals
    shape([[170, 280], [140, 90], [290, 200]], SNOW, { angle: 70 }, {}, false);
    shape([[185, 250], [165, 140], [255, 205]], ICE, { angle: 70, over: 0 }, { w: 3.5 }, false);
    crystal(140, 72, 18, 40);
    shape([[400, 200], [500, 20], [540, 250]], SNOW, { angle: 70 }, {}, false);
    shape([[430, 200], [495, 85], [512, 230]], ICE, { angle: 70, over: 0 }, { w: 3.5 }, false);
    crystal(500, 2, 22, 46);
    // the round head, a little longer than before
    shape(potato(330, 345, 205, 175, 14, 0.03), SNOW, { angle: 78, over: 0.45 });
    // the forehead snowflake, bigger, with a crystal in its middle
    flake(345, 235, 46, 5);
    crystal(345, 240, 14, 22);
    // big round eyes with a lash, blue cheeks, a tiny nose and a smile
    for (const [x, y, rx, ry] of [[225, 355, 32, 44], [395, 350, 44, 54]] as const) {
      shape(potato(x, y, rx, ry, 10, 0.03), DEEP, { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
      dot(x - rx * 0.3, y - ry * 0.35, rx * 0.32, ry * 0.26, '#ffffff');
      dot(x + rx * 0.25, y + ry * 0.3, rx * 0.14, ry * 0.12, '#ffffff');
      stroke([[x + rx * 0.7, y - ry * 0.6], [x + rx * 1.1, y - ry * 0.9]], { w: 4 });
    }
    shape(potato(180, 440, 30, 18, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    shape(potato(470, 440, 40, 22, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    dot(290, 420, 12, 9, BLUE);
    stroke([[250, 455], [272, 472], [292, 440], [314, 472], [338, 455]], { w: 4.5 });
    // only in battle: its eyes blink
    c.part('paupieres', { pivot: [310, 352], motion: 'blink', extra: true }, () => {
      for (const [x, y, rx, ry] of [[225, 355, 34, 46], [395, 350, 46, 56]] as const) {
        shape(potato(x, y, rx, ry, 10, 0.02), SNOW, { over: 0, wash: 1 }, { w: 0.1 });
        stroke([[x - rx, y + 4], [x - rx * 0.4, y + ry * 0.35], [x + rx * 0.4, y + ry * 0.35], [x + rx, y + 4]], { w: 5 });
      }
    });
  },
} satisfies Redraw;
