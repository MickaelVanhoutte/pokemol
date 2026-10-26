/** A letter for what a creature was born with in one stat (its IV, 0–31), shown in the summary. */
export type Grade = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

/** Six bands of six IVs (S: only 30 and 31). The average IV (15–16) is a C. */
export function ivGrade(iv: number): Grade {
  return iv >= 30 ? 'S' : iv >= 24 ? 'A' : iv >= 18 ? 'B' : iv >= 12 ? 'C' : iv >= 6 ? 'D' : 'E';
}
