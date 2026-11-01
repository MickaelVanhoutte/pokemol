import type { P, Redraw } from './crayon.ts';

/**
 * A bigger puff of purple mist turned to the left, its head floating on its own. From her drawing it keeps the purple,
 * the points on its head, the floating clawed hands and the toothy grin. It is a soft cloud now: three curls of smoke
 * for a crown (Brumouille's quiff, grown), a wispy tail instead of a body, big mitten hands of mist floating apart,
 * sly red eyes and a long ghostly tongue hanging out of its grin.
 */
export default {
  id: '010', slug: 'grimouille', seed: 10127, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    const PURPLE = '#8152cc', DEEP = '#583492', LAV = '#c3a2f0', MIST = '#d6c2f6', RED = '#e0453a', PINK = '#f07aa8';
    const cloud = (cx: number, cy: number, rx: number, ry: number, lumps: number, h = 0.1): P[] =>
      Array.from({ length: lumps * 4 }, (_, i) => {
        const a = (i / (lumps * 4)) * Math.PI * 2, k = 1 + h * Math.abs(Math.sin((a * lumps) / 2)) + c.j(0.015);
        return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
      });
    const swirl = (x: number, y: number, r: number, col: string, w = 5) =>
      stroke(Array.from({ length: 9 }, (_, i): P => {
        const a = i * 0.8, rr = r * (1 - i / 11);
        return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8];
      }), { w, col });
    /** A floating mitten of mist: a round palm, three rounded claws towards `dir` (degrees), a wisp at the cuff. */
    const mitten = (x: number, y: number, s: number, dir: number, col: string) => {
      const a = (dir * Math.PI) / 180, u: P = [Math.cos(a), Math.sin(a)];
      shape(band([[x - u[0] * 60 * s, y - u[1] * 60 * s], [x - u[0] * 120 * s + 20 * s, y - u[1] * 120 * s + 30 * s]], 50 * s, 12 * s), LAV, { over: 0, wash: 0.5 }, { w: 3.5 });
      for (const k of [-0.55, 0, 0.55]) {
        const b = a + k, tip: P = [x + Math.cos(b) * 78 * s, y + Math.sin(b) * 78 * s];
        shape(band([[x + Math.cos(b) * 30 * s, y + Math.sin(b) * 30 * s], tip], 34 * s, 22 * s), col, { over: 0 }, { w: 4 });
        shape(potato(tip[0], tip[1], 13 * s, 13 * s, 7, 0.05), col, { over: 0 }, { w: 4 });
      }
      shape(potato(x, y, 50 * s, 46 * s, 9, 0.06), col, { angle: 60, over: 0.3 });
      swirl(x, y, 18 * s, LAV, 3.5);
    };
    // the mist it trails, drifting off to the right
    c.part('brume', { pivot: [560, 560], motion: 'swing', amp: 5, period: 3.2, behind: true }, () => {
      c.tint(potato(600, 600, 400, 320, 14, 0.12), MIST, { gap: 6, w: 4.5, angle: 15, spill: 0, miss: 0.3, wash: 0.05 });
    });
    // the far hand, floating behind on the right
    c.part('mainLoin', { pivot: [860, 470], motion: 'swing', amp: 9, period: 1.7, phase: 0.4, behind: true }, () => mitten(880, 440, 1.1, -40, DEEP));
    // a wispy tail in place of a body, curling away down to the right
    c.part('queue', { pivot: [560, 640], motion: 'swing', amp: 8, period: 2.1, behind: true }, () => {
      shape(band([[520, 600], [580, 720], [680, 800], [790, 800], [830, 740], [790, 700]], 230, 30), PURPLE, { angle: 30, over: 0.4 });
      swirl(780, 750, 30, LAV, 4.5);
    });
    // the crown: three curls of smoke (they bob in battle)
    c.part('meches', { pivot: [470, 230], motion: 'nod', amp: 6, period: 1.5 }, () => {
      shape(band([[590, 250], [640, 170], [620, 100], [570, 90], [560, 140], [595, 140]], 80, 26), DEEP, { angle: 60, over: 0.3 });
      shape(band([[350, 250], [300, 170], [230, 150], [190, 190], [220, 230], [255, 205]], 80, 26), DEEP, { angle: 60, over: 0.3 });
      shape(band([[470, 240], [470, 130], [420, 70], [360, 80], [355, 135], [400, 135]], 100, 30), PURPLE, { angle: 60, over: 0.3 });
      swirl(400, 110, 28, LAV, 4.5);
    });
    // the big floating head of mist
    shape(cloud(470, 420, 300, 235, 8), PURPLE, { angle: 75, over: 0.5, press: 1.05 });
    c.tint(potato(600, 320, 130, 80, 9, 0.1), LAV, { angle: 40, wash: 0.25 });
    swirl(660, 380, 48, LAV);
    swirl(640, 560, 36, LAV, 4.5);
    // sly red eyes, half closed from the top, and cheeky brows
    c.eye(262, 398, 44, 56, RED, { lid: 0.3, skin: PURPLE, tilt: 14 });
    c.eye(430, 386, 58, 72, RED, { lid: 0.3, skin: PURPLE, tilt: -10 });
    stroke([[214, 320], [300, 344]], { w: 5.5 });
    stroke([[380, 308], [490, 300]], { w: 5.5 });
    // the toothy grin, its long tongue hanging out to the left
    const grin: P[] = [[220, 500], [360, 520], [500, 506], [560, 482], [544, 548], [470, 600], [360, 614], [262, 580]];
    c.paper(grin);
    stroke([[236, 512], [262, 536], [290, 514], [318, 540], [346, 518], [374, 544], [402, 520], [430, 544], [458, 516], [486, 538], [512, 506], [536, 522]], { w: 3.5 }, false);
    c.part('langue', { pivot: [330, 590], motion: 'swing', amp: 8, period: 1.2 }, () => {
      shape(band([[340, 580], [290, 640], [220, 690], [160, 680], [150, 640]], 74, 54), PINK, { angle: 30, over: 0.2 });
      stroke([[300, 620], [220, 668]], { w: 3.5, col: '#c4507e' });
    });
    c.cheek(196, 480, 30, 20, PINK);
    c.cheek(590, 466, 42, 24, PINK);
    // the near hand, floating in front, raised to say boo
    c.part('main', { pivot: [140, 440], motion: 'swing', amp: 12, period: 1.3 }, () => mitten(120, 400, 1.4, -115, PURPLE));
    // only in battle: its eyes blink
    c.part('paupieres', { pivot: [350, 390], motion: 'blink', extra: true }, () => {
      c.lid(262, 398, 44, 56, PURPLE);
      c.lid(430, 386, 58, 72, PURPLE);
    });
  },
} satisfies Redraw;
