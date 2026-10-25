/** What the fixed-height bottom panel of the battle shows. Exactly one mode at a time. */
export type PanelMode = 'message' | 'continue' | 'coach' | 'learnAsk' | 'fight' | 'command';

export interface PanelState {
  busy: boolean;
  ended: boolean;
  coach: boolean;
  learnPending: boolean;
  forced: boolean;
  menu: 'main' | 'fight';
}

export function panelMode(s: PanelState): PanelMode {
  if (s.ended) return 'continue';
  if (s.busy) return 'message';
  if (s.learnPending) return 'learnAsk';
  // a fainted creature must be replaced: the party opens over the battle, the panel just explains
  if (s.forced) return 'message';
  if (s.coach) return 'coach';
  return s.menu === 'fight' ? 'fight' : 'command';
}
