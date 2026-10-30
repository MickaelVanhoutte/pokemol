import type { Crayon, P, Redraw } from './crayon.ts';

/**
 * Spiragneau grown into a big ram turned to the left, charging head down: a huge coat of lilac wool curled in
 * spirals, strong dark legs and hooves kicking up dust, and two great horns coiled into spirals (the hypnotist's
 * spiral), ringed with a pink psychic glow. It keeps Spiragneau's big shiny eyes and pink cheeks, under a heavy
 * determined brow, and a woolly fringe falls over its forehead.
 *
 * `fair` draws its fair copy instead (tools/fair): bigger horns blazing with light, a third ring of glow, a thicker
 * fringe, fiercer brows and the gold star.
 */
export function drawHypnobelier(c: Crayon, fair = false) {
  const { shape, stroke, dot, band, potato } = c;
  const WOOL = '#cbb0ea', CURL = '#9f7ccc', FACE = '#efd3e2', LEG = '#4e3f60', HORN = '#b56ad8', HORN2 = '#ecbdf5', GLOW = '#f2a6d8', CHEEK = '#f29ab0';
  const cloud = (cx: number, cy: number, rx: number, ry: number, n: number, bump: number): P[] =>
    Array.from({ length: n * 2 }, (_, i) => {
      const a = (i / (n * 2)) * Math.PI * 2, k = i % 2 ? 1 : 1 + bump;
      return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
    });
  const curl = (x: number, y: number, r: number) => {
    const pts: P[] = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 11) * Math.PI * 2.4, rr = r * (1 - i / 14);
      return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
    });
    stroke(pts, { w: 4, col: CURL });
  };
  const spiral = (cx: number, cy: number, r0: number, turns: number, a0: number, n = 26): P[] =>
    Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1), a = a0 + t * turns * Math.PI * 2, r = r0 * (1 - 0.78 * t);
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
  // a horn grows from the top of the head (start angle a0 round the coil's centre), curls back, down and forward
  const horn = (cx: number, cy: number, r0: number, w0: number, a0: number) => {
    const path = spiral(cx, cy, r0, 1.1, a0);
    shape(band(path, w0, w0 * 0.3), HORN, { angle: 40, over: 0.4 });
    for (let i = 3; i < path.length - 3; i += 3) {
      const [x, y] = path[i], [x2, y2] = path[i + 1], l = Math.hypot(x2 - x, y2 - y) || 1, w = (w0 * (1 - i / path.length * 0.7)) / 2.4;
      stroke([[x - ((y2 - y) / l) * w, y + ((x2 - x) / l) * w], [x + ((y2 - y) / l) * w, y - ((x2 - x) / l) * w]], { w: 3, col: HORN2 });
    }
  };
  // the psychic glow around its horns, behind
  c.part('aura', { pivot: [380, 430], motion: 'flicker', period: 1.6, behind: true }, () => {
    for (const r of fair ? [230, 270, 310] : [230, 270]) c.tint(cloud(380, 430, r, r * 0.9, 12, 0.02).concat(cloud(380, 430, r - 22, (r - 22) * 0.9, 12, 0.02).reverse()), GLOW, { gap: 3.6, wash: 0.25 });
  });
  // the far legs, pushing back
  shape(band([[620, 780], [600, 880], [585, 960]], 62, 54), LEG, { angle: 90, over: 0 });
  shape(band([[880, 760], [940, 860], [980, 940]], 66, 56), LEG, { angle: 60, over: 0 });
  shape(potato(990, 960, 38, 20, 7, 0.05), '#2d2a33', { over: 0 });
  // a short woolly tail
  c.part('queue', { pivot: [960, 560], motion: 'swing', amp: 12, period: 1.1, behind: true }, () => {
    shape(cloud(990, 545, 55, 45, 5, 0.18), WOOL, { over: 0 });
  });
  // the huge coat of wool, curled in spirals
  shape(cloud(680, 600, 300, 210, 11, 0.1), WOOL, { angle: 30, over: 0.45 });
  for (const [x, y, r] of [[560, 500, 26], [680, 470, 24], [800, 510, 26], [890, 600, 22], [620, 620, 26], [760, 640, 24], [680, 740, 22], [850, 720, 20]] as const) curl(x, y, r);
  // the near legs braced forward, hooves, dust kicked up
  shape(band([[520, 760], [470, 870], [440, 955]], 70, 60), LEG, { angle: 110, over: 0 });
  shape(potato(430, 968, 42, 22, 7, 0.05), '#2d2a33', { over: 0 });
  shape(band([[820, 790], [830, 890], [835, 955]], 70, 60), LEG, { angle: 90, over: 0 });
  shape(potato(838, 968, 42, 22, 7, 0.05), '#2d2a33', { over: 0 });
  for (const [x, y, s] of [[1040, 975, 1], [930, 1000, 0.7]] as const) c.paper(potato(x, y, 42 * s, 26 * s, 9, 0.18), { w: 3.5 });
  // the far horn, peeking behind the head
  horn(300, 440, 85, 56, -2.4);
  // the head lowered to charge
  const face: P[] = [[160, 560], [185, 470], [250, 410], [360, 395], [450, 440], [480, 540], [440, 630], [340, 675], [240, 668], [180, 620]];
  shape(face, FACE, { angle: 30, over: 0.35 });
  // Spiragneau's big shiny eyes under a heavy brow, cheeks, nostrils, a set mouth
  for (const [x, y, rx, ry] of [[245, 520, 25, 31], [350, 512, 35, 41]] as const) {
    shape(potato(x, y, rx, ry, 10, 0.03), '#3a3050', { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
    dot(x - rx * 0.3, y - ry * 0.35, rx * 0.34, ry * 0.28, '#ffffff');
    dot(x + rx * 0.25, y + ry * 0.3, rx * 0.14, ry * 0.12, '#ffffff');
  }
  stroke(fair ? [[210, 462], [272, 488]] : [[212, 470], [270, 482]], { w: fair ? 10 : 7, col: LEG });
  stroke(fair ? [[308, 476], [398, 456]] : [[310, 460], [395, 474]], { w: fair ? 10 : 7, col: LEG });
  shape(potato(212, 610, 18, 12, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
  shape(potato(410, 600, 28, 16, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
  dot(182, 585, 6, 5);
  dot(205, 598, 5, 4);
  stroke([[215, 640], [255, 650], [292, 642]], { w: 4.5 });
  // the woolly fringe over its forehead
  shape(cloud(320, 410, fair ? 125 : 100, fair ? 62 : 50, 7, 0.22), WOOL, { angle: 30, over: 0.3 });
  // the near horn, a great spiral coiled round its ear
  horn(470, 485, fair ? 150 : 125, fair ? 108 : 88, -2.4);
  if (fair) {
    for (const [x, y] of [[620, 360], [640, 470], [590, 300]] as const) c.star(x, y, 16, 20);
    c.star(770, 600, 44, -8);
  }
}

export default {
  id: '119', slug: 'hypnobelier', seed: 11910, size: [1100, 1100], tilt: -3,
  draw: (c) => drawHypnobelier(c),
} satisfies Redraw;
