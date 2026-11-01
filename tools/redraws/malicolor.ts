import type { Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';
import { CAM, camHead, frame, grip, spiral, tongue, turret } from './curiolor.ts';

/**
 * Dormipsy grown sly (« malicieux »), seen from the side, turned to the left: a lean chameleon stalking forward along its
 * branch, one foot raised, head low, fixing you with a hypnotic stare: a clear spiral turns in its turret eye, and it
 * smiles because it already knows your next move; its tongue shoots out straight and thin, a precise strike to a glowing
 * tip. A small rounded casque with a violet band, two violet stripes.
 */
export default {
  id: '052', slug: 'malicolor', seed: 5201, size: [1300, 1000], tilt: 0,
  draw(c) {
    const { shape, band } = c;
    const { JADE, DEEP } = CAM;
    const { T, t } = frame(930, 610, 0.92, -14);

    c.part('branche', { pivot: [500, 800], motion: 'swing', amp: 0, period: 4, decor: true, behind: true }, () => {
      shape(band([[300, 812], [650, 800], [980, 804], [1250, 790]], 48, 38), CAM.BARK, { angle: 4, over: 0.3 });
      c.stroke([[480, 812], [580, 808]], { w: 3.5, col: CAM.BARK2 });
    });
    // the tail curled up behind, ready to spring
    c.part('queue', { pivot: T([240, 20]), motion: 'swing', amp: 3, period: 2.6, behind: true }, () => {
      shape(band([T([230, 10]), T([320, -20]), T([360, -110]), ...spiral(...T([300, -200]), 80, 1.5, 60, -1)], 50, 12), JADE, { angle: 60, over: 0.2 });
    });
    // the far legs braced
    shape(band([T([-160, 60]), [720, 740], [700, 790]], 40, 32), DEEP, { angle: 80 });
    grip(c, 700, 800, 0.9, DEEP);
    shape(band([T([150, 70]), [1040, 740], [1060, 790]], 40, 32), DEEP, { angle: 80 });
    grip(c, 1060, 800, 0.9, DEEP);
    // the lean body stretched forward, two violet stripes
    shape(t([[-250, 20], [-200, -70], [-60, -116], [80, -118], [200, -80], [262, 0], [240, 70], [120, 100], [-40, 100], [-190, 80]]), JADE, { angle: 60, over: 0.4 });
    for (const x of [-30, 100]) c.tint(t([[x - 24, -110], [x + 18, -112], [x + 30, 92], [x - 14, 96]]), CAM.VIOLET, { angle: 80, wash: 0.42 });
    c.tint(t([[-240, 40], [-180, 80], [-40, 98], [120, 96], [40, 70], [-150, 60]]), CAM.BELLY, { wash: 0.85 });
    // the near legs braced: the hind one pushing, the front one reaching forward
    openLimb(c, [T([200, 20]), T([130, 50]), [970, 740], [970, 790], [1010, 790], [1010, 730], T([220, 70])], JADE, 1, 5);
    grip(c, 990, 800, 1, JADE);
    // the head low and forward, a small rounded casque with one violet band, the hypnotic stare
    const h = T([-300, -30]);
    const { eye, mouth, t: ht } = camHead(c, h[0], h[1], 0.98, -16, 64, JADE, { smile: 1.4 });
    c.stroke(ht([[0, -96], [44, -126], [86, -148], [122, -122], [146, -60]]), { w: 16, col: CAM.VIOLET });
    turret(c, eye[0], eye[1], 68, [-0.5, 0.05], JADE, 1, 0.22);
    // the near front foot raised mid-step in front of it, stalking
    c.part('patte', { pivot: T([-140, 40]), motion: 'swing', amp: 3, period: 2.6 }, () => {
      openLimb(c, [T([-60, 20]), T([-120, 50]), [740, 708], [706, 730], [726, 756], [780, 730], T([-50, 96])], JADE, 1, 5);
      grip(c, 702, 744, 0.95, JADE, 70);
    });
    // a fast, precise strike: the tongue shot out straight and thin, its tip glowing
    c.part('langue', { pivot: mouth, motion: 'reach', amp: 4, period: 2 }, () => {
      tongue(c, [mouth, [mouth[0] - 170, mouth[1] - 14], [mouth[0] - 340, mouth[1] - 30]], 11);
      for (const dy of [-26, 12]) c.stroke([[mouth[0] - 150, mouth[1] + dy - 10], [mouth[0] - 250, mouth[1] + dy - 18]], { w: 3.5, col: CAM.VIOLET });
    });
  },
} satisfies Redraw;
