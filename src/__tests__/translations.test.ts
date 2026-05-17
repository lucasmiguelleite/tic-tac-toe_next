import { describe, it, expect } from 'vitest';
import { translate } from '@/i18n/translations';

describe('translate', () => {
  it('returns existing key in the requested locale', () => {
    expect(translate('en', 'site.title')).toBe('Tic-Tac-Toe #');
    expect(translate('pt', 'site.title')).toBe('Jogo da Velha #');
  });

  it('interpolates params', () => {
    expect(translate('en', 'status.playerTurn', { name: 'Alice' })).toBe("Alice's turn");
    expect(translate('pt', 'status.playerTurn', { name: 'Alice' })).toBe('Vez de Alice');
  });

  it('falls back to en when key missing in locale', () => {
    const key = 'home.selectOption';
    expect(translate('en', key)).toBe('Select one option:');
  });

  it('returns the key itself when not found in any locale', () => {
    expect(translate('en', 'nonexistent.key')).toBe('nonexistent.key');
    expect(translate('pt', 'nonexistent.key')).toBe('nonexistent.key');
  });

  it('interpolates multiple params', () => {
    expect(translate('en', 'status.itsTurn', { player: 'X' })).toBe("It's X turn");
  });
});
