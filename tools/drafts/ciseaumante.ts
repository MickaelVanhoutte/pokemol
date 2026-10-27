import type { Draft, P } from './kid.ts';

/** A green mantis whose two arms are big school scissors, see-through wings. Faces left. */
export default {
  id: '048', slug: 'ciseaumante', seed: 21, layered: true, size: [1150, 1150], tilt: -3, pivot: [575, 575],
  draw(k) {
    const { j, potato, shake, shape, stroke, dot } = k;
    const GREEN = '#5fbf4a', LIGHT = '#bfe8b0', BLADE = '#a9b2c4', HANDLE = '#e24848';
    // see-through wings behind
    k.part('ailes', { pivot: [630, 520], motion: 'flap', amp: 8, period: 0.18, behind: true }, () => {
      shape(shake([[620, 470], [880, 300], [990, 340], [880, 470], [700, 560]], 8), LIGHT, { gap: 15, miss: 0.35 });
      shape(shake([[620, 520], [900, 480], [980, 560], [850, 610], [680, 610]], 8), LIGHT, { gap: 15, miss: 0.35 });
    });
    // thin legs
    for (const [a, b, c] of [[[600, 800], [690, 900], [660, 1050]], [[540, 820], [500, 920], [540, 1060]], [[650, 760], [800, 840], [830, 990]]] as [P, P, P][]) {
      stroke([a, b, c], 8);
      stroke([c, [c[0] + 30 + j(8), c[1] + 15]], 6);
    }
    // long body: abdomen and thorax
    shape(shake([[560, 600], [700, 560], [840, 650], [900, 800], [820, 860], [680, 790]], 10), GREEN, { gap: 13, miss: 0.04 });
    shape(potato(560, 560, 85, 160, 8, 0.05), GREEN, { gap: 13, miss: 0.04, angle: -70 });
    // scissor arms: blades out front, red handles at the elbow
    const scissors = (x: number, y: number, dx: number, dy: number) => {
      shape(potato(x, y, 46, 34, 7, 0.06), HANDLE, { gap: 8, w: 9, miss: 0 }, 5);
      shape(potato(x + 30, y + 40, 46, 34, 7, 0.06), HANDLE, { gap: 8, w: 9, miss: 0 }, 5);
      shape(shake([[x + 20, y + 10], [x + dx, y + dy - 25], [x + dx + 20, y + dy], [x + 40, y + 40]], 4), BLADE, { gap: 8, w: 9, miss: 0 }, 5);
      shape(shake([[x + 40, y + 30], [x + dx + 20, y + dy + 10], [x + dx + 10, y + dy + 40], [x + 30, y + 50]], 4), BLADE, { gap: 8, w: 9, miss: 0 }, 5);
      dot(x + 32, y + 26, 7);
    };
    stroke([[520, 520], [470, 470], [430, 470]], 10);
    scissors(380, 440, -250, -150);
    stroke([[540, 600], [480, 640], [440, 650]], 10);
    scissors(390, 620, -270, 20);
    // triangle head, big eyes, antennae
    stroke([[500, 260], [470, 140], [420, 100]], 5);
    stroke([[560, 260], [620, 140], [680, 110]], 5);
    shape(shake([[430, 300], [620, 280], [540, 420]], 8), GREEN, { gap: 12, miss: 0 });
    shape(potato(470, 315, 40, 34, 7, 0.06), '#f2d132', { gap: 8, w: 9, miss: 0 }, 5);
    shape(potato(580, 305, 40, 34, 7, 0.06), '#f2d132', { gap: 8, w: 9, miss: 0 }, 5);
    dot(462, 318, 12, 14);
    dot(572, 308, 12, 14);
    stroke([[505, 375], [540, 368]], 5);
  },
} satisfies Draft;
