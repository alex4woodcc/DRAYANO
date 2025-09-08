/**
 * Pokédex page.
 * Displays Pokémon with search and type filters in a responsive 1/2/12-column
 * grid, accessible validation messaging, and game-aware headings/breadcrumbs
 * so users always know which ROM hack they are browsing.
*/
import '@/index.css';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PokemonCard } from '@/components/pokemon/PokemonCard';
import { PokemonCardSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useGame } from '@/hooks/use-game';
import { PokedexEntry } from '@/types/database';
import { Search, X } from 'lucide-react';

const pokemonTypes = [
  'Normal',
  'Fire',
  'Water',
  'Electric',
  'Grass',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
];

/**
 * Main Pokédex component containing query logic and form control handlers.
 */
export default function Pokedex() {
  const { currentGame } = useGame();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchError, setSearchError] = useState('');
  const perPage = 60;
  const searchQuery = useSearch();
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(searchQuery);
  const initialPage = parseInt(params.get('page') || '1', 10);
  const [page, setPage] = useState(Math.max(1, initialPage));

  // Sync page state with URL for shareable links
  useEffect(() => {
    const params = new URLSearchParams(searchQuery);
    params.set('page', String(page));
    navigate(`${location.split('?')[0]}?${params.toString()}`, { replace: true });
  }, [page, searchQuery, navigate, location]);

  // Reset to first page whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, currentGame]);

  const { data, isLoading, error, refetch } = useQuery<{ items: PokedexEntry[]; total: number }>({
    queryKey: ['pokedex', currentGame, search, typeFilter, page],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      let query = supabase
        .from('v_pokedex_app')
        .select('*', { count: 'exact' })
        .eq('game_id', currentGame)
        .order('display_name');

      if (search.trim()) {
        query = query.ilike('display_name', `%${search.trim()}%`);
      }

      if (typeFilter && typeFilter !== 'all') {
        query = query.or(`type1_id.ilike.%${typeFilter}%,type2_id.ilike.%${typeFilter}%`);
      }

      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      const { data, error, count } = await query.range(from, to);
      if (error) throw error;
      return { items: data || [], total: count || 0 };
    },
  });

  const pokemon = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / perPage));

  /** Update search query and perform simple length validation. */
  const handleSearchChange = (value: string) => {
    if (value.length > 50) {
      setSearchError('Search query too long');
    } else {
      setSearchError('');
    }
    setSearch(value);
  };

  /** Reset all active filters to their defaults. */
  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setSearchError('');
  };

  const hasActiveFilters = search.trim() || typeFilter !== 'all';

  if (error) {
    return (
      <>
        <Breadcrumbs items={[{ label: `Pokédex (${currentGame})` }]} />
        <ErrorBoundary
          error={error}
          onRetry={() => refetch()}
          title="Failed to load Pokédex"
        />
      </>
    );
  }

    return (
      <>
        <Breadcrumbs items={[{ label: `Pokédex (${currentGame})` }]} />

        <Card className="p-4 mb-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-10 overflow-hidden">
            {/* Header */}
            <div className="col-span-full text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Pokédex – {currentGame}</h1>
              <p className="lead text-muted-foreground">
                Explore Pokémon stats, types, abilities, and more
              </p>
            </div>

            {/* Filters */}
            <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-3 sm:items-center">
              <div className="col-span-full lg:col-span-1 xl:col-span-6">
                <div className="input-group">
                  <span className="input-group-text" id="search-icon">
                    <Search className="text-muted-foreground h-4 w-4" />
                  </span>
                  <input
                    type="search"
                    className={`form-control ${searchError ? 'is-invalid' : ''}`}
                    placeholder="Search Pokémon"
                    aria-label="Search Pokémon"
                    aria-describedby="search-icon searchHelp searchError"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    data-testid="pokemon-search"
                  />
                </div>
                <div id="searchHelp" className="form-text">
                  Type a Pokémon name
                </div>
                <div id="searchError" className="invalid-feedback">
                  {searchError}
                </div>
              </div>

              <div className="form-floating w-full col-span-full lg:col-span-1 xl:col-span-3">
                <select
                  className="form-select"
                  id="typeFilter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-describedby="typeHelp typeError"
                  data-testid="type-filter"
                >
                  <option value="all">All Types</option>
                  {pokemonTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <label htmlFor="typeFilter">Filter by type</label>
                <div id="typeHelp" className="form-text">
                  Select a Pokémon type
                </div>
                <div id="typeError" className="invalid-feedback">Invalid type</div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="col-span-full lg:col-span-1 xl:col-span-1 px-3 py-2"
                  onClick={clearFilters}
                  data-testid="clear-filters"
                >
                  <X className="h-4 w-4 me-2" />
                  Clear
                </Button>
              )}
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div className="col-span-1 xl:col-span-3" key={i}>
                    <PokemonCardSkeleton />
                  </div>
                ))}
              </div>
            ) : pokemon?.length ? (
              <>
                <div className="col-span-full overflow-hidden">
                  <p className="text-sm text-muted-foreground">
                    Showing {pokemon.length} Pokémon
                    {hasActiveFilters && ' (filtered)'}
                  </p>
                </div>

                <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4">
                {pokemon.map((poke: PokedexEntry) => (
                    <div
                      className="col-span-1 xl:col-span-3"
                      key={`${poke.forme_id}-${poke.game_id}`}
                    >
                      <PokemonCard pokemon={poke} />
                    </div>
                  ))}
                </div>

                <div className="col-span-full flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Pokémon Found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? 'Try adjusting your search or filters'
                    : 'No Pokémon available for this game'}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} data-testid="no-results-clear">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </>
    );
}
