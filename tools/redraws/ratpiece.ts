import type { Crayon, P, Redraw } from './crayon.ts';

/**
 * A little swashbuckling rat turned to the left, en garde on its hind legs: grey-brown fur, big round pink-lined
 * ears (the near one nicked), a pink nose and buck teeth, a thimble for a helmet. It wears rags patched all over,
 * the patches sewn on with big cross stitches, a frayed hem and a bit of string for a belt. Its rapier is a sewing
 * needle with a button for a guard, a thread trailing from its eye. Its long pink tail curls behind it.
 *
 * `fair` draws its fair copy instead (tools/fair): a patched cape flying behind it, a feather in its thimble, a longer
 * needle and the gold star.
 */
export function drawRatpiece(c: Crayon, fair = false) {
  const { shape, stroke, dot, band, potato } = c;
  const FUR = '#a39a92', DEEP = '#7d746c', PINK = '#f2b3c0', RAG = '#c9a06b', RAG2 = '#a8824f', CHECK = '#d9c7a3', STEEL = '#c9ced6', BUTTON = '#e8dcc0', THREAD = '#efe6d2', CHEEK = '#f29ab0';
  const stitch = (pts: P[]) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, b] = [pts[i], pts[i + 1]], m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      stroke([[m[0] - 8, m[1] - 8], [m[0] + 8, m[1] + 8]], { w: 2.5 });
      stroke([[m[0] - 8, m[1] + 8], [m[0] + 8, m[1] - 8]], { w: 2.5 });
    }
  };
  // the long pink tail curling behind
  c.part('queue', { pivot: [640, 780], motion: 'swing', amp: 10, period: 1.4, behind: true }, () => {
    shape(band([[640, 780], [780, 830], [900, 770], [925, 660], [870, 620], [840, 670], [875, 690]], 30, 12), PINK, { angle: 40, over: 0.2 });
  });
  // the fair copy's patched cape, flying out behind
  if (fair) {
    shape([[600, 470], [760, 520], [900, 640], [930, 760], [840, 720], [800, 790], [720, 700], [640, 640]], RAG2, { angle: 30, over: 0.3 });
    stitch([[780, 560], [860, 640], [880, 720]]);
  }
  // the far leg, behind, and the far arm raised behind for balance
  shape(band([[600, 760], [650, 850], [668, 915]], 52, 44), DEEP, { angle: 70, over: 0 });
  shape(potato(690, 930, 52, 24, 8, 0.06), PINK, { over: 0 });
  shape(band([[600, 520], [700, 450], [745, 360]], 46, 40), DEEP, { angle: 60, over: 0 });
  shape(potato(755, 330, 34, 32, 8, 0.06), PINK, { over: 0 });
  // the body
  shape([[470, 470], [600, 450], [680, 520], [700, 650], [660, 770], [540, 800], [460, 740], [440, 600]], FUR, { angle: 75, over: 0.3 });
  // the rags: a tunic with a frayed hem, patches sewn on with cross stitches, a string belt
  const hem: P[] = [];
  for (let i = 0; i <= 8; i++) hem.push([700 - i * 31, 760 + (i % 2 ? 40 : 0) + c.j(10)]);
  shape([[455, 520], [610, 495], [690, 560], [704, 700], ...hem, [452, 740], [440, 620]], RAG, { angle: 80, over: 0.4 }, {}, false);
  const patch1: P[] = [[500, 560], [580, 552], [586, 630], [505, 638]];
  shape(patch1, CHECK, { angle: 0, over: 0 }, { w: 3.5 }, false);
  for (const x of [527, 553]) stroke([[x, 556], [x + 3, 634]], { w: 2.5, col: DEEP });
  for (const y of [583, 608]) stroke([[502, y], [584, y - 3]], { w: 2.5, col: DEEP });
  stitch([[500, 560], [580, 552], [586, 630]]);
  const patch2: P[] = [[600, 680], [672, 670], [680, 740], [606, 748]];
  shape(patch2, RAG2, { angle: 30, over: 0.2 }, { w: 3.5 }, false);
  stitch([[600, 680], [672, 670], [680, 740], [606, 748], [600, 680]]);
  shape(band([[450, 690], [580, 705], [700, 690]], 16, 16), THREAD, { angle: 0, over: 0 }, { w: 3 });
  stroke([[575, 708], [560, 750], [585, 765]], { w: 4, col: THREAD });
  // the near leg, a pink foot
  shape(band([[520, 770], [480, 860], [455, 920]], 56, 48), FUR, { angle: 110, over: 0.2 });
  shape(potato(430, 935, 58, 26, 8, 0.06), PINK, { over: 0 });
  // the far ear, then the head with its pointy snout to the left
  shape(potato(485, 280, 62, 66, 10, 0.06), FUR, { angle: 60, over: 0.2 });
  c.tint(potato(487, 287, 38, 42, 9, 0.06), PINK, { gap: 3.2 });
  const head: P[] = [[280, 450], [350, 380], [455, 330], [555, 347], [617, 410], [607, 487], [537, 527], [425, 530], [335, 501]];
  shape(head, FUR, { angle: 20, over: 0.35 });
  dot(283, 449, 16, 13, PINK);
  // buck teeth, whiskers, cheeks
  shape([[303, 477], [327, 480], [325, 507], [305, 504]], '#ffffff', { over: 0, wash: 1 }, { w: 2.5 }, false);
  stroke([[315, 479], [315, 505]], { w: 2 });
  for (const [a, b] of [[[325, 455], [245, 435]], [[327, 467], [245, 471]], [[335, 477], [260, 503]]] as [P, P][]) stroke([a, b], { w: 2.5 });
  shape(potato(363, 480, 18, 11, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
  shape(potato(545, 477, 26, 15, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
  // big shiny eyes (the far one smaller), a bold brow
  for (const [x, y, rx, ry] of [[395, 421, 24, 30], [493, 415, 34, 40]] as const) {
    shape(potato(x, y, rx, ry, 10, 0.03), '#3a3050', { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
    dot(x - rx * 0.3, y - ry * 0.35, rx * 0.34, ry * 0.28, '#ffffff');
    dot(x + rx * 0.25, y + ry * 0.3, rx * 0.14, ry * 0.12, '#ffffff');
  }
  stroke([[460, 363], [520, 371]], { w: 6, col: DEEP });
  // the near ear, nicked at the top
  shape([[550, 325], [565, 255], [615, 225], [643, 243], [630, 265], [670, 275], [685, 335], [635, 385], [575, 375]], FUR, { angle: 60, over: 0.2 }, {}, false);
  c.tint([[575, 325], [590, 270], [620, 253], [645, 287], [660, 325], [625, 360], [585, 355]], PINK, { gap: 3.2 });
  // the thimble helmet, its little dimples
  shape([[413, 345], [433, 250], [535, 233], [565, 325], [495, 345]], STEEL, { angle: 80, over: 0.3 }, {}, false);
  shape([[405, 347], [573, 325], [577, 350], [407, 373]], STEEL, { angle: 0, over: 0.3 }, { w: 4 }, false);
  for (const [x, y] of [[455, 275], [490, 267], [525, 263], [450, 310], [487, 303], [525, 297]] as const) dot(x, y, 5, 5, DEEP);
  stroke([[440, 260], [433, 325]], { w: 5, col: '#ffffff' });
  // the near arm thrusting its rapier: a sewing needle, a button guard, a thread trailing from the eye
  c.part('rapiere', { pivot: [500, 560], motion: 'reach', amp: 14, period: 1.3 }, () => {
    shape(band([[500, 560], [420, 590], [350, 598]], 46, 40), FUR, { angle: 10, over: 0.2 });
    shape(band([[330, 595], [190, 565], fair ? [5, 520] : [50, 532]], fair ? 22 : 18, 5), STEEL, { angle: 15, over: 0 }, { w: 3.5 });
    stroke([[300, 586], fair ? [80, 538] : [120, 548]], { w: 3, col: '#ffffff' });
    shape(potato(370, 602, 30, 28, 8, 0.06), PINK, { over: 0 });
    shape(potato(322, 590, 36, 40, 10, 0.03), BUTTON, { over: 0 }, { w: 3.5 });
    for (const [dx, dy] of [[-10, -10], [10, -10], [-10, 10], [10, 10]] as const) dot(322 + dx, 590 + dy, 4.5, 4.5, DEEP);
    stroke([[392, 610], [430, 650], [410, 700], [440, 740], [420, 790]], { w: 3.5, col: '#b39c78' });
  });
  // the fair copy's feather in its thimble, and the gold star on its rags
  if (fair) {
    shape([[540, 250], [615, 118], [655, 88], [646, 138], [574, 258]], THREAD, { angle: 60, over: 0 }, { w: 3.5 });
    stroke([[556, 252], [628, 112]], { w: 3 });
    c.star(645, 612, 40, 10);
  }
}

export default {
  id: '120', slug: 'ratpiece', seed: 12001, size: [1000, 1000], tilt: -2,
  draw: (c) => drawRatpiece(c),
} satisfies Redraw;
