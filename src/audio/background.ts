/** No sound while the app is in the background or the phone is locked: it comes back with the app. */

export const hidden = (): boolean => typeof document !== 'undefined' && document.visibilityState === 'hidden';

/** Suspends the audio context when the page is hidden and resumes it when it shows again. */
export function silentWhenHidden(ctx: () => AudioContext | null) {
  if (typeof document === 'undefined') return;
  document.addEventListener('visibilitychange', () => {
    const c = ctx();
    if (!c || c.state === 'closed') return;
    void (hidden() ? c.suspend() : c.resume()).catch(() => undefined);
  });
}
