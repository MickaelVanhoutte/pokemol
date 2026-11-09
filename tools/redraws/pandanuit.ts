import type { Redraw } from './crayon.ts';
import { openLimb } from './anatomy.ts';
import { limb, pad, pandaHead, ring, tailBand } from './pandaKit.ts';

/**
 * Pandanuit, the night prowler (« le rôdeur de la nuit »): Pandoudou redrawn with a night-blue Magic Pencil. It stalks
 * low, chest near the ground, shoulder blades up, head below its back line, one front paw lifted mid-step; its narrowed
 * eyes keep a gold glint and it grins on one side, one fang showing. Its long tail trails low behind it, a band of night
 * sky with a gold star in each dark ring, only the tip flicking up. By day, it yawns.
 */
export default {
  id: '128', slug: 'pandanuit', seed: 1281, size: [1150, 900], tilt: 0,
  draw(c) {
    const NAVY = '#33407a', DEEP = '#121733', CREAM = '#f5e8cf', STAR = '#ffc81e', FAR = '#252f5c', PAW = '#2e3a78';

    /** A four-pointed star. */
    const star = (x: number, y: number, r: number) => {
      c.shape([[x, y - r], [x + r * 0.3, y - r * 0.3], [x + r, y], [x + r * 0.3, y + r * 0.3], [x, y + r], [x - r * 0.3, y + r * 0.3], [x - r, y], [x - r * 0.3, y - r * 0.3]], STAR, { over: 0, wash: 1, press: 1.3 }, { w: 3 }, false);
    };
    // the long tail trailing low behind, only its tip flicking up
    c.part('queue', { pivot: [800, 520], motion: 'swing', amp: 1.5, period: 3.2, behind: true }, () => {
      const { sp, ws, out } = tailBand([[780, 520], [880, 570], [980, 580], [1060, 540], [1090, 470], [1070, 410]], (t) => 104 + Math.sin(t * Math.PI) * 20 - (t > 0.85 ? (t - 0.85) * 400 : 0), 56);
      c.shape(out, NAVY, { angle: 20, over: 0.45 }, { w: 0.1 });
      for (let r = 0; r < 4; r++) {
        c.tint(ring(sp, ws, r, 4, 0.14, 0.9), DEEP, { angle: 70, wash: 1, press: 1.2 });
        const i = Math.round((0.14 + ((r + 0.21) / 4) * 0.76) * 55);
        star(sp[i][0], sp[i][1], 24);
      }
      c.stroke([...out, out[0], out[1]], { w: 5 });
    });
    // far legs, darker: the front one planted and bent, the hind one gathered under, ready to spring
    limb(c, [[510, 560], [520, 660], [470, 760], [452, 800]], [76, 60, 50, 44], FAR);
    pad(c, 446, 808, 80, 0.95, PAW);
    limb(c, [[780, 560], [800, 650], [870, 740], [836, 800]], [84, 60, 50, 44], FAR);
    pad(c, 830, 808, 80, 0.95, PAW);
    // the body and neck in one outline: the neck reaching down and forward, the shoulder blades the highest point, the back
    // dipping, the rump gathered, the chest low
    c.shape([[300, 520], [380, 500], [450, 420], [510, 380], [560, 420], [610, 456], [680, 480], [760, 470], [820, 500], [836, 560], [800, 610],
      [720, 630], [620, 640], [540, 680], [460, 700], [400, 676], [340, 620], [280, 580]], NAVY, { angle: 20, over: 0.45 });
    c.tint(c.potato(420, 640, 48, 50, 10, 0.08), CREAM, { angle: 70, wash: 0.75 });
    // the near hind leg: the round haunch, the knee forward, the hock back
    openLimb(c, [[680, 500], [790, 490], [830, 560], [790, 630], [710, 640], [670, 580]], NAVY, 1, 5);
    limb(c, [[740, 600], [690, 690], [780, 760], [742, 800]], [96, 64, 50, 44], NAVY);
    pad(c, 736, 808, 80, 1, PAW);
    // the near front paw lifted mid-step: elbow back, forearm forward, the paw curled
    limb(c, [[460, 600], [470, 700], [380, 720], [340, 744]], [90, 66, 54, 48], NAVY);
    pad(c, 326, 752, 60, 1, PAW);
    pandaHead(c, { fur: NAVY, deep: DEEP, cream: CREAM, pink: CREAM }, 280, 600, 0.7, -12, 'menace');
  },
} satisfies Redraw;
