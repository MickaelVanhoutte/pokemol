import { describe, expect, it } from 'vitest';
import { MAPS } from '../data/maps';
import { trackForMap } from './mapMusic';

describe('the music of each moment', () => {
  it('plays the routes’ night tune at night, and the later routes their own', () => {
    expect(trackForMap(MAPS.route1)).toBe('route');
    expect(trackForMap(MAPS.route1, undefined, { night: true })).toBe('routeNuit');
    expect(trackForMap(MAPS.route7)).toBe('route2');
    expect(trackForMap(MAPS.route7, undefined, { night: true })).toBe('routeNuit');
    // towns keep their own theme at night
    expect(trackForMap(MAPS.bourg, undefined, { night: true })).toBe('bourg');
  });

  it('plays the bike’s tune outdoors, the boat’s on the water, and under the water its own', () => {
    expect(trackForMap(MAPS.route1, undefined, { biking: true })).toBe('velo');
    expect(trackForMap(MAPS.bourg, undefined, { biking: true })).toBe('velo');
    expect(trackForMap(MAPS.route3, undefined, { surfing: true })).toBe('mer');
    expect(trackForMap(MAPS.lacFonds)).toBe('fonds');
    // special places keep theirs
    expect(trackForMap(MAPS.routeBlanche, undefined, { biking: true })).toBe('edge');
  });
});
