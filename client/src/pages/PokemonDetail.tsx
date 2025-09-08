/**
 * @file Pokemon detail page that retrieves a forme ID from the route and
 * renders the full Pokémon detail view within a card wrapper. Breadcrumbs
 * include the active game so users remain oriented when navigating.
*/
import React, { Suspense } from 'react';
import '@/index.css';
import { useRoute } from 'wouter';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useGame } from '@/hooks/use-game';
import { GameId } from '@/types/database';
import { Card } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

/** Lazy load the heavy Pokémon detail component so charts hydrate unobtrusively. */
const PokemonDetail = React.lazy(() => import('../components/pokemon/PokemonDetail'));

/**
 * Page wrapper that retrieves route params and lazily renders the detail view.
 */
export default function PokemonDetailPage() {
  const [, params] = useRoute('/pokemon/:formeId');
  const { currentGame } = useGame();
  
  // Get game from URL query params if available, otherwise use current game
  const urlParams = new URLSearchParams(window.location.search);
  const gameFromUrl = urlParams.get('game') as GameId;
  const gameId = gameFromUrl || currentGame;

  if (!params?.formeId) {
    return (
      <>
        <Breadcrumbs items={[
          { label: `Pokédex (${gameId})`, href: `/pokedex?game=${gameId}` },
          { label: 'Not Found' }
        ]} />
        <Card className="p-4 mb-3">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Pokémon not found</p>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs items={[
        { label: `Pokédex (${gameId})`, href: `/pokedex?game=${gameId}` },
        { label: 'Details' }
      ]} />

      <Card className="p-4 mb-3">
        <Suspense fallback={<LoadingSkeleton count={6} className="h-8" />}>
          <PokemonDetail formeId={params.formeId} gameId={gameId} />
        </Suspense>
      </Card>
    </>
  );
}
