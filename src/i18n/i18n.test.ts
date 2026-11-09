import { describe, expect, it } from 'vitest';
import { L, tr } from './index';

describe('French text', () => {
  it('elides « de » before a name that starts with a vowel, not inside a word', () => {
    expect(tr(L('{a} de {n} !', '{n}’s {a}!'), { a: 'Troisième Œil', n: 'Ombrouille' })).toBe('Troisième Œil d’Ombrouille !');
    expect(tr(L('{s} de {n} augmente !', ''), { s: 'Attaque', n: 'Érabreuil' })).toBe('Attaque d’Érabreuil augmente !');
    expect(tr(L('Attaque de {n}', ''), { n: 'Scaraprisme' })).toBe('Attaque de Scaraprisme');
    expect(tr(L('Montagnarde Olga', ''))).toBe('Montagnarde Olga');
  });

  it('keeps « and » with the words they enclose', () => {
    expect(tr(L('Il a dit « bonjour » !', ''))).toBe('Il a dit «\u00a0bonjour\u00a0»\u00a0!');
  });
});
