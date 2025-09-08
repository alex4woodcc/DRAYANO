/**

 * @file Pokemon card with properly contained sprites and responsive design.
 * Sprites are constrained within their containers to prevent overflow.
 */
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { TypeBadge } from './TypeBadge';
import { PokedexEntry, PokedexDetail } from '@/types/database';
import { useGame } from '@/hooks/use-game';
import { Sprite } from '@/components/common/Sprite';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface PokemonCardProps {
  pokemon: PokedexEntry;
}

/**
 * Displays a Pokémon's summary card.
 *
 * @param pokemon - The Pokédex entry for the Pokémon being displayed.
 */
export function PokemonCard({ pokemon }: PokemonCardProps) {
  const { currentGame } = useGame();
  const queryClient = useQueryClient();

  // Prefetch detailed data when the card receives focus or hover
  const prefetch = () =>
    queryClient.prefetchQuery<PokedexDetail | null>({
      queryKey: ['pokedex-detail', pokemon.forme_id, currentGame],
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      queryFn: async () => {
        const { data, error } = await supabase
          .from('v_pokedex_detail_app')
          .select('*')
          .eq('game_id', currentGame)
          .eq('forme_id', pokemon.forme_id)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
    });

  return (
    <Link
      href={`/pokemon/${pokemon.forme_id}?game=${currentGame}`}
      onMouseEnter={prefetch}
      onFocus={prefetch}
    >
      <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
        <CardContent className="p-4">
          {/* Sprite */}
          <div className="flex justify-center mb-3">
            <Sprite
              src={pokemon.sprite_default_url}
              alt={pokemon.display_name}
              size={96}
              width={96}
              height={96}
              className="bg-muted rounded-lg group-hover:bg-muted/80 transition-colors"
              placeholder={<span className="text-2xl">🐾</span>}
            />
          </div>

          {/* Name */}
          <h3 className="font-semibold text-foreground text-center group-hover:text-primary transition-colors truncate">
            {pokemon.display_name}
          </h3>

          {/* Types */}
          <div className="flex justify-center gap-1 mt-3">
            <TypeBadge type={pokemon.type1_id} />
            {pokemon.type2_id && <TypeBadge type={pokemon.type2_id} />}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
