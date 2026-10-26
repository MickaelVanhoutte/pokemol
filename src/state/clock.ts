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
