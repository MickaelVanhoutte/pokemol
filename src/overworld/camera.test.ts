import { describe, expect, it } from 'vitest';
import { Camera, frame, shakeAmount, tilesInView } from './camera';
import { bubbleScale } from './game';

/** The camera as it was before it could move: centred on the player, inside the map. */
function legacy(px: number, py: number, mapW: number, mapH: number, viewW: number, viewH: number) {
  const x = mapW <= viewW ? (mapW - viewW) / 2 : Math.min(Math.max(px + 8 - viewW / 2, 0), mapW - viewW);
  const y = mapH <= viewH ? (mapH - viewH) / 2 : Math.min(Math.max(py + 8 - viewH / 2, 0), mapH - viewH);
  return [x, y];
}

describe('overworld camera', () => {
  it('frames the player exactly as before', () => {
    for (const [px, py] of [[0, 0], [160, 96], [500, 700], [32, 640]]) {
      for (const [mw, mh, vw, vh] of [[640, 800, 180, 300], [200, 120, 240, 160], [960, 320, 206, 175]]) {
        expect(frame(px + 8, py + 8, mw, mh, vw, vh)).toEqual(legacy(px, py, mw, mh, vw, vh));
      }
    }
  });

  it('lists the tiles a view shows', () => {
    expect(tilesInView(0, 0, 240, 160)).toEqual({ x0: 0, x1: 14, y0: 0, y1: 9 });
    expect(tilesInView(8, 8, 32, 32)).toEqual({ x0: 0, x1: 2, y0: 0, y1: 2 });
  });

  it('pans to a point, holds it, then comes back to the player', () => {
    let t = 0;
    const cam = new Camera(() => t, () => false);
    expect(cam.focus([100, 100])).toEqual([100, 100]);
    cam.panTo(300, 200, 400);
    t = 200;
    const mid = cam.focus([100, 100]);
    expect(mid[0]).toBeGreaterThan(100);
    expect(mid[0]).toBeLessThan(300);
    t = 400;
    expect(cam.focus([100, 100])).toEqual([300, 200]);
    t = 900;
    expect(cam.focus([100, 100])).toEqual([300, 200]);
    cam.follow(300);
    t = 1200;
    // it follows the player even while the player walks
    expect(cam.focus([120, 100])).toEqual([120, 100]);
    expect(cam.idle()).toBe(true);
  });

  it('zooms in and back, never out', () => {
    let t = 0;
    const cam = new Camera(() => t, () => false);
    cam.zoomTo(2, 200);
    t = 100;
    expect(cam.zoomNow()).toBeGreaterThan(1);
    expect(cam.zoomNow()).toBeLessThan(2);
    t = 200;
    expect(cam.zoomNow()).toBe(2);
    cam.zoomTo(0.5, 0);
    expect(cam.zoomNow()).toBe(1);
  });

  it('gentle motion: a pan is a cut, no zoom, no shake', () => {
    let t = 0;
    const cam = new Camera(() => t, () => true);
    cam.panTo(300, 200, 400);
    expect(cam.focus([100, 100])).toEqual([300, 200]);
    cam.zoomTo(2, 200);
    t = 300;
    expect(cam.zoomNow()).toBe(1);
    cam.shake('quake', 500);
    expect(cam.shakeOffset()).toEqual([0, 0]);
  });

  it('shakes die out (a jolt) or keep on (a rumble) until they end', () => {
    expect(shakeAmount('jolt', 0)).toBeGreaterThan(shakeAmount('jolt', 0.8));
    expect(shakeAmount('rumble', 0)).toBe(shakeAmount('rumble', 0.9));
    let t = 0;
    const cam = new Camera(() => t, () => false);
    cam.shake('quake', 100);
    t = 50;
    const [dx] = cam.shakeOffset(() => 1);
    expect(Math.abs(dx)).toBeGreaterThan(0);
    t = 150;
    expect(cam.shakeOffset(() => 1)).toEqual([0, 0]);
  });
});

describe('bubbles', () => {
  it('pop in a little too big, then settle', () => {
    expect(bubbleScale(0)).toBeCloseTo(0.5);
    expect(Math.max(...Array.from({ length: 15 }, (_, i) => bubbleScale(i * 10)))).toBeGreaterThan(1.2);
    expect(bubbleScale(140)).toBe(1);
    expect(bubbleScale(5000)).toBe(1);
  });
});
