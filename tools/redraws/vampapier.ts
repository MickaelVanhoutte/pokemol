import type { P, Redraw } from './crayon.ts';

/**
 * Chiroplie grown into a vampire bat of black paper, standing tall and turned to the left: wings spread wide
 * like a cape lined with violet, a high pointed collar, tall ears, glowing green eyes, two long fangs dripping
 * poison, claws on the joints of its wings.
 */
export default {
  id: '104', slug: 'vampapier', seed: 10413, size: [1000, 1000], tilt: 2,
  draw(c) {
    const { shape, paper, stroke, dot, tint, potato } = c;
    const BLACK = '#3a3346', VIOLET = '#7d5cb5', LINING = '#a27fd6', GREEN = '#8fd14f', BONE = '#8a7fa0';
    const beat = { motion: 'flap', amp: 12, period: 0.8 } as const;
    /** A wing like a cape: its scalloped edge, the violet lining, the finger bones and a claw at the joint. */
    const wing = (edge: P[], lining: P[], shoulder: P, tips: P[], claw: P, f = (pts: P[]) => pts) => {
      shape(f(edge), BLACK, { angle: 40, over: 0.5 });
      tint(f(lining), LINING, { gap: 3.4, wash: 0.45, press: 0.8 });
      for (const t of f(tips)) stroke([shoulder, t], { w: 4, col: BONE });
      const [cx, cy] = f([claw])[0];
      shape([[cx - 14, cy + 10], [cx, cy - 34], [cx + 14, cy + 8]], '#e9e2d0', { over: 0 }, { w: 3 }, false);
    };
    // the far wing, behind, seen at a slant: smaller, towards the shoulder
    const far = (pts: P[]): P[] => pts.map(([x, y]) => [410 + (x - 410) * 0.7, 420 + (y - 420) * 0.82]);
    c.part('aile-loin', { pivot: [410, 420], ...beat, behind: true }, () => {
      wing([[420, 400], [330, 250], [190, 150], [70, 175], [120, 290], [45, 360], [140, 420], [80, 520], [220, 515], [360, 500]],
        [[400, 420], [320, 280], [200, 190], [120, 220], [170, 320], [130, 410], [250, 470]], [410, 410], [[70, 175], [45, 360], [80, 520]], [190, 152], far);
    });
    // the high collar behind its head, lined with violet
    shape([[340, 360], [300, 170], [420, 290], [540, 280], [650, 160], [620, 370]], BLACK, { angle: 90, over: 0.3 }, {}, false);
    tint([[360, 330], [330, 230], [420, 310], [540, 300], [620, 220], [600, 340]], VIOLET, { gap: 3.2, wash: 0.4 });
    // the body standing tall, a violet front
    shape([[390, 380], [600, 380], [650, 560], [610, 760], [520, 820], [420, 790], [360, 620]], BLACK, { angle: 80, over: 0.6 });
    tint(potato(495, 600, 85, 150, 10, 0.05), VIOLET, { gap: 3.2, wash: 0.45 });
    for (const y of [520, 590, 660, 730]) stroke([[440, y], [470, y + 12], [520, y + 12], [550, y]], { w: 3, col: BONE });
    // legs and claws gripping
    for (const x of [440, 560]) {
      shape([[x - 22, 790], [x + 22, 790], [x + 18, 880], [x - 18, 880]], BLACK, { angle: 90, over: 0 });
      stroke([[x - 30, 905], [x - 16, 875], [x, 910], [x + 14, 876], [x + 30, 905]], { w: 5 }, false);
    }
    // tall ears
    shape([[345, 270], [300, 110], [430, 225]], BLACK, { angle: 70, over: 0.4 }, {}, false);
    tint([[355, 255], [318, 155], [408, 225]], GREEN, { gap: 3 });
    shape([[485, 210], [560, 40], [585, 250]], BLACK, { angle: 100, over: 0.4 }, {}, false);
    tint([[500, 210], [555, 100], [570, 240]], GREEN, { gap: 3 });
    // the head
    shape(potato(435, 315, 120, 98, 11, 0.05), BLACK, { angle: 70, over: 0.5 });
    // glowing green eyes, narrow and fierce, the far one smaller
    shape([[338, 302], [372, 286], [394, 306], [362, 318]], GREEN, { over: 0 }, { w: 3.5 });
    shape([[430, 292], [485, 270], [515, 298], [465, 316]], GREEN, { over: 0 }, { w: 3.5 });
    dot(368, 302, 5, 11);
    dot(472, 294, 6, 15);
    stroke([[328, 274], [395, 290]], { w: 7 });
    stroke([[425, 272], [520, 257]], { w: 7 });
    // a wide grin, two long fangs
    stroke([[340, 352], [400, 374], [470, 366], [505, 344]], { w: 5 });
    dot(330, 322, 9, 7);
    paper([[362, 362], [374, 422], [390, 368]], { w: 3 }, false);
    paper([[440, 370], [454, 432], [470, 366]], { w: 3 }, false);
    // the near wing, huge: in battle the wings beat slowly
    c.part('aile', { pivot: [600, 420], ...beat }, () => {
      wing([[590, 400], [700, 230], [850, 120], [975, 160], [920, 290], [995, 370], [890, 420], [950, 540], [780, 530], [640, 500]],
        [[620, 420], [710, 270], [840, 170], [920, 190], [870, 300], [900, 400], [760, 480]], [600, 410], [[975, 160], [995, 370], [950, 540]], [850, 122]);
    });
    // only in battle: green drops of poison fall from its fangs
    c.part('gouttes', { pivot: [450, 450], motion: 'flicker', period: 1.7, extra: true }, () => {
      for (const [x, y] of [[374, 470], [454, 485], [280, 600], [700, 640]] as const) {
        shape([[x, y - 30], [x + 16, y + 4], [x, y + 20], [x - 16, y + 4]], GREEN, { over: 0 }, { w: 3.5 });
      }
    });
  },
} satisfies Redraw;
