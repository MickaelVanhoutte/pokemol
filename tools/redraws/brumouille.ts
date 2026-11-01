import type { P, Redraw } from './crayon.ts';

/**
 * A little puff of purple mist turned to the left. From her drawing it keeps the purple fog, the red eyes and the big
 * grin; it is no longer a round ball: a soft cloud with a curl of smoke on top like a quiff, two little mist paws, a
 * smoky tail curling behind, pale swirls on its body and a pink tongue in its grin.
 */
export default {
  id: '009', slug: 'brumouille', seed: 9113, size: [1000, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    const PURPLE = '#8a58d2', DEEP = '#5f3a9e', LAV = '#c3a2f0', MIST = '#d6c2f6', RED = '#e0453a', PINK = '#f07aa8';
    /** A cloud: an oval with soft lumps all round. */
    const cloud = (cx: number, cy: number, rx: number, ry: number, lumps: number, h = 0.07): P[] =>
      Array.from({ length: lumps * 4 }, (_, i) => {
        const a = (i / (lumps * 4)) * Math.PI * 2, k = 1 + h * Math.abs(Math.sin((a * lumps) / 2)) + c.j(0.015);
        return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
      });
    const swirl = (x: number, y: number, r: number, col: string, w = 5) =>
      stroke(Array.from({ length: 9 }, (_, i): P => {
        const a = i * 0.8, rr = r * (1 - i / 11);
        return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8];
      }), { w, col });
    // the mist it leaves behind, drifting off to the right
    c.part('brume', { pivot: [560, 520], motion: 'swing', amp: 5, period: 3.2, behind: true }, () => {
      c.tint(potato(600, 540, 380, 300, 14, 0.12), MIST, { gap: 6, w: 4.5, angle: 15, spill: 0, miss: 0.3, wash: 0.05 });
    });
    // the smoky tail curling up behind
    c.part('queue', { pivot: [640, 660], motion: 'swing', amp: 10, period: 1.9, behind: true }, () => {
      shape(band([[600, 640], [720, 740], [830, 730], [870, 650], [820, 600], [770, 630]], 120, 26), PURPLE, { angle: 30, over: 0.4 });
      swirl(800, 680, 34, LAV, 4.5);
    });
    // the far paw, peeking out on the right
    shape(potato(700, 560, 62, 46, 8, 0.08), DEEP, { angle: 60 });
    // the soft cloud of a body
    shape(cloud(470, 480, 255, 225, 7, 0.1), PURPLE, { angle: 75, over: 0.5, press: 1.05 });
    c.tint(potato(560, 380, 120, 80, 9, 0.1), LAV, { angle: 40, wash: 0.25 });
    swirl(640, 420, 46, LAV);
    swirl(590, 630, 36, LAV, 4.5);
    // the curl of smoke on its head, like a quiff (it bobs in battle)
    c.part('meche', { pivot: [470, 280], motion: 'nod', amp: 7, period: 1.4 }, () => {
      shape(band([[500, 290], [480, 200], [420, 150], [350, 160], [330, 220], [380, 248], [415, 215]], 92, 30), PURPLE, { angle: 60, over: 0.3 });
      swirl(410, 200, 30, LAV, 4.5);
    });
    // the face shifted left: big shiny red eyes (the far one smaller), cheeky brows
    c.eye(292, 430, 40, 54, RED);
    c.eye(438, 418, 54, 68, RED);
    stroke([[258, 362], [320, 372]], { w: 5 });
    stroke([[400, 336], [480, 340]], { w: 5 });
    // the big grin and a pink tongue
    const grin: P[] = [[268, 528], [380, 540], [500, 526], [536, 512], [520, 566], [458, 616], [370, 626], [300, 596]];
    c.paper(grin);
    c.tint([[340, 590], [400, 572], [460, 586], [440, 612], [380, 620]], PINK, { wash: 0.8, angle: 90 });
    c.cheek(232, 522, 30, 20, PINK);
    c.cheek(572, 500, 40, 24, PINK);
    // the near paw, waving
    c.part('patte', { pivot: [290, 650], motion: 'swing', amp: 12, period: 1.3 }, () => {
      shape(potato(230, 690, 70, 52, 8, 0.08), PURPLE, { angle: 40, over: 0.3 });
      stroke([[188, 690], [200, 712]], { w: 3.5 });
      stroke([[226, 704], [232, 728]], { w: 3.5 });
    });
    // little puffs of mist floating round it
    for (const [x, y, r] of [[150, 300, 34], [820, 300, 26], [120, 820, 22]] as const) {
      c.paper(cloud(x, y, r * 1.3, r, 4, 0.15), { w: 3.5 });
      c.tint(cloud(x, y, r * 1.2, r * 0.9, 4, 0.15), MIST, { wash: 0.4 });
    }
    // only in battle: its eyes blink
    c.part('paupieres', { pivot: [370, 425], motion: 'blink', extra: true }, () => {
      c.lid(292, 430, 40, 54, PURPLE);
      c.lid(438, 418, 54, 68, PURPLE);
    });
  },
} satisfies Redraw;
