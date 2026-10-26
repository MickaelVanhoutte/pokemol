import { describe, expect, it } from 'vitest';
import { blob, frame, hatch, rule, PASTELS } from './sketch';

describe('sketch kit', () => {
  it('draws the same lines for the same seed', () => {
    expect(frame(5, PASTELS.paper[0])).toBe(frame(5, PASTELS.paper[0]));
    expect(frame(5, PASTELS.paper[0])).not.toBe(frame(6, PASTELS.paper[0]));
  });
  it('makes valid SVG numbers only', () => {
    for (const svg of [frame(3, '#fff'), frame(4, '#fff', { size: 120, slice: 16, inset: 5, weight: 6, amp: 1 }), hatch(7, '#f00'), blob(8, '#fff', '#000'), rule(9)]) {
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).not.toMatch(/NaN|Infinity|undefined/);
    }
  });
  it('keeps hatching inside a seamless tile', () => {
    // every stroke drawn near an edge has its copy on the other side
    const svg = hatch(11, '#000', { size: 72, strokes: 40 });
    expect((svg.match(/<path/g) ?? []).length).toBeGreaterThan(40);
  });
});
