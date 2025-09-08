/**
 * @file Detailed view for a single Pokémon including stats, abilities, and
 * learnset. The layout employs responsive grids and cards while sprites use
 * Bootstrap ratio utilities and explicit sizing to remain crisp across breakpoints.
*/
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TypeBadge } from './TypeBadge';
import { MoveCategoryBadge } from '@/components/moves/MoveCategoryBadge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { PokedexDetail, GameId } from '@/types/database';
import { Sprite } from '@/components/common/Sprite';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

interface PokemonDetailProps {
  formeId: string;
  gameId: GameId;
}

/**
 * Render a Pokémon's base stats as color-coded progress bars for quick
 * comparison.
 */
function BaseStatsDisplay({ pokemon }: { pokemon: PokedexDetail }) {
  const MAX_BASE_STAT = 255;
  const stats = [
    { name: 'HP', value: pokemon.hp, color: 'bg-green-500' },
    { name: 'Attack', value: pokemon.atk, color: 'bg-red-500' },
    { name: 'Defense', value: pokemon.def, color: 'bg-yellow-500' },
    { name: 'Sp. Atk', value: pokemon.spa, color: 'bg-blue-500' },
    { name: 'Sp. Def', value: pokemon.spd, color: 'bg-purple-500' },
    { name: 'Speed', value: pokemon.spe, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-3">
      {stats.map((stat) => (
        <div key={stat.name}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{stat.name}</span>
            <span className="text-sm font-medium tabular-nums">{stat.value}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded bg-muted/40">
            <div
              role="progressbar"
              aria-valuenow={stat.value}
              aria-valuemin={0}
              aria-valuemax={MAX_BASE_STAT}
              aria-label={`${stat.name} ${stat.value}`}
              className={`h-full rounded ${stat.color} transition-all duration-500`}
              style={{ width: `${Math.max(5, (stat.value / MAX_BASE_STAT) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Build an HTML string summarizing move details for tooltip content. */
function buildMoveTooltip(move: {
  type_id: string;
  power?: number;
  accuracy?: number;
  effect_text?: string;
}) {
  const parts = [
    `Type: ${move.type_id}`,
    `Power: ${move.power ?? '—'}`,
    `Accuracy: ${move.accuracy ?? '—'}`,
  ];
  if (move.effect_text) parts.push(move.effect_text);
  return parts.join('<br/>');
}

/**
 * Show types, abilities, and base stats inside responsive cards for the
 * overview tab.
 */
function OverviewTab({ pokemon }: { pokemon: PokedexDetail }) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 gap-2">
            <TypeBadge type={pokemon.type1_id} />
            {pokemon.type2_id && <TypeBadge type={pokemon.type2_id} />}
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">Abilities</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {pokemon.ability1_name && (
                <div className="rounded-md bg-muted/30 p-3">
                  <InfoTooltip content={pokemon.ability1_description || ''}>
                    <span className="block font-medium">{pokemon.ability1_name}</span>
                  </InfoTooltip>
                  <span className="text-sm text-muted-foreground">Ability 1</span>
                </div>
              )}
              {pokemon.ability2_name && (
                <div className="rounded-md bg-muted/30 p-3">
                  <InfoTooltip content={pokemon.ability2_description || ''}>
                    <span className="block font-medium">{pokemon.ability2_name}</span>
                  </InfoTooltip>
                  <span className="text-sm text-muted-foreground">Ability 2</span>
                </div>
              )}
              {pokemon.hidden_ability_name && (
                <div className="rounded-md bg-muted/30 p-3">
                  <InfoTooltip content={pokemon.hidden_ability_description || ''}>
                    <span className="block font-medium">{pokemon.hidden_ability_name}</span>
                  </InfoTooltip>
                  <span className="text-sm text-muted-foreground">Hidden</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="mb-3 text-lg font-semibold text-foreground">Base Stats</h3>
          <BaseStatsDisplay pokemon={pokemon} />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Render moves grouped by acquisition method.
 * Each move row is wrapped in a Card to provide consistent spacing and
 * interaction feedback while maintaining the responsive grid layout.
 */
function LearnsetTab({ learnset }: { learnset: PokedexDetail['learnset'] }) {
  if (!learnset || Object.keys(learnset).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No learnset data available</p>
      </div>
    );
  }

  // Sort methods in a logical order
  const methodOrder = ['LEVEL', 'TM', 'HM', 'TUTOR', 'EGG', 'OTHER'];
  const sortedMethods = Object.keys(learnset).sort((a, b) => {
    const aIndex = methodOrder.indexOf(a);
    const bIndex = methodOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className="grid gap-6">
      {sortedMethods.map((method) => {
        const moves = learnset[method];
        if (!moves || moves.length === 0) return null;

        // Sort moves within each method
        const sortedMoves = [...moves].sort((a, b) => {
          if (method === 'LEVEL' && a.level !== undefined && b.level !== undefined) {
            return a.level - b.level;
          }
          return a.name.localeCompare(b.name);
        });

        return (
          <div key={method}>
            <h4 className="mb-3 text-md font-semibold capitalize">
              {method.toLowerCase()} Moves ({moves.length})
            </h4>
            <div className="grid gap-2 md:grid-cols-2">
              {sortedMoves.map((move, index) => (
                <Card
                  key={`${method}-${index}`}
                  className="shadow-none hover:shadow-sm focus-within:ring"
                >
                  <CardContent className="flex items-center justify-between gap-2 p-2">
                    <div className="flex items-center gap-2">
                      <InfoTooltip content={buildMoveTooltip(move)}>
                        <span className="font-medium">{move.name}</span>
                      </InfoTooltip>
                      <TypeBadge type={move.type_id} />
                      <MoveCategoryBadge category={move.category} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {move.level && <span className="font-mono">Lv.{move.level}</span>}
                      {move.power && <span className="font-mono">{move.power} PWR</span>}
                      {move.accuracy && (
                        <span className="font-mono">{move.accuracy}% ACC</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Displays the full detail page for a specific Pokémon.
 *
 * @param formeId - Forme identifier for the Pokémon.
 * @param gameId - Game context used for data queries.
 */
export default function PokemonDetail({ formeId, gameId }: PokemonDetailProps) {
  const [tab, setTab] = useState<'overview' | 'learnset'>('overview');

  const { data: pokemon, isLoading, error, refetch } = useQuery<PokedexDetail | null>({
    queryKey: ['pokedex-detail', formeId, gameId],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_pokedex_detail_app')
        .select('*')
        .eq('game_id', gameId)
        .eq('forme_id', formeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton count={6} className="h-8" />;
  if (error) return <ErrorBoundary error={error} onRetry={() => refetch()} title="Failed to load Pokémon" />;
  if (!pokemon) return <div className="text-center py-8"><p className="text-muted-foreground">Pokémon not found</p></div>;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left card */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24 bg-card backdrop-blur supports-[backdrop-filter]:bg-card">
          <CardContent className="p-6">
            <div className="text-center">
              <Sprite
                src={pokemon.sprite_default_url}
                alt={pokemon.display_name}
                size={192}
                width={192}
                height={192}
                className="mx-auto mb-4 rounded-lg bg-muted"
                placeholder={<span className="text-4xl">🐾</span>}
              />
              <h2 className="text-2xl font-bold text-foreground">{pokemon.display_name}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right tabs */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-0">
            <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
              <TabsList className="grid w-full grid-cols-2 gap-1 rounded-lg bg-muted/40 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow">Overview</TabsTrigger>
                <TabsTrigger value="learnset" className="data-[state=active]:bg-background data-[state=active]:shadow">Learnset</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-6">
                <OverviewTab pokemon={pokemon} />
              </TabsContent>

              <TabsContent value="learnset" className="p-6">
                <LearnsetTab learnset={pokemon.learnset} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

