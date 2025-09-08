import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GameId } from '@/types/database';

interface PreflightResult {
  isReady: boolean;
  error?: string;
}

export function usePreflight(gameId: GameId = 'FRO') {
  return useQuery<PreflightResult>({
    queryKey: ['preflight', gameId],
    queryFn: async () => {
      try {
        // Simple connection test - just try to fetch one Pokemon
        const { data, error } = await supabase
          .from('v_pokedex_app')
          .select('*')
          .eq('game_id', gameId)
          .limit(1);

        if (error) {
          throw new Error(`Database connection failed: ${error.message}`);
        }

        if (!data || data.length === 0) {
          throw new Error(`No Pokémon found for game ${gameId}`);
        }

        return { isReady: true };
      } catch (error) {
        console.error('Preflight error:', error);
        return {
          isReady: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}
