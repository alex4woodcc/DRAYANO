/**
 * @file use-games hook.
 * Fetches available game options from Supabase so the app can render game
 * lists dynamically without hardcoding identifiers.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Game } from '@/types/database';


/**
 * Built-in fallback game list.
 * Enables instant rendering and avoids slow first paint when Supabase is
 * unavailable or responds slowly. Values for `uses_type_based_damage` default
 * to `false` until real data loads.
 */
const fallbackGames: Game[] = [
  { id: 'FRO', name: 'FireRed Omega', short_name: 'FRO', uses_type_based_damage: false },
  { id: 'SG', name: 'Sacred Gold', short_name: 'SG', uses_type_based_damage: false },
  { id: 'RP', name: 'Renegade Platinum', short_name: 'RP', uses_type_based_damage: false },
  { id: 'VW2', name: 'Volt White 2', short_name: 'VW2', uses_type_based_damage: false },
];


/** Retrieve all games from Supabase with basic metadata. */
export function useGames() {
  return useQuery<Game[]>({
    queryKey: ['games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        // Select known columns from the games table. Avoid requesting
        // non-existent fields which would trigger a 400 response.
        .select('id, name, short_name, uses_type_based_damage');

      if (error) {
        console.warn('Falling back to local game list', error);
        return fallbackGames;
      }
      // Normalize Sacred Gold naming across data sources. Supabase may
      // return "SG/SS" but the UI should consistently show just "SG".
      const list = (data && data.length > 0 ? data : fallbackGames).map((g) =>
        g.id === 'SG' ? { ...g, short_name: 'SG' } : g
      );
      return list;

    },
    initialData: fallbackGames,
  });
}
