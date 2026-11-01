import type { P, Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';
import { CAM, camHead, frame, grip, spiral, tongue, turret } from './curiolor.ts';

/**
 * Cuillipsy grown into the master of thoughts (« maître des pensées »), turned to the left: a tall chameleon reared up on
 * its branch, calm and sure of its power, a knowing smile. Its casque has grown tall and curls back like a wave, banded in
 * violet with a spiral at its tip; a bold hypnotic spiral turns in its glowing turret
 * eye, and its tongue waits rolled in a spiral under its chin like a loaded spring. Its long tail is rolled in a perfect spiral, violet patterns flow along its jade skin, armour plates run down its
 * back.
 */
export default {
  id: '053', slug: 'pensacasque', seed: 5301, size: [1100, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    const { JADE, DEEP, TEAL, VIOLET, GLOW } = CAM;

    /** Armour plates along `spine`: overlapping rounded points, `r` big. */
    const plates = (spine: P[], r: number) => {
      for (const [i, [x, y]] of spine.entries()) {
        const [nx, ny] = spine[Math.min(spine.length - 1, i + 1)], [px, py] = spine[Math.max(0, i - 1)];
        const dx = nx - px, dy = ny - py, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, ox = uy, oy = -ux;
        const k = r * (1 - i * 0.07);
        shape([[x - ux * k, y - uy * k], [x + ox * k * 1.1, y + oy * k * 1.1], [x + ux * k, y + uy * k]], DEEP, { over: 0 }, { w: 4 });
      }
    };
    /** The head, its wave-shaped casque and its hypnotic eye; (hx, hy) its centre. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const { t } = frame(hx, hy, s, rot);
      // the casque, curling back like a wave over the head, its tip rolled under; violet bands and a spiral at the tip
      shape(t([[-50, -78], [-52, -180], [-22, -262], [48, -330], [150, -352], [232, -312], [272, -240], [262, -176], [228, -148], [196, -170], [208, -212], [188, -244], [150, -252], [124, -226], [130, -150], [160, -40]]), JADE, { angle: 60 + rot, over: 0.35 });
      c.tint(t([[-20, -200], [0, -250], [60, -310], [140, -330], [210, -300], [180, -250], [120, -260], [60, -240]]), GLOW, { wash: 0.7 });
      c.stroke(t([[-22, -110], [-10, -190], [22, -258], [80, -300], [150, -314], [206, -290]]), { w: 12, col: VIOLET });
      c.stroke(t([[10, -100], [20, -176], [50, -232], [96, -262], [130, -270]]), { w: 9, col: VIOLET });
      c.stroke(t([[44, -90], [56, -150], [80, -196]]), { w: 7, col: VIOLET });
      c.stroke(t(spiral(234, -212, 30, 1.6, 90, 1, 18)), { w: 7, col: VIOLET });
      c.part('lueur', { pivot: t([[140, -330]])[0], motion: 'swing', amp: 0, period: 4, decor: true }, () => {
        stroke(t([[-56, -100], [-46, -180], [-14, -264], [52, -330], [142, -354], [222, -322], [270, -248]]), { w: 9, col: GLOW });
      });
      const { eye, mouth, T } = camHead(c, hx, hy, s, rot, 30, JADE, { smile: 1 });
      // the eye: a bold hypnotic spiral, a soft violet glow round it
      c.tint(potato(eye[0], eye[1], 90, 88, 12, 0.03), GLOW, { wash: 0.6 });
      turret(c, eye[0], eye[1], 72, [-0.45, 0], JADE, 2);
      // its tongue rolled in a neat spiral under its chin, a loaded spring, the tip glowing at the centre
      c.part('langue', { pivot: mouth, motion: 'nod', amp: 2, period: 3 }, () => {
        tongue(c, [mouth, T([-176, 100]), ...spiral(...T([-96, 196]), 88, 2, 200, -1, 34)], 14);
      });
    };

    c.part('branche', { pivot: [550, 900], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      shape(band([[160, 912], [560, 894], [1040, 884]], 52, 42), CAM.BARK, { angle: 4, over: 0.3 });
      stroke([[320, 910], [430, 906]], { w: 3.5, col: CAM.BARK2 });
    });
    // reared up tall, the tail in a perfect spiral behind
    c.part('queue', { pivot: [720, 790], motion: 'swing', amp: 2, period: 3.4, behind: true }, () => {
      shape(band([[730, 800], [820, 840], ...spiral(920, 700, 160, 2, 130, -1, 36)], 76, 12), TEAL, { angle: 60, over: 0.2 });
    });
    shape(band([[620, 790], [590, 850], [592, 884]], 50, 40), DEEP, { angle: 80 });
    grip(c, 592, 896, 1.05, DEEP);
    shape(band([[540, 560], [510, 680], [524, 760]], 46, 38), DEEP, { angle: 80 });
    // the sturdy reared-up body: a deep chest, a violet pattern flowing down it
    const body: P[] = [[450, 530], [500, 400], [620, 360], [730, 440], [800, 580], [816, 720], [776, 810], [670, 842], [580, 780], [500, 670], [454, 600]];
    shape(body, JADE, { angle: 75, over: 0.4 });
    c.tint([[560, 420], [640, 400], [700, 470], [740, 580], [770, 700], [740, 790], [700, 720], [680, 600], [640, 500], [590, 450]], VIOLET, { angle: 75, wash: 0.4 });
    c.tint([[456, 540], [480, 650], [560, 780], [620, 830], [560, 660], [500, 540]], CAM.BELLY, { wash: 0.85 });
    plates([[640, 362], [700, 410], [750, 480], [786, 560], [806, 650], [810, 740]], 30);
    openLimb(c, [[780, 700], [700, 740], [670, 810], [680, 880], [720, 884], [730, 810], [790, 770]], TEAL, 1, 5);
    grip(c, 696, 896, 1.1, TEAL);
    // the near arm gripping the branch in front
    openLimb(c, [[560, 560], [500, 640], [470, 760], [460, 880], [500, 884], [520, 760], [580, 640]], JADE, 1, 5);
    grip(c, 478, 896, 1.05, JADE);
    head(440, 470, 1.12, -10);
  },
} satisfies Redraw;
