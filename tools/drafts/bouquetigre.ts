import type { Draft, P } from './kid.ts';

/** Minoufleur's evolution: its bud opened into a huge flower, big saw-edged leaves, two vines. */
export default {
  id: '024', slug: 'bouquetigre', seed: 21, layered: true, size: [1320, 1080], tilt: 3, pivot: [650, 550], offset: [30, 40],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot, spikes } = k;
    const WHITE = '#cdd5ea', SPOT = '#3554c8', PINK = '#f0609e', YEL = '#f4cf34', GREEN = '#72c84a', GREEN_D = '#3d8d2e', RED = '#dc3038';

    function leaf(base: P, tip: P, width: number) {
      const dx = tip[0] - base[0], dy = tip[1] - base[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
      const s1: P[] = [], s2: P[] = [];
      for (let i = 0; i <= 4; i++) {
        const t = i / 4, w = width * Math.sin(Math.PI * Math.min(0.92, 0.08 + t * 0.84));
        s1.push([base[0] + dx * t + nx * w, base[1] + dy * t + ny * w]);
        s2.push([base[0] + dx * t - nx * w, base[1] + dy * t - ny * w]);
      }
      shape([...spikes(s1, 2, 30).slice(0, -1), tip, ...spikes(s2.reverse(), 2, 30)], GREEN, { gap: 13, w: 13, miss: 0.05 }, 6.5);
      stroke([base, [base[0] + dx * 0.88, base[1] + dy * 0.88]], 4.5);
    }
    function vine(path: P[], w: number, end: 'bulb' | 'leaf') {
      const a: P[] = [], b: P[] = [];
      for (let i = 0; i < path.length; i++) {
        const p = path[i], q = path[Math.min(path.length - 1, i + 1)], o = path[Math.max(0, i - 1)];
        const dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1;
        a.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]); b.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]);
      }
      shape([...a, ...b.reverse()], GREEN, { gap: 9, w: 12, miss: 0 }, 6);
      const t = path[path.length - 1], s = path[path.length - 2];
      if (end === 'bulb') shape(potato(t[0], t[1], 38, 32, 7, 0.1), GREEN_D, { gap: 9, w: 11, miss: 0 }, 6);
      else {
        const dx = t[0] - s[0], dy = t[1] - s[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l;
        shape([[t[0] - uy * 34, t[1] + ux * 34], [t[0] + ux * 120, t[1] + uy * 120], [t[0] + uy * 34, t[1] - ux * 34]], GREEN_D, { gap: 10, w: 11, miss: 0 }, 6);
      }
    }
    const stump = (x: number, top: number, bottom: number, w: number) => {
      shape(shake([[x - w, top], [x + w, top], [x + w * 1.08, bottom - 25], [x + w * 0.7, bottom], [x - w * 0.7, bottom], [x - w * 1.08, bottom - 25]], 8), WHITE, { gap: 16, miss: 0.25 });
      for (let i = -1; i <= 1; i++) stroke([[x + i * w * 0.55, bottom - 4], [x + i * w * 0.7 + j(8), bottom + 34 + j(10)]], 6);
    };

    // big leaves behind everything
    leaf([520, 430], [110, 330], 90);
    leaf([540, 400], [250, 70], 80);
    leaf([620, 400], [900, 80], 80);
    // back legs, then the body over them
    stump(360, 700, 870, 62);
    stump(700, 700, 870, 62);
    shape(shake([[240, 580], [370, 455], [620, 425], [850, 480], [920, 620], [880, 770], [690, 835], [430, 838], [265, 765]], 20), WHITE, { angle: -65, gap: 20, miss: 0.35 });
    for (const [x, y, s] of [[330, 640, 1], [430, 760, 0.8], [560, 700, 1.1], [700, 770, 0.85], [800, 650, 0.8], [290, 760, 0.7]] as [number, number, number][]) {
      shape(shake([[x - 24 * s, y - 22 * s], [x + 24 * s, y - 25 * s], [x + 26 * s, y + 22 * s], [x - 22 * s, y + 24 * s]], 6), SPOT, { gap: 8, w: 10, miss: 0 }, 5);
    }
    // front legs
    stump(470, 740, 920, 66);
    stump(800, 740, 915, 64);
    // the flower: back petals first, then the front ones, then the yellow middle
    for (const deg of [-90, -128, -52, -165, -15]) {
      const a = (deg * Math.PI) / 180 + j(0.08), cx = 560 + Math.cos(a) * 140, cy = 420 + Math.sin(a) * 120;
      const petal = potato(0, 0, 125, 80, 8, 0.08).map(([x, y]) => [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)] as P);
      shape(petal, PINK, { gap: 12, w: 13, miss: 0.05, angle: deg + 60 });
      stroke([[560 + Math.cos(a) * 85, 420 + Math.sin(a) * 75], [560 + Math.cos(a) * 205, 420 + Math.sin(a) * 175]], 4);
    }
    shape(potato(560, 415, 90, 72, 8, 0.08), YEL, { gap: 11, w: 13, miss: 0 });
    for (let i = 0; i < 6; i++) dot(560 + j(100), 415 + j(70), 6);
    // vines: one hangs down to the ground, one whips forward
    k.part('liane-bas', { pivot: [470, 480], motion: 'swing', amp: 4, period: 2.2 }, () => {
      vine([[470, 480], [400, 580], [360, 700], [330, 820], [300, 900]], 17, 'bulb');
    });
    k.part('liane', { pivot: [660, 480], motion: 'swing', amp: 7, period: 1.6 }, () => {
      vine([[660, 480], [780, 400], [920, 360], [1060, 380], [1150, 320]], 19, 'leaf');
    });
    // head at the front: cat ears, angry red eyes, fangs
    shape(shake([[840, 470], [860, 345], [925, 450]], 6), WHITE, { gap: 14, miss: 0.1 });
    shape(shake([[970, 445], [1040, 340], [1055, 470]], 6), WHITE, { gap: 14, miss: 0.1 });
    shape(potato(955, 565, 150, 128, 8, 0.07), WHITE, { angle: -55, gap: 17, miss: 0.25 });
    shape(shake([[880, 535], [945, 558], [892, 578]], 4), RED, { gap: 7, w: 9, miss: 0 }, 5);
    shape(shake([[995, 556], [1048, 528], [1045, 572]], 4), RED, { gap: 7, w: 9, miss: 0 }, 5);
    stroke([[868, 510], [950, 540]], 9);
    stroke([[988, 540], [1060, 505]], 9);
    dot(942, 598, 5); dot(968, 596, 5);
    stroke([[878, 628], [950, 650], [1035, 626]], 6.5);
    k.raw(`<path d='M905 638 L915 668 L928 642 Z M985 642 L997 670 L1008 638 Z' fill='#fff' stroke='#2e2a35' stroke-width='4.5' stroke-linejoin='round'/>`);
    shape(shake([[1010, 600], [1035, 596], [1036, 620], [1012, 622]], 3), SPOT, { gap: 7, w: 8, miss: 0 }, 4.5);
  },
} satisfies Draft;
