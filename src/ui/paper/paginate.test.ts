import { describe, expect, it } from 'vitest';
import { paginate } from './paginate';

// a box of 2 lines of 10 characters
const fits = (s: string) => {
  let lines = 0;
  for (const para of s.split('\n')) {
    let len = 0;
    lines++;
    for (const w of para.split(' ')) {
      if (len && len + 1 + w.length > 10) { lines++; len = w.length; } else len += (len ? 1 : 0) + w.length;
    }
  }
  return lines <= 2;
};

describe('paginate', () => {
  it('keeps short text on one page', () => {
    expect(paginate('Bonjour !', fits)).toEqual(['Bonjour !']);
  });
  it('cuts long text between words into pages that fit', () => {
    const pages = paginate('un deux trois quatre cinq six sept huit neuf dix', fits);
    expect(pages.length).toBeGreaterThan(1);
    for (const p of pages) expect(fits(p)).toBe(true);
    expect(pages.join(' ')).toBe('un deux trois quatre cinq six sept huit neuf dix');
  });
  it('keeps line breaks', () => {
    expect(paginate('a\nb\nc', fits)).toEqual(['a\nb', 'c']);
  });
});
