/**
 * @file Global game selection store.
 * Manages the currently active game using Zustand with localStorage persistence
 * and triggers React Query cache invalidation on changes so data stays in sync.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/lib/queryClient';
import { GameId } from '@/types/database';

// Derive the initial game from the URL query if present; defaults to FRO.
function initialGame(): GameId {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('game');
    if (fromUrl) {
      return fromUrl as GameId;
    }
  }
  return 'FRO';
}

/**
 * Shape of the game selection store.
 */
interface GameState {
  /** Currently active game identifier. */
  currentGame: GameId;
  /** Updates the active game and invalidates existing queries. */
  setCurrentGame: (game: GameId) => void;
}

/**
 * Zustand store for accessing and mutating the active game.
 * State persists to `localStorage` so the choice survives reloads.
 */
export const useGame = create<GameState>()(
  persist(
    (set) => ({
      currentGame: initialGame(),
      setCurrentGame: (game: GameId) => {
        set({ currentGame: game });
        // Invalidate all queries so components refetch with the new game context
        queryClient.invalidateQueries();
      },
    }),
    {
      name: 'drayano-game-selection',
    }
  )
);
