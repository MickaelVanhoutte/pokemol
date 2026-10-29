import type { P, Redraw } from './crayon.ts';

/**
 * Poulpinceau grown up into a kraken of the depths, rearing up, turned to the left: a tall mantle swept back,
 * spotted with paint stains, big fierce eyes on bulging mounds (golden, with the flat slit pupils of an octopus)
 * under heavy brow ridges crowned with little spikes, a hooked beak between its tentacles. Each of its six
 * tentacles squirts out a ribbon of paint of its own colour, a rainbow curling all round it.
 */
export default {
  id: '114', slug: 'octopeintre', seed: 11411, size: [1150, 1100], tilt: -2,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    const VIOLET = '#7a34b0', LIGHT = '#a65fd8', DEEP = '#4e1f78', SUCKER = '#f2d6ee';
    const RED = '#e2483f', ORANGE = '#f08a3a', YELLOW = '#f6cf5a', GREEN = '#4fae5a', BLUE = '#3e6fd0', PINK = '#f49ac2';
    const suckers = (path: P[], r = 11) => path.forEach(([x, y], i) => i % 2 && i < path.length - 1 && shape(potato(x, y, r, r * 0.9, 7, 0.1), SUCKER, { over: 0 }, { w: 2.5 }));
    /** A ribbon of paint squirting out of a tentacle's tip, ending in drops. */
    const ribbon = (path: P[], col: string) => {
      shape(band(path, 38, 8), col, { angle: 40, over: 0, press: 1.15, wash: 0.6 }, { w: 3.5 });
      const [a, b] = [path[path.length - 2], path[path.length - 1]];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
      for (const [k, r] of [[34, 9], [62, 6]] as const) {
        const x = b[0] + ux * k, y = b[1] + uy * k;
        shape([[x - ux * r * 1.6, y - uy * r * 1.6], [x - uy * r, y + ux * r], [x + ux * r, y + uy * r], [x + uy * r, y - ux * r]], col, { over: 0, wash: 0.7 }, { w: 2.5 });
      }
    };
    /** A long tentacle stained with its colour towards the tip, the paint squirting out of it. */
    const tentacle = (path: P[], w0: number, col: string, paint: string, out: P[]) => {
      shape(band(path, w0, 26), col, { angle: 60, over: 0.3 });
      c.tint(band(path.slice(-2), 30, 26), paint, { wash: 0.5, angle: 30 });
      suckers(path);
      ribbon([path[path.length - 1], ...out], paint);
    };
    // the far tentacles, raised behind like a crown
    tentacle([[640, 500], [780, 430], [880, 330], [930, 220]], 84, DEEP, BLUE, [[960, 140], [930, 70], [860, 40]]);
    tentacle([[650, 580], [800, 610], [940, 580], [1030, 500]], 84, DEEP, GREEN, [[1090, 430], [1100, 350], [1060, 290]]);
    tentacle([[590, 620], [700, 770], [840, 850], [960, 860]], 84, DEEP, PINK, [[1050, 840], [1100, 780], [1090, 710]]);
    // the tall mantle, swept back, spotted with paint
    shape([[320, 520], [330, 390], [390, 270], [480, 170], [600, 100], [700, 90], [750, 160], [730, 290], [680, 430], [610, 550], [490, 620], [380, 610]], VIOLET, { angle: 70, over: 0.6, press: 1.15 });
    stroke([[700, 100], [700, 230], [660, 380]], { w: 6, col: DEEP });
    c.tint([[600, 130], [700, 110], [720, 260], [660, 420], [620, 300]], DEEP, { wash: 0.35, angle: 70 });
    for (const [x, y, r, col] of [[620, 220, 22, YELLOW], [560, 160, 13, BLUE], [660, 340, 17, PINK], [600, 450, 14, ORANGE]] as const) {
      shape(potato(x, y, r, r * 0.85, 9, 0.14), col, { over: 0 }, { w: 3 });
    }
    // the near tentacles, rearing round it
    tentacle([[440, 620], [330, 740], [250, 870], [170, 950]], 100, LIGHT, RED, [[100, 1000], [40, 980], [30, 910]]);
    tentacle([[540, 640], [550, 790], [510, 920], [430, 1000]], 96, LIGHT, ORANGE, [[350, 1050], [270, 1060], [220, 1020]]);
    // the tentacle swung up to strike, squirting yellow: in battle it lashes out
    c.part('frappe', { pivot: [360, 540], motion: 'reach', amp: -24, period: 1.8 }, () => {
      tentacle([[370, 550], [240, 520], [150, 420], [120, 290]], 100, LIGHT, YELLOW, [[110, 200], [150, 120], [230, 90]]);
    });
    // big fierce eyes, the far one smaller: golden, narrowed, with the flat slit pupils of an octopus
    for (const [x, y, s, inner] of [[352, 462, 0.78, 1], [508, 452, 1.1, -1]] as const) {
      // the upper lid slopes down towards the middle of the face: a scowl
      const eye: P[] = inner > 0
        ? [[x - 52 * s, y - 24 * s], [x + 6 * s, y - 20 * s], [x + 50 * s, y + 4 * s], [x - 6 * s, y + 26 * s]]
        : [[x - 50 * s, y + 4 * s], [x - 6 * s, y - 20 * s], [x + 52 * s, y - 24 * s], [x + 6 * s, y + 26 * s]];
      shape(eye, '#f6c83a', { over: 0, press: 1.2, wash: 0.8 }, { w: 5 });
      stroke([[x - 26 * s, y + 2 * s], [x + 14 * s, y]], { w: 12 * s, col: '#1a1024' });
      c.dot(x + 22 * s, y - 8 * s, 5 * s, 4 * s, '#ffffff');
      // a heavy brow, down towards the middle, with a little horn above
      const brow: P[] = inner > 0 ? [[x - 64 * s, y - 52 * s], [x, y - 44 * s], [x + 62 * s, y - 6 * s]] : [[x - 62 * s, y - 6 * s], [x, y - 44 * s], [x + 64 * s, y - 52 * s]];
      shape(band(brow, 30 * s, 20 * s), DEEP, { angle: 20, over: 0, press: 1.2 }, { w: 4 });
      const hx = x - inner * 44 * s, hy = y - 60 * s;
      shape([[hx - 16 * s, hy + 6 * s], [hx - inner * 22 * s, hy - 50 * s], [hx + 16 * s, hy + 2 * s]], DEEP, { over: 0 }, { w: 3.5 });
    }
    // a wide frowning mouth full of little teeth
    const mouth: P[] = [[372, 552], [440, 536], [512, 550], [498, 588], [440, 604], [384, 588]];
    shape(mouth, '#24102c', { over: 0, press: 1.5, wash: 1, miss: 0 }, { w: 4 });
    for (const [x, top] of [[392, 1], [430, 1], [470, 1], [410, 0], [452, 0]] as const) {
      const t = 542 + Math.abs(x + 13 - 442) * 0.2, bt = 598 - Math.abs(x + 13 - 442) * 0.3;
      c.paper(top ? [[x, t], [x + 26, t], [x + 13, t + 30]] : [[x, bt], [x + 26, bt], [x + 13, bt - 24]], { w: 3 }, false);
    }
    // bubbles
    for (const [x, y, r] of [[280, 200, 16], [330, 130, 10], [820, 230, 13]] as const) c.paper(potato(x, y, r, r, 8, 0.05), { w: 3.5 });
  },
} satisfies Redraw;
