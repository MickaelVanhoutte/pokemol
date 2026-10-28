import { describe, expect, it } from 'vitest';
import { MAPS } from '../maps';
import { throughBarriers } from '../puzzleSearch';

/** Atelier Braise: Amber's flames are crayon barriers, two switches open the way to her. */
describe('Ember Atelier', () => {
  it('lets the switches lead through Amber\'s flames to her, and none is not enough', () => {
    const def = MAPS.atelierBraise;
    // in front of Amber, from the door
    expect(throughBarriers(def, [7, 16], [7, 3])).not.toBeNull();
    expect(throughBarriers(def, [7, 16], [7, 3], false)).toBeNull();
  });
});
