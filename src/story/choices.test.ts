import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOOKS } from '../data/appearance';

vi.mock('../audio/sfx', () => ({ sfx: new Proxy({}, { get: () => () => undefined }) }));

const { CHOICES, COCONFUS, GARDE, RETOUCHE, endingOf, findCoconfus, tally } = await import('./choices');
const { createMon, evolutionOf } = await import('../engine/pk/creature');
const { newGame } = await import('../state/game');

const flags = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [`choix:${k}`, v]));

describe('the choices that lead to an ending', () => {
  it('counts one vote per story choice and two for the final answer', () => {
    expect(tally(flags({ tache: 1, musee: 2, pont: 2, final: 1 }))).toEqual({ a: 3, b: 2 });
    expect(tally({})).toEqual({ a: 0, b: 0 });
  });

  it('follows the majority, so the final answer only decides when it is close', () => {
    const allA = Object.fromEntries(CHOICES.map((c) => [c, RETOUCHE]));
    expect(endingOf(flags({ ...allA, final: GARDE }))).toBe(RETOUCHE);
    expect(endingOf(flags({ tache: 1, musee: 1, pont: 1, feutre: 2, rival: 2, encre: 2, hameau: 2, final: 1 }))).toBe(RETOUCHE);
    expect(endingOf(flags({ tache: 1, musee: 1, pont: 2, feutre: 2, rival: 2, encre: 2, hameau: 2, final: 1 }))).toBe(GARDE);
  });

  it('gives a tie to the final answer (a save that missed some choices)', () => {
    expect(endingOf(flags({ tache: 1, musee: 1, final: 2 }))).toBe(GARDE);
    expect(endingOf(flags({ tache: 2, musee: 2, final: 1 }))).toBe(RETOUCHE);
  });

  it('never evolves Coconfus by level: only the ending does', () => {
    expect(evolutionOf(createMon(COCONFUS, 100, { rng: 1 }))).toBeNull();
  });

  it('finds Coconfus in the party, the PC or the daycare', () => {
    const d = newGame('Lou', DEFAULT_LOOKS.f, 'f', 'Feutre');
    expect(findCoconfus(d)).toBeUndefined();
    const m = createMon(COCONFUS, 12, { rng: 2 });
    d.boxes[3].push(m);
    expect(findCoconfus(d)).toBe(m);
    d.boxes[3] = [];
    d.daycare = { slots: [{ mon: m, level: 12 }], egg: false };
    expect(findCoconfus(d)).toBe(m);
  });
});
