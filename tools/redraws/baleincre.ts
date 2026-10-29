import type { P, Redraw } from './crayon.ts';

/**
 * The Grand Encrier: an old, huge ink whale swimming in the sky, turned to the left, the inkwell that drew the
 * world's first lines. A real humpback, dark as ink, curved in a U as it rises: its head thrown up, its belly
 * dipping, its tail raised with wide flukes edged in gold like a pen nib. Knobs on its head, a long jaw and
 * throat grooves, a small wise eye, a long fin like a feather pen, a small fin on its back. The glass rim of an
 * inkwell round its blowhole spouts a jet of black ink whose drops fall like rain; the first lines of the world
 * are written faintly along its side, stars on its back.
 */
export default {
  id: '112', slug: 'baleincre', seed: 11231, size: [1150, 1000], tilt: -2,
  draw(c) {
    const { shape, stroke, dot, potato } = c;
    const INK = '#1d2138', SHEEN = '#343d68', BELLY = '#5d6894', GROOVE = '#a4b0dc', GLASS = '#cfe6f2', GOLD = '#e8b84a', BLACK = '#14151f';
    // its spine, from the snout (up on the left) down through the belly and up to the tail, and its girth
    const S: P[] = [[150, 140], [195, 255], [265, 395], [370, 530], [520, 615], [680, 615], [820, 535], [915, 420], [975, 310]];
    const W = [90, 235, 280, 280, 255, 215, 150, 92, 62];
    /** A point along the spine (t from 0 to 8) and across it (s = 1 on the belly side, −1 on the back). */
    const at = (t: number, s: number): P => {
      const i = Math.min(S.length - 2, Math.floor(t)), f = t - i;
      const p: P = [S[i][0] + (S[i + 1][0] - S[i][0]) * f, S[i][1] + (S[i + 1][1] - S[i][1]) * f];
      const dx = S[i + 1][0] - S[i][0], dy = S[i + 1][1] - S[i][1], l = Math.hypot(dx, dy);
      const w = (W[i] + (W[i + 1] - W[i]) * f) / 2;
      return [p[0] - (dy / l) * w * s, p[1] + (dx / l) * w * s];
    };
    const along = (t0: number, t1: number, s: number, n = 10): P[] => Array.from({ length: n + 1 }, (_, k) => at(t0 + ((t1 - t0) * k) / n, s));
    // the far fin, behind the belly
    const ff = at(3.4, 0.6);
    shape([ff, [ff[0] + 60, ff[1] + 120], [ff[0] + 110, ff[1] + 230], [ff[0] + 140, ff[1] + 200], [ff[0] + 110, ff[1] + 80]], INK, { angle: 60, over: 0.3 });
    // its tail raised, wide flukes edged in gold: in battle it beats slowly
    const end = S[8], dir: P = [0.48, -0.88], perp: P = [0.88, 0.48];
    const F = (a: number, b: number): P => [end[0] + perp[0] * a + dir[0] * b, end[1] + perp[1] * a + dir[1] * b];
    c.part('queue', { pivot: at(7.4, 0), motion: 'swing', amp: 7, period: 3, behind: true }, () => {
      const fluke: P[] = [F(-30, -20), F(-110, 20), F(-185, 80), F(-150, 95), F(-70, 70), F(0, 40), F(70, 70), F(150, 95), F(185, 80), F(110, 20), F(30, -20)];
      shape(fluke, INK, { angle: 70, over: 0.4, press: 1.1 });
      stroke([F(-185, 80), F(-150, 95), F(-70, 70), F(0, 40), F(70, 70), F(150, 95), F(185, 80)], { w: 7, col: GOLD });
      stroke([F(0, 40), F(0, 0)], { w: 4, col: GOLD });
    });
    // the long body, curved in a U
    const body = [...along(0, 8, 1, 24), ...along(0, 8, -1, 24).reverse()];
    shape(body, INK, { angle: 30, over: 0.8, press: 1.45, gap: 3.2 });
    // a sheen of blue along its back
    c.tint([...along(1, 6.5, -0.95, 12), ...along(1, 6.5, -0.45, 12).reverse()], SHEEN, { angle: 20, wash: 0.7 });
    // the paler throat and belly with their long grooves
    shape([...along(0.25, 6, 1, 16), ...along(0.25, 6, 0.6, 16).reverse()], BELLY, { angle: 30, over: 0.2, press: 1.15 });
    for (const s of [0.7, 0.8, 0.9]) stroke(along(0.5, 4.6, s, 10), { w: 3, col: GROOVE });
    // the first lines of the world, written faintly along its side; stars on its back
    const write = (t0: number, t1: number, s: number) => stroke(Array.from({ length: 13 }, (_, k) => at(t0 + ((t1 - t0) * k) / 12, s + (k % 2 ? 0.12 : -0.05))), { w: 4, col: BELLY });
    write(3.3, 5.6, -0.25);
    write(3.6, 5.8, 0.1);
    for (const [t, s, r] of [[2.4, -0.75, 5], [3.2, -0.8, 4], [4.6, -0.75, 4.5], [5.6, -0.7, 4], [6.6, -0.6, 3.5], [1.8, -0.7, 3.5]] as const) dot(...at(t, s), r, r, '#ffffff');
    // the small fin on its back
    const df = at(6.3, -1);
    shape([[df[0] - 30, df[1] + 10], [df[0] - 10, df[1] - 55], [df[0] + 40, df[1] - 10]], INK, { angle: 60, over: 0 }, {}, false);
    // knobs on its head, the long jaw, a small wise eye
    for (const [t, s] of [[0.5, -0.4], [0.9, -0.55], [1.3, -0.6], [0.8, -0.1], [1.2, -0.2]] as const) shape(potato(...at(t, s), 11, 9, 7, 0.1), SHEEN, { over: 0 }, { w: 3 });
    stroke(along(0.05, 1.7, 0.32, 8), { w: 6, col: GROOVE });
    const eye = at(1.85, 0.12);
    c.paper(potato(eye[0], eye[1], 24, 20, 9, 0.05));
    dot(eye[0] - 4, eye[1] + 1, 13, 13, BLACK);
    dot(eye[0] - 9, eye[1] - 5, 5, 5, '#ffffff');
    stroke([[eye[0] - 30, eye[1] - 22], [eye[0] + 2, eye[1] - 32], [eye[0] + 34, eye[1] - 20]], { w: 6, col: GROOVE });
    // the glass rim of an inkwell round its blowhole, and the jet of black ink: in battle it spouts
    const bh = at(1.7, -0.98);
    shape([[bh[0] - 34, bh[1] + 14], [bh[0] - 30, bh[1] - 16], [bh[0] + 30, bh[1] - 26], [bh[0] + 38, bh[1] + 4]], GLASS, { angle: 90, over: 0, wash: 0.6 }, { w: 4.5 }, false);
    c.part('jet', { pivot: [bh[0], bh[1] - 20], motion: 'nod', amp: 6, period: 1.7 }, () => {
      const [x, y] = [bh[0], bh[1] - 20];
      shape([[x - 12, y], [x - 30, y - 80], [x - 70, y - 160], [x - 110, y - 205], [x - 60, y - 190], [x - 15, y - 130], [x + 4, y - 225], [x + 22, y - 130],
        [x + 60, y - 195], [x + 105, y - 215], [x + 70, y - 155], [x + 32, y - 80], [x + 14, y]], BLACK, { angle: 90, over: 0.3, press: 1.3 });
      for (const [dx, dy, r] of [[-130, -150, 14], [-150, -90, 11], [130, -160, 13], [150, -100, 10], [-100, -40, 9], [100, -45, 9]] as const) {
        shape([[x + dx, y + dy - r * 1.8], [x + dx + r, y + dy], [x + dx, y + dy + r], [x + dx - r, y + dy]], BLACK, { over: 0 }, { w: 3 }, true);
      }
    });
    // the near fin, long like a feather pen, swept down and out: in battle it rows through the sky
    const nf = at(2.6, 0.55);
    c.part('nageoire', { pivot: nf, motion: 'nod', amp: 8, period: 2.6 }, () => {
      const fin: P[] = [nf, [nf[0] - 40, nf[1] + 80], [nf[0] - 110, nf[1] + 170], [nf[0] - 190, nf[1] + 250], [nf[0] - 220, nf[1] + 300],
        [nf[0] - 170, nf[1] + 290], [nf[0] - 90, nf[1] + 220], [nf[0] + 10, nf[1] + 130], [nf[0] + 70, nf[1] + 50]];
      shape(fin, INK, { angle: 50, over: 0.4 });
      stroke([[nf[0] + 10, nf[1] + 40], [nf[0] - 90, nf[1] + 170], [nf[0] - 205, nf[1] + 292]], { w: 4, col: GROOVE });
      for (const k of [0.3, 0.5, 0.7]) {
        const p: P = [nf[0] + 10 - 215 * k, nf[1] + 40 + 252 * k];
        stroke([p, [p[0] + 40, p[1] + 10]], { w: 3, col: BELLY });
      }
      dot(nf[0] - 212, nf[1] + 296, 6, 6, GOLD);
    });
    // drops of ink falling from it like rain
    for (const [t, dy] of [[4.2, 90], [5.3, 70], [6.3, 60], [3.4, 110]] as const) {
      const [x, y0] = at(t, 1);
      const y = y0 + dy;
      shape([[x, y - 26], [x + 12, y], [x, y + 14], [x - 12, y]], BLACK, { over: 0 }, { w: 3 }, true);
    }
  },
} satisfies Redraw;
