import type { Crayon, P, Redraw } from './crayon.ts';

/**
 * Gecaillou grown into a big frilled lizard turned to the left, low and wide on its splayed padded legs: a huge
 * frill of sand-coloured skin opens round its head like a fan, ribbed with ochre and edged with amber crystals, and
 * sand flies off its rim. Its back carries a row of crystals, its long tail curls up behind. It keeps Gecaillou's
 * huge shiny eyes and pink cheek, its mouth open in a fierce little grin.
 *
 * `fair` draws its fair copy instead (tools/fair): a wider frill rimmed with bigger crystals, bigger crystals on its
 * back, more sand flying, fiercer brows and the gold star.
 */
export function drawSablerette(c: Crayon, fair = false) {
  const { shape, stroke, dot, band, potato } = c;
  const SKIN = '#e2ae62', DEEP = '#b9803f', SPOT = '#98592c', BELLY = '#f3d9a4', FRILL = '#f0c27a', RIB = '#c98a3e', CRYS = '#f2c46a', CRYS2 = '#fbe7b0', CHEEK = '#f29ab0';
  const toes = (x: number, y: number, col: string) => {
    for (const [dx, dy] of [[-44, -6], [-15, 12], [17, 14], [46, -2]] as const) {
      shape(band([[x, y - 16], [x + dx, y + dy]], 18, 15), col, { over: 0 }, { w: 3.5 });
      shape(potato(x + dx, y + dy + 3, 17, 14, 7, 0.05), col, { over: 0 }, { w: 3.5 });
    }
  };
  const crystal = (x: number, y: number, h: number, deg: number) => {
    const r = (deg * Math.PI) / 180, u: P = [Math.cos(r), Math.sin(r)], v: P = [-u[1], u[0]];
    const p = (a: number, b: number): P => [x + u[0] * a + v[0] * b, y + u[1] * a + v[1] * b];
    shape([p(-4, -h * 0.36), p(h, 0), p(-4, h * 0.36)], CRYS, { angle: deg + 90, over: 0 }, { w: 3.5 }, false);
    stroke([p(h * 0.2, -h * 0.12), p(h * 0.7, -h * 0.03)], { w: 4, col: CRYS2 });
  };
  // the far legs, behind
  shape(band([[560, 720], [600, 820], [620, 900]], 70, 60), DEEP, { angle: 70, over: 0 });
  toes(625, 918, DEEP);
  shape(band([[850, 730], [905, 820], [930, 895]], 74, 62), DEEP, { angle: 50, over: 0 });
  toes(935, 912, DEEP);
  // the long tail curling up behind
  c.part('queue', { pivot: [880, 720], motion: 'swing', amp: 9, period: 1.5, behind: true }, () => {
    shape(band([[870, 730], [990, 720], [1060, 630], [1050, 530], [990, 500], [960, 545], [995, 565]], 110, 30), SKIN, { angle: 60, over: 0.3 });
    for (const [x, y] of [[1010, 690], [1045, 600]] as const) shape(potato(x, y, 17, 13, 7, 0.1), SPOT, { over: 0 }, { w: 2.5 });
  });
  // the low, wide body, its pale belly, a row of crystals along the back
  for (const [x, y, h] of [[600, 560, 70], [690, 548, 90], [780, 556, 70], [860, 590, 55]] as const) crystal(x, y + 10, h * (fair ? 1.5 : 1), -90 + (x - 700) / 12);
  const body: P[] = [[450, 640], [560, 562], [760, 548], [905, 610], [935, 720], [845, 800], [620, 812], [480, 770]];
  shape(body, SKIN, { angle: 15, over: 0.45 });
  c.tint([[490, 760], [610, 800], [830, 795], [915, 740], [830, 778], [620, 790]], BELLY, { gap: 3.4, angle: 10 });
  for (const [x, y, r] of [[640, 640, 22], [770, 680, 20], [590, 720, 17], [860, 650, 18], [700, 760, 14]] as const) shape(potato(x, y, r, r * 0.8, 7, 0.1), SPOT, { over: 0 }, { w: 3 });
  // the near legs, splayed, padded toes
  shape(band([[500, 700], [440, 800], [400, 880]], 80, 68), SKIN, { angle: 110, over: 0.25 });
  toes(392, 900, SKIN);
  shape(band([[790, 760], [770, 850], [745, 915]], 82, 70), SKIN, { angle: 100, over: 0.25 });
  toes(740, 935, SKIN);
  // the huge frill opened round its head: ribs, bands, crystals on its rim
  const [fx, fy, FR] = [400, 470, fair ? 360 : 300];
  const rim: P[] = [];
  for (let k = 0; k <= 14; k++) {
    const a = (-200 + (k / 14) * 250) * (Math.PI / 180), r = FR * (k % 2 ? 0.9 : 1);
    rim.push([fx + Math.cos(a) * r, fy + Math.sin(a) * r * 0.95]);
  }
  shape([[fx + 40, fy + 150], ...rim, [fx + 120, fy + 160]], FRILL, { angle: 0, over: 0.4 });
  for (let k = 1; k < 14; k += 2) stroke([[fx, fy], rim[k]], { w: 7, col: RIB });
  for (let k = 0; k <= 14; k += 2) {
    const [x, y] = rim[k];
    crystal(x, y, fair ? 90 : 62, (Math.atan2(y - fy, x - fx) * 180) / Math.PI);
  }
  // sand flying off its rim
  c.part('sable', { pivot: [fx, fy], motion: 'flicker', period: 1.3 }, () => {
    for (const [x, y, r] of [[60, 360, 9], [110, 250, 7], [200, 130, 8], [330, 90, 7], [470, 110, 9], [600, 190, 7], [40, 470, 7], [150, 175, 6]] as const) dot(x, y, r, r, DEEP);
    if (fair) for (const [x, y, r] of [[25, 300, 10], [80, 140, 9], [260, 40, 8], [560, 60, 10], [700, 170, 9], [20, 560, 8]] as const) dot(x, y, r, r, DEEP);
  });
  // the wide head, Gecaillou's huge eyes, the mouth open in a little grin
  const head: P[] = [[160, 505], [190, 430], [270, 390], [380, 392], [455, 440], [472, 520], [432, 590], [325, 618], [218, 604], [168, 562]];
  shape(head, SKIN, { angle: 20, over: 0.35 });
  shape([[165, 540], [250, 560], [320, 565], [255, 598], [180, 578]], '#8a3a4a', { over: 0 }, { w: 3.5 });
  for (const x of [205, 240]) shape([[x - 8, 552 + (x - 205) * 0.3], [x, 568 + (x - 205) * 0.3], [x + 8, 554 + (x - 205) * 0.3]], '#ffffff', { over: 0, wash: 1 }, { w: 2 }, false);
  shape(potato(246, 450, 40, 42, 9, 0.05), SKIN, { over: 0 });
  shape(potato(352, 436, 60, 62, 9, 0.05), SKIN, { over: 0 });
  for (const [x, y, rx, ry] of [[244, 453, 28, 32], [352, 440, 44, 48]] as const) {
    shape(potato(x, y, rx, ry, 10, 0.03), '#3a3050', { angle: 90, over: 0, press: 1.25 }, { w: 3.5 });
    dot(x - rx * 0.3, y - ry * 0.35, rx * 0.34, ry * 0.28, '#ffffff');
    dot(x + rx * 0.25, y + ry * 0.3, rx * 0.14, ry * 0.12, '#ffffff');
  }
  stroke(fair ? [[214, 400], [272, 412]] : [[214, 408], [270, 398]], { w: fair ? 9 : 6, col: SPOT });
  stroke(fair ? [[310, 388], [398, 372]] : [[312, 380], [395, 388]], { w: fair ? 9 : 6, col: SPOT });
  dot(176, 500, 5, 4);
  shape(potato(410, 548, 28, 16, 7, 0.1), CHEEK, { over: 0 }, { w: 0.1 });
  if (fair) c.star(700, 700, 44, 12);
}

export default {
  id: '117', slug: 'sablerette', seed: 11707, size: [1100, 1100], tilt: -2,
  draw: (c) => drawSablerette(c),
} satisfies Redraw;
