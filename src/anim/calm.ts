import { prefs } from '../state/prefs';

/**
 * MOUVEMENTS : DOUX. Transitions, splashes and scenes stay simple: fades instead of sweeps, no camera
 * moves, shakes or freeze-frames. The story and its timings are the same.
 */
export const calmMotion = () => prefs.value.motion === 'calm';
