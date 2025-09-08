/**
 * @file Navigation component tests verifying route label and game pill styling.
 * Ensures the navbar reflects current route and game context.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Router } from 'wouter';
import { createMemoryLocation } from 'wouter/memory-location';
import { Navigation } from '../Navigation';
import '@/styles/bootstrap-theme.css';

// Mock game hooks to provide deterministic context values for tests.
vi.mock('@/hooks/use-game', () => ({
  useGame: () => ({ currentGame: 'FRO' })
}));

vi.mock('@/hooks/use-games', () => ({
  useGames: () => ({
    data: [
      { id: 'FRO', name: 'FireRed Omega', short_name: 'FRO', uses_type_based_damage: false }
    ]
  })
}));

/**
 * Render Navigation and ensure it reflects route and game context.
 * - The centered section label updates based on current location.
 * - The game pill displays the active game's short name with theme-aware coloring.
 */
describe('<Navigation />', () => {
  it('shows route label and themed game pill', () => {
    const location = createMemoryLocation('/pokedex');
    const { container } = render(
      <Router hook={location}>
        <Navigation />
      </Router>
    );

    const label = container.querySelector('.dg-section-label');
    expect(label?.textContent).toBe('Pokédex');

    const pill = container.querySelector('.dg-game-pill') as HTMLElement;
    expect(pill.textContent).toBe('FRO');

    const nav = container.querySelector('nav') as HTMLElement;
    expect(nav.style.getPropertyValue('--dg-navbar-bg')).toBe('#7f1d1d');

    // Mix FRO background (#7f1d1d) with white at 70% as in CSS color-mix
    expect(getComputedStyle(pill).backgroundColor).toBe('rgb(217, 187, 187)');
  });
});
