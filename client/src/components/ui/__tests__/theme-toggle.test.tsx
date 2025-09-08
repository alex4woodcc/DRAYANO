import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme } from '../theme-toggle';

/**
 * Unit tests for theme toggling behaviour.
 * Ensures that the root color-scheme mirrors the chosen theme
 * so native form controls match light or dark modes.
 */
describe('applyTheme', () => {
  beforeEach(() => {
    const html = document.documentElement;
    html.removeAttribute('data-bs-theme');
    html.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
  });

  it('updates document.colorScheme for light and dark themes', () => {
    applyTheme('light');
    expect(document.documentElement.style.colorScheme).toBe('light');

    applyTheme('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
