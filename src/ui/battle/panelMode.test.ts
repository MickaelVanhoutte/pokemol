import { describe, expect, it } from 'vitest';
import { panelMode, type PanelState } from './panelMode';

const base: PanelState = { busy: false, ended: false, coach: false, learnPending: false, forced: false, menu: 'main' };

describe('battle panel mode', () => {
  it('shows exactly one thing at a time', () => {
    expect(panelMode(base)).toBe('command');
    expect(panelMode({ ...base, menu: 'fight' })).toBe('fight');
    expect(panelMode({ ...base, busy: true, menu: 'fight' })).toBe('message');
    expect(panelMode({ ...base, learnPending: true })).toBe('learnAsk');
    expect(panelMode({ ...base, forced: true })).toBe('message');
    expect(panelMode({ ...base, coach: true })).toBe('coach');
    expect(panelMode({ ...base, ended: true, busy: true })).toBe('continue');
  });
});
