import type { Draft, P } from './kid.ts';

/** Clapotin's evolution: big wavy ears, a wave of a tail, shouting and punching. */
export default {
  id: '022', slug: 'clapoflot', seed: 34, size: [1120, 1300], tilt: -10, pivot: [470, 640], offset: [0, 40],
  draw(k) {
    const { j, potato, shake, shape, stroke, outline, raw, bumps, smooth } = k;
    const BLUE = '#3f5ed2', PALE = '#8fc0f0', BROWN = '#9a6230', YEL = '#e2c04e';

    const drop = (x: number, y: number, s = 1) => {
      const pts: P[] = [[x, y - 26 * s], [x + 13 * s, y], [x + 8 * s, y + 13 * s], [x - 8 * s, y + 13 * s], [x - 13 * s, y]];
      shape(pts, PALE, { gap: 8, w: 7, miss: 0 }, 5);
    };

    // a huge wave of a tail, curling up behind it, with lines of foam
    k.part('vague', { pivot: [620, 800], motion: 'swing', amp: 4, period: 2, behind: true }, () => {
      const tailOut = bumps([[600, 920], [790, 935], [950, 860], [1035, 715], [1030, 545], [955, 410]], 1, -70);
      const tailIn: P[] = [[870, 420], [855, 505], [865, 600], [825, 700], [735, 770], [605, 795]];
      shape([...tailOut, ...tailIn], PALE, { angle: -25, gap: 17, w: 13, miss: 0.12 });
      stroke([[955, 410], [905, 380], [862, 405], [878, 455], [922, 452], [915, 422]], 6.5);
      stroke([[700, 870], [830, 850], [930, 770], [965, 660]], 5);
      stroke([[650, 885], [760, 875]], 4.5);
    });

    // the shell: big, brown, with spikes along its back
    const back = potato(640, 640, 125, 195, 8, 0.1);
    shape(back, BROWN, { gap: 15, w: 12, miss: 0.15 });
    for (let k = -2; k <= 2; k++) stroke([[640 + k * 46 + j(14), 460], [640 + k * 48 + j(18), 825]], 4);
    for (let k = -3; k <= 3; k++) stroke([[525, 640 + k * 52 + j(14)], [755, 640 + k * 50 + j(18)]], 4);
    {
      const spikes: P[] = [];
      for (let k = 0; k < 6; k++) {
        const t = -1.1 + k * 0.42, x = 640 + Math.cos(t) * 128, y = 640 + Math.sin(t) * 196;
        spikes.push([x, y], [x + Math.cos(t) * 48 + j(10), y + Math.sin(t) * 40 + j(10)]);
      }
      stroke(spikes, 6);
    }

    // legs wide apart: one forward, one back, ready to jump
    for (const [hx, fx, fy, sz] of [[400, 300, 1050, 1.05], [545, 610, 1060, 0.95]] as [number, number, number, number][]) {
      stroke([[hx - 22, 900], [fx - 26 + j(10), fy - 28]], 6);
      stroke([[hx + 22, 905], [fx + 22 + j(10), fy - 30]], 6);
      shape(potato(fx, fy, 70 * sz, 44 * sz, 7, 0.14), BLUE, { gap: 14, w: 11, miss: 0.1 });
      for (let k = -1; k <= 1; k++) stroke([[fx + k * 28, fy + 34], [fx + k * 46 + j(16), fy + 105 + j(25)]], 6);
    }

    // body: bigger, leaning forward
    const body = shake([[340, 455], [520, 420], [600, 540], [622, 720], [600, 880], [500, 935], [380, 910], [318, 770], [305, 600]], 26);
    shape(body, BLUE, { angle: -72 });
    const front = potato(430, 700, 100, 80, 7, 0.16);
    shape(front, YEL, { gap: 15, w: 12, miss: 0.15 });
    for (let k = -2; k <= 2; k++) stroke([[430 + k * 38 + j(14), 625], [430 + k * 40 + j(18), 775]], 4);
    for (let k = -2; k <= 2; k++) stroke([[335, 700 + k * 30 + j(10)], [525, 700 + k * 28 + j(14)]], 4);

    // the front arm punches forward, claws open, with speed lines; the other one is raised
    k.part('poing', { pivot: [345, 570], motion: 'peek', to: [14, 0], period: 1.4 }, () => {
      shape(shake([[345, 545], [270, 520], [195, 470], [168, 488], [182, 520], [250, 568], [335, 600]], 8), BLUE, { gap: 13, w: 10, miss: 0.05 });
      for (const [a, b] of [[[185, 478], [130, 430]], [[172, 492], [110, 470]], [[172, 508], [112, 520]], [[184, 520], [140, 560]]] as [P, P][]) stroke([a, [b[0] + j(14), b[1] + j(14)]], 6);
      for (const k of [0, 1, 2]) stroke([[250 + k * 10, 600 + k * 26], [330 + k * 8, 640 + k * 26]], 4.5);
    });
    shape(shake([[575, 540], [625, 480], [662, 405], [690, 395], [700, 422], [660, 500], [605, 575]], 8), BLUE, { gap: 13, w: 10, miss: 0.05 });
    for (const [a, b] of [[[680, 398], [670, 340]], [[692, 402], [722, 352]], [[700, 418], [748, 392]]] as [P, P][]) stroke([a, [b[0] + j(12), b[1] + j(12)]], 6);

    // ears: big wavy wings sweeping back, curls inside
    const earA = [...bumps([[372, 205], [430, 120], [540, 60], [660, 45]], 2, -26), [610, 95], [520, 150], [450, 215]] as P[];
    const earB = [...bumps([[470, 190], [560, 160], [670, 150], [770, 175]], 2, -24), [700, 205], [600, 220], [500, 235]] as P[];
    shape(earA, PALE, { angle: -15, gap: 16, w: 12, miss: 0.08 });
    shape(earB, PALE, { angle: -15, gap: 16, w: 12, miss: 0.08 });
    stroke([[470, 160], [540, 110], [600, 95]], 4.5);
    stroke([[560, 195], [640, 182], [700, 188]], 4.5);
    stroke([[660, 45], [690, 30], [700, 60], [672, 70]], 5);

    // head, pushed forward
    const head = potato(420, 320, 150, 138, 8, 0.08);
    shape(head, BLUE, { angle: -55 });
    // angry face: a big V of eyebrows, slit eyes, mouth open and shouting with two fangs
    stroke([[318, 248], [392, 290]], 9);
    stroke([[452, 288], [518, 236]], 9);
    raw(`<g filter='url(#lead)'><path d='M342 300 L392 312 L350 322 Z' fill='#2e2a35'/><path d='M452 310 L500 290 L492 312 Z' fill='#2e2a35'/></g>`);
    {
      const mouth = shake([[335, 372], [390, 360], [455, 365], [500, 380], [470, 440], [400, 455], [350, 425]], 8);
      raw(`<path d='${smooth(mouth, true)}' fill='#5a2430'/>`, true);
      shape(shake([[365, 425], [400, 410], [440, 418], [455, 440], [400, 452]], 5), '#e2667a', { gap: 8, w: 8, miss: 0 }, 4);
      outline(mouth, true, 7);
      raw(`<path d='M362 372 L374 400 L386 366 Z M440 366 L452 394 L464 370 Z' fill='#fff' stroke='#2e2a35' stroke-width='4.5' stroke-linejoin='round'/>`);
    }
    // splashes around
    drop(150, 380, 1.1); drop(110, 600, 0.8); drop(1060, 380, 0.9); drop(1075, 880, 0.8); drop(245, 260, 0.7);
  },
} satisfies Draft;
