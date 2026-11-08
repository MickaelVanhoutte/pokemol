import { describe, expect, it } from 'vitest';
import { advance } from './sceneClock';

describe('scene clock', () => {
  it('runs like real time, then three times faster while hurried', () => {
    let c = { scene: 0, last: 0, speed: 1 };
    c = advance(c, 100, 1);
    expect(c.scene).toBe(100);
    // B held from 100 ms: the next 100 ms count three times
    c = advance(c, 100, 3);
    c = advance(c, 200, 3);
    expect(c.scene).toBe(400);
    // let go
    c = advance(c, 250, 1);
    expect(c.scene).toBe(550);
    c = advance(c, 300, 1);
    expect(c.scene).toBe(600);
  });

  it('never goes backwards', () => {
    const c = advance({ scene: 50, last: 100, speed: 1 }, 90, 1);
    expect(c.scene).toBe(50);
  });
});
