import type { P, Redraw } from './crayon.ts';
import { lineOfAction, openLimb } from './anatomy.ts';
import { GALA, bushyTail, frame, moonEye } from './lunou.ts';

/**
 * Lunelle grown into an acrobat of the stars (« acrobate des étoiles »), turned to the left: a long, slim galago in the
 * middle of a great leap up toward the sky, its arms reaching ahead, its long legs stretched out behind, its moon eyes
 * shining in a ring of moonlight, a narrower muzzle, broad round ears. Its long tail sweeps round behind it into a crescent, tipped with a tuft as
 * yellow as the moon.
 */
export default {
  id: '028', slug: 'lunambule', seed: 2811, size: [1000, 1000], tilt: 0,
  draw(c) {
    const { shape, stroke, band, potato } = c;
    const { FUR, DEEP, BELLY } = GALA, GLOW = '#fff3b4';

    /** A light grasping foot from `heel` toward `toe`, `w` wide: a slim sole, three long thin toes fanned out. */
    const foot = (heel: P, toe: P, w: number, col: string) => {
      const dx = toe[0] - heel[0], dy = toe[1] - heel[1], l = Math.hypot(dx, dy), n: P = [-dy / l, dx / l];
      const ball: P = [heel[0] + dx * 0.6, heel[1] + dy * 0.6];
      for (const k of [-0.5, 0, 0.5]) {
        const tip: P = [toe[0] + n[0] * k * w * 1.4, toe[1] + n[1] * k * w * 1.4];
        shape(band([ball, [(ball[0] + tip[0]) / 2, (ball[1] + tip[1]) / 2], tip], w * 0.36, w * 0.28), col, { angle: 20, over: 0 }, { w: 3.5 });
        shape(potato(tip[0], tip[1], w * 0.24, w * 0.22, 7, 0.05), col, { over: 0 }, { w: 3 });
      }
      shape(band([heel, ball], w * 0.6, w * 0.7), col, { angle: 20, over: 0 });
    };
    /** Its grown head round (hx, hy): a narrower pointed muzzle, bigger moon eyes in a glow of moonlight, broad round ears. */
    const head = (hx: number, hy: number, s: number, rot: number) => {
      const { T, t } = frame(hx, hy, s, rot);
      const ear = (x: number, y: number, rx: number, ry: number, col: string) => {
        const [ex, ey] = T([x, y]);
        shape(potato(ex, ey, rx * s, ry * s, 11, 0.03), col, { angle: 60 + rot, over: 0.2 });
        c.tint(potato(ex + 6 * s, ey + 8 * s, rx * 0.6 * s, ry * 0.62 * s, 9, 0.04), GALA.RIM, { wash: 0.85 });
      };
      ear(-30, -190, 74, 82, DEEP);
      shape(t([[-150, -10], [-112, -104], [-20, -146], [84, -136], [150, -80], [168, 10], [140, 90], [60, 128], [-40, 116], [-116, 78]]), FUR, { angle: 76 + rot, over: 0.4 });
      ear(124, -150, 92, 100, FUR);
      // the long narrow muzzle, pale, a stripe running up between the eyes
      const muzzle: P[] = [[-110, 0], [-180, 26], [-236, 52], [-226, 78], [-160, 94], [-96, 84]];
      shape(t(muzzle), BELLY, { angle: 20, over: 0 }, { w: 0.1 });
      stroke(t(muzzle.slice(1, 5)), { w: 4.5 });
      c.tint(t([[-6, -150], [16, -110], [-30, -20], [-100, 40], [-120, 20], [-50, -50], [-24, -130]]), BELLY, { wash: 0.85 });
      c.dot(...T([-232, 56]), 11 * s, 8 * s, GALA.NOSE);
      stroke(t([[-214, 86], [-180, 100], [-140, 96], [-124, 80]]), { w: 5 });
      // eyes shining like two moons: a ring of moonlight round each
      for (const [x, y, r] of [[-70, -34, 50], [56, -42, 66]] as const) {
        const [ex, ey] = T([x, y]);
        shape(potato(ex, ey, r * 1.28 * s, r * 1.28 * s, 12, 0.02), GLOW, { over: 0, wash: 1 }, { w: 3, col: GALA.MOON2 });
      }
      moonEye(c, ...T([-70, -34]), 50 * s, [-0.6, -0.5]);
      moonEye(c, ...T([56, -42]), 66 * s, [-0.6, -0.5]);
      c.cheek(...T([130, 60]), 26 * s, 15 * s, GALA.CHEEK);
      c.part('paupieres', { pivot: T([0, -36]), motion: 'blink', extra: true }, () => {
        c.lid(...T([-70, -34]), 50 * s, 52 * s, FUR);
        c.lid(...T([56, -42]), 66 * s, 68 * s, FUR);
      });
    };

    // a long diagonal leap up to the left: arms ahead, legs stretched out behind, the tail curling up into a crescent
    c.part('queue', { pivot: [660, 570], motion: 'swing', amp: 2, period: 3, behind: true }, () => {
      bushyTail(c, [[660, 570], [770, 640], [870, 630], [930, 540], [930, 420], [880, 330], [800, 290]], 110, 1.6);
    });
    // the far leg and far arm, darker, behind
    shape(band([[640, 600], [740, 690], [830, 770]], 64, 34), DEEP, { angle: 30, over: 0.2 });
    foot([820, 764], [940, 834], 40, DEEP);
    shape(band([[420, 450], [330, 430], [240, 404]], 50, 40), DEEP, { angle: 20, over: 0 });
    shape(potato(222, 400, 30, 24, 8, 0.06), DEEP, { angle: 40 });
    // the slim body along the leap
    shape(lineOfAction([[410, 390], [490, 450], [580, 510], [670, 570]], [120, 140, 130, 96], [0, 16, 16, 0]), FUR, { angle: 40, over: 0.4 });
    c.tint(lineOfAction([[420, 440], [500, 500], [580, 556]], [50, 64, 36]), BELLY, { angle: 40, wash: 0.8 });
    // the near leg pushing off: a big thigh, a long shin, a long foot pointed
    openLimb(c, [[690, 530], [600, 560], [620, 630], [720, 700], [820, 750], [850, 720], [770, 660], [730, 590]], FUR, 1, 6);
    foot([820, 734], [960, 776], 44, FUR);
    // the near arm reaching ahead
    c.part('bras', { pivot: [470, 450], motion: 'swing', amp: 2, period: 2.4 }, () => {
      openLimb(c, [[470, 430], [390, 420], [290, 380], [190, 334], [180, 370], [280, 420], [390, 470], [470, 480]], FUR, 1, 6);
      shape(potato(180, 350, 32, 26, 8, 0.06), FUR, { angle: 40 });
    });
    head(360, 330, 0.74, -24);
  },
} satisfies Redraw;
