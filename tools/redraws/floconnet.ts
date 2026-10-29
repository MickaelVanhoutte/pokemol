import type { P, Redraw } from './crayon.ts';

/**
 * A little snow kitten drawn in white and pale blue pencil, sitting, turned to the left: a round snowball body,
 * big ears with blue insides, a snowflake on its forehead, frosty blue cheeks and a pom-pom tail like a snowball.
 */
export default {
  id: '108', slug: 'floconnet', seed: 10811, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const SNOW = '#d4ebfa', ICE = '#9fd0f2', BLUE = '#4f8fd6', CHEEK = '#7fb8ec';
    const flake = (x: number, y: number, r: number, w = 4.5) => {
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI + 0.2;
        stroke([[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { w, col: BLUE });
      }
    };
    // the far paw and the far ear, behind
    shape(potato(330, 840, 62, 40, 8, 0.06), SNOW, { angle: 10 });
    shape([[200, 330], [170, 150], [320, 250]], SNOW, { angle: 70 }, {}, false);
    shape([[214, 300], [200, 200], [282, 255]], ICE, { angle: 70, over: 0 }, { w: 3.5 }, false);
    // the pom-pom tail, a snowball that wags
    c.part('queue', { pivot: [790, 700], motion: 'swing', amp: 12, period: 1.7, behind: true }, () => {
      shape(potato(850, 640, 82, 78, 11, 0.07), SNOW, { angle: 40, over: 0.3 });
      flake(850, 640, 30, 4);
    });
    // the round snowball body
    shape(potato(600, 660, 240, 215, 14, 0.035), SNOW, { angle: 80, over: 0.5 });
    c.tint(potato(560, 740, 150, 110, 11, 0.05), '#ffffff', { wash: 0.9, angle: 80 });
    // the near ear
    shape([[420, 250], [520, 70], [570, 300]], SNOW, { angle: 70 }, {}, false);
    shape([[452, 250], [515, 135], [540, 280]], ICE, { angle: 70, over: 0 }, { w: 3.5 }, false);
    // a big round head
    const head: P[] = potato(380, 420, 225, 195, 14, 0.03);
    shape(head, SNOW, { angle: 78, over: 0.45 });
    // the snowflake on its forehead
    flake(400, 300, 38, 5);
    dot(400, 300, 7, 7, BLUE);
    // big oval eyes shifted left (the far one smaller), frosty cheeks, a tiny nose and mouth
    for (const [x, y, rx, ry] of [[262, 430, 34, 48], [430, 425, 46, 58]] as const) {
      shape(potato(x, y, rx, ry, 10, 0.03), '#2f5f9e', { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
      dot(x - rx * 0.3, y - ry * 0.35, rx * 0.32, ry * 0.26, '#ffffff');
      dot(x + rx * 0.25, y + ry * 0.3, rx * 0.14, ry * 0.12, '#ffffff');
    }
    shape(potato(215, 520, 32, 20, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    shape(potato(505, 520, 42, 24, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
    dot(340, 500, 11, 8, BLUE);
    stroke([[300, 540], [322, 556], [342, 522], [364, 556], [388, 538]], { w: 4.5 });
    // the near front paw, with little toes
    shape(potato(470, 850, 72, 44, 9, 0.06), SNOW, { angle: 10 });
    stroke([[450, 860], [452, 885]], { w: 3.5 });
    stroke([[490, 860], [490, 886]], { w: 3.5 });
    // a few snowflakes floating around it
    flake(150, 640, 18, 3.5);
    flake(860, 330, 22, 3.5);
    // only in battle: its eyes blink
    c.part('paupieres', { pivot: [350, 428], motion: 'blink', extra: true }, () => {
      for (const [x, y, rx, ry] of [[262, 430, 36, 50], [430, 425, 48, 60]] as const) {
        shape(potato(x, y, rx, ry, 10, 0.02), SNOW, { over: 0, wash: 1 }, { w: 0.1 });
        stroke([[x - rx, y + 4], [x - rx * 0.4, y + ry * 0.35], [x + rx * 0.4, y + ry * 0.35], [x + rx, y + 4]], { w: 5 });
      }
    });
  },
} satisfies Redraw;
