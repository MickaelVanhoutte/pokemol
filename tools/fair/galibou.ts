import type { Colour, Fair, Line, P } from '../redraws/crayon.ts';

/**
 * Galibou's fair copy, Rock/Psychic, the same drawing grown up: the wings painted on its sides have grown
 * out into big spread wings (the stone that dreamt of flying, held up by its mind), painted teal with layered
 * feathers; its painted eyes bigger, a ring of psychic pink painted inside the orange, fierce painted brows over them
 * and a pink diamond between; its ear tufts longer, a sharper hooked beak, longer painted talons, and the gold star
 * painted on its front.
 */
export default {
  id: '107', slug: 'galibou', seed: 107107, size: [1080, 1000], tilt: -3,
  draw(c) {
    // the whole drawing sits a little to the right on the sheet, to make room for its far wing
    const DX = 30;
    const T = (pts: P[]): P[] => pts.map(([x, y]) => [x + DX, y]);
    const shape = (pts: P[], col: string, o?: Colour, l?: Line, round?: boolean) => c.shape(T(pts), col, o, l, round);
    const paper = (pts: P[], l?: Line, round?: boolean) => c.paper(T(pts), l, round);
    const stroke = (pts: P[], l?: Line, round?: boolean) => c.stroke(T(pts), l, round);
    const dot = (x: number, y: number, rx: number, ry?: number, col?: string) => c.dot(x + DX, y, rx, ry, col);
    const { potato, rnd } = c;
    const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    /** A spread wing: from its root on the stone up to the wrist, its long feathers fanned out, painted in layers. */
    const wing = (r1: P, lead: P, w: P, tips: P[], r2: P) => {
      // its long feathers, the lowest first, each from the hand out to its rounded tip
      const hand = lerp(r1, r2, 0.75);
      tips.map((t, i) => [lerp(w, hand, (i / (tips.length - 1)) * 0.75), t] as [P, P]).reverse().forEach(([b, t]) => {
        const dx = t[0] - b[0], dy = t[1] - b[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l, s1: P[] = [], s2: P[] = [];
        for (let k = 1; k < 8; k++) {
          const u = k / 8, h = 52 * Math.min(1, u / 0.3) * (u > 0.75 ? Math.sqrt(1 - ((u - 0.75) / 0.25) ** 2) : 1);
          s1.push([b[0] + dx * u + nx * h, b[1] + dy * u + ny * h]);
          s2.push([b[0] + dx * u - nx * h, b[1] + dy * u - ny * h]);
        }
        shape([b, ...s1, t, ...s2.reverse()], TEAL, { angle: (Math.atan2(dy, dx) * 180) / Math.PI + 70, over: 0.2 });
        stroke([lerp(b, t, 0.15), lerp(b, t, 0.85)], { w: 5, col: DTEAL });
      });
      // the arm and the small feathers along the top of the wing, a lighter teal, their scalloped edge painted white
      const edge: P[] = [lerp(w, tips[0], 0.45), lerp(w, tips[2], 0.5), lerp(r2, tips[4], 0.45), r2];
      shape([r1, lead, w, ...edge], '#79cfc6', { angle: 20, over: 0 });
      for (let k = 0; k < 2; k++) {
        const a = edge[k], b = edge[k + 1], m = lerp(lerp(a, b, 0.5), w, -0.16);
        stroke([a, m, b], { w: 5, col: '#ffffff' });
      }
      for (const t of [0.35, 0.65]) dot(...lerp(lerp(r1, w, t), edge[1], 0.4), 8, 8, '#ffffff');
    };
    /** The far wing, a little smaller: farther away. */
    const far = (pts: P[]): P[] => pts.map(([x, y]) => [325 + (x - 325) * 0.85, 555 + (y - 555) * 0.85]);
    const STONE = '#aaa69e', SPECK = '#7d7a74', CORAL = '#f4a582', CREAMY = '#f6dcae', TEAL = '#3fa7a0', ORANGE = '#f08a2c', TUFT = '#7a5236';
    const PSY = '#d9529e', DTEAL = '#26746f';
    const EYES: [number, number, number][] = [[388, 438, 70], [535, 420, 86]];
    // the far wing, grown out from the edge of the stone behind it: in battle it beats
    c.part('aile-loin', { pivot: [320 + DX, 560], motion: 'flap', amp: -10, period: 0.9, behind: true }, () => {
      const [r1, lead, w, r2, ...tips] = far([[330, 470], [250, 360], [150, 255], [320, 640], [20, 200], [-30, 310], [-30, 420], [15, 525], [95, 605]]);
      wing(r1, lead, w, tips, r2);
    });
    // the pebble, rounder at the bottom
    const pebble: P[] = [[480, 260], [610, 285], [700, 380], [740, 540], [720, 700], [640, 820], [500, 860], [360, 830], [280, 720], [262, 560], [300, 390], [380, 290]];
    shape(pebble, STONE, { angle: 70, over: 0.4 });
    for (let k = 0; k < 40; k++) {
      const x = 300 + rnd() * 420, y = 300 + rnd() * 540;
      if (((x - 500) / 230) ** 2 + ((y - 560) / 280) ** 2 < 0.85) dot(x, y, 2.5 + rnd() * 2, 2 + rnd() * 2, SPECK);
    }
    // its painted front: coral, rows of painted feathers, a ring of dots
    shape(potato(450, 655, 155, 172, 11, 0.04), CORAL, { angle: 20, over: 0.3 });
    shape(potato(440, 685, 106, 122, 10, 0.04), CREAMY, { angle: 0, over: 0.2 });
    for (let r = 0; r < 3; r++) {
      for (let k = 0; k < 3; k++) {
        const x = 392 + k * 48 + (r % 2) * 22, y = 604 + r * 46;
        stroke([[x - 19, y - 8], [x - 11, y + 10], [x, y + 17], [x + 11, y + 10], [x + 19, y - 8]], { w: 5.5, col: r % 2 ? TEAL : ORANGE });
      }
    }
    c.star(442 + DX, 760, 42, -4);
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      dot(450 + Math.cos(a) * 172, 655 + Math.sin(a) * 188, 7.5, 7.5, ['#ffffff', TEAL, ORANGE][k % 3]);
    }
    // longer painted ear tufts, swept out
    for (const t of [[[350, 348], [276, 186], [418, 328]], [[532, 320], [618, 168], [616, 334]]] as P[][]) {
      shape(t, TUFT, { over: 0 }, { w: 4 }, false);
      stroke([[(t[0][0] + t[2][0]) / 2, (t[0][1] + t[2][1]) / 2 - 6], [t[1][0] * 0.7 + t[2][0] * 0.3, t[1][1] * 0.7 + t[2][1] * 0.3 + 10]], { w: 3.5, col: '#5a3a22' });
    }
    // big painted eyes ringed with orange and psychic pink, the far one smaller
    for (const [x, y, r] of EYES) {
      shape(potato(x, y, r, r, 12, 0.02), ORANGE, { over: 0, press: 1.1 });
      shape(potato(x, y, r * 0.76, r * 0.76, 12, 0.02), PSY, { over: 0, press: 1.05 }, { w: 3.5 });
      paper(potato(x, y, r * 0.6, r * 0.6, 12, 0.02));
      dot(x - r * 0.1, y + r * 0.06, r * 0.34, r * 0.36);
      dot(x - r * 0.2, y - r * 0.1, r * 0.11, r * 0.11, '#ffffff');
    }
    // fierce painted brows slanting down to the beak, a pink diamond painted between them
    const brows = () => {
      shape([[306, 372], [330, 346], [446, 388], [438, 410]], TUFT, { over: 0 }, { w: 4 }, false);
      shape([[466, 392], [458, 368], [612, 306], [628, 336]], TUFT, { over: 0 }, { w: 4 }, false);
    };
    brows();
    shape([[452, 330], [470, 296], [488, 330], [470, 362]], PSY, { over: 0 }, { w: 4 }, false);
    // a sharper hooked beak
    shape([[436, 478], [498, 472], [490, 520], [462, 560], [470, 515]], ORANGE, { over: 0 }, { w: 4 }, false);
    // longer painted talons at the bottom
    for (const x of [410, 520]) stroke([[x - 30, 846], [x, 800], [x + 30, 846], [x, 800], [x, 852]], { w: 7, col: ORANGE }, false);
    // the varnish shining
    stroke([[640, 360], [680, 420], [700, 490]], { w: 10, col: '#ffffff' });
    stroke([[660, 530], [668, 560]], { w: 8, col: '#ffffff' });
    // the near wing, grown out from its side and spread wide, painted with layered feathers: in battle it beats
    c.part('aile-peinte', { pivot: [650 + DX, 560], motion: 'flap', amp: 10, period: 0.9 }, () => {
      wing([630, 470], [720, 370], [830, 250], [[950, 190], [1005, 300], [1005, 420], [960, 530], [880, 610]], [650, 640]);
    });
    // only in battle: its painted eyes blink
    c.part('paupiere', { pivot: [460 + DX, 430], motion: 'blink', extra: true }, () => {
      for (const [x, y, r] of EYES) {
        shape(potato(x, y, r * 1.02, r * 1.02, 12, 0.02), STONE, { over: 0, wash: 1 });
        stroke([[x - r * 0.8, y + 4], [x - r * 0.3, y + r * 0.35], [x + r * 0.3, y + r * 0.35], [x + r * 0.8, y + 4]], { w: 6, col: ORANGE });
      }
      brows();
    });
  },
} satisfies Fair;
