/**
 * Day and night follow the device's clock, shifted by the naps taken in the bed at home
 * (`save.clockShift`, in hours): day 7–19 h, evening 19–21 h, night 21–7 h.
 */
export type DayPhase = 'day' | 'evening' | 'night';

/** The hour of the day in Papeterre (0–24, with minutes as a fraction). */
export function hourNow(shift = 0, now = Date.now()): number {
  const d = new Date(now);
  return (((d.getHours() + d.getMinutes() / 60 + shift) % 24) + 24) % 24;
}

export function phaseAt(hour: number): DayPhase {
  return hour >= 7 && hour < 19 ? 'day' : hour >= 19 && hour < 21 ? 'evening' : 'night';
}

/** The shift that makes it `target` o’clock now. */
export function shiftTo(target: number, now = Date.now()): number {
  return Math.round((((target - hourNow(0, now)) % 24) + 24) % 24 * 60) / 60;
}

/** Wild Bestioles marked for one time only show up then (evening counts as day). */
export const meetsTime = (time: 'day' | 'night' | undefined, phase: DayPhase) => !time || (time === 'night') === (phase === 'night');

export type Rgb = [number, number, number];

/** The colours the world is multiplied by: white by day, warm in the evening, blue at night. */
export const DAY_TINT: Rgb = [255, 255, 255];
export const EVENING_TINT: Rgb = [255, 200, 165];
export const NIGHT_TINT: Rgb = [105, 120, 200];

const blend = (a: Rgb, b: Rgb, k: number): Rgb => a.map((v, i) => Math.round(v + (b[i] - v) * k)) as Rgb;

/**
 * The time of day's colour at `hour`, changing softly over an hour around 7 h (night to day), 19 h (day to
 * evening) and 21 h (evening to night), instead of all at once.
 */
export function tintAt(hour: number): Rgb {
  const h = ((hour % 24) + 24) % 24;
  const k = (from: number) => Math.min(1, Math.max(0, h - from));
  if (h >= 6.5 && h < 7.5) return blend(NIGHT_TINT, DAY_TINT, k(6.5));
  if (h >= 7.5 && h < 18.5) return DAY_TINT;
  if (h >= 18.5 && h < 19.5) return blend(DAY_TINT, EVENING_TINT, k(18.5));
  if (h >= 19.5 && h < 20.5) return EVENING_TINT;
  if (h >= 20.5 && h < 21.5) return blend(EVENING_TINT, NIGHT_TINT, k(20.5));
  return NIGHT_TINT;
}
