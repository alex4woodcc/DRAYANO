/**
 * @file TrainersList page that lists trainers for the selected game or a
 * specific story split. Uses the `v_app_trainers_full_base` view to ensure
 * team members include ability, item, and nature data. Includes robust sprite
 * fallbacks and filter UI, and groups trainers by level cap and story split
 * for easier navigation. Headings and breadcrumbs echo the active game so
 * players know which ROM hack's trainers they're viewing. Results render in a
 * responsive 1/2/12-column grid to keep cards compact across breakpoints.
*/
import '@/index.css';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrainerCard } from '@/components/trainers/TrainerCard';
import { TrainerCardSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useGame } from '@/hooks/use-game';
import { Trainer } from '@/types/database';
import { Search, X } from 'lucide-react';
import { useLocation, useSearch } from 'wouter';

/**
 * Trainers page lists all trainers for the selected game with filtering
 * options. The query guards against missing columns, backfills sprite URLs,
 * and inserts headings whenever the level cap or split changes so users can
 * browse by story milestone.
*/

export default function TrainersList() {
  const { currentGame } = useGame();
  const [search, setSearch] = useState('');
  const [trainerTypeFilter, setTrainerTypeFilter] = useState<string>('');
  const perPage = 30;

  // Read the query string via Wouter's useSearch hook for reactive `split` filtering
  const searchQuery = useSearch();
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(searchQuery);
  const split = searchParams.get('split') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [page, setPage] = useState(Math.max(1, initialPage));

  useEffect(() => {
    const params = new URLSearchParams(searchQuery);
    params.set('page', String(page));
    navigate(`${location.split('?')[0]}?${params.toString()}`, { replace: true });
  }, [page, searchQuery, navigate, location]);

  useEffect(() => {
    setPage(1);
  }, [search, trainerTypeFilter, split, currentGame]);

  const { data, isLoading, error, refetch } = useQuery<{ items: Trainer[]; total: number }>({
    queryKey: ['trainers', currentGame, search, trainerTypeFilter, split, page],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      let query = supabase
        .from('v_app_trainers_full_base')
        .select('*', { count: 'exact' })
        .eq('game_id', currentGame);

      // Apply search filter
        
        // Basic runtime guards to ensure required fields exist
        const filtered = (Array.isArray(data) ? data : []).filter(
          (r) => typeof r.trainer_id === 'string' && typeof r.trainer_name === 'string'
        ) as Trainer[];
        return { items: filtered, total: count || 0 };
      },
    });

  const trainers = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / perPage));

  const clearFilters = () => {
    setSearch('');
    setTrainerTypeFilter('');
  };

  /** Removes the `split` parameter from the URL and refreshes results */
  const clearSplit = () => {
    const params = new URLSearchParams(searchQuery);
    params.delete('split');
    const newSearch = params.toString();
    const basePath = location.split('?')[0];
    navigate(newSearch ? `${basePath}?${newSearch}` : basePath);
  };

  const hasFilters = search.trim() || (trainerTypeFilter && trainerTypeFilter !== 'all');
  const isFiltered = hasFilters || split;

  if (error) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: 'Trainers', href: `/trainers?game=${currentGame}` },
            { label: split ? `${split} (${currentGame})` : `All (${currentGame})` },
          ]}
        />
        <ErrorBoundary
          error={error}
          onRetry={() => refetch()}
          title="Failed to load trainers"
        />
      </>
    );
  }

    return (
      <>
          <Breadcrumbs
            items={[
              { label: 'Trainers', href: `/trainers?game=${currentGame}` },
              { label: split ? `${split} (${currentGame})` : `All (${currentGame})` },
            ]}
          />

        <Card className="p-4 mb-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-8 overflow-hidden">
            {/* Header */}
            <div className="col-span-full text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {split ? `Trainers – ${split}` : `Trainers – ${currentGame}`}
              </h1>
              <p className="lead text-muted-foreground">
                Browse trainer battles{split ? ` for ${split}` : ''}, teams, and difficulty levels
              </p>
            </div>

            {/* Filters */}
            <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4 sm:items-center">
              <div className="relative col-span-full lg:col-span-1 xl:col-span-5">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search trainers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="trainer-search"
                />
              </div>

              <div className="col-span-full lg:col-span-1 xl:col-span-3">
                <Select value={trainerTypeFilter} onValueChange={setTrainerTypeFilter}>
                  <SelectTrigger className="w-full" data-testid="trainer-type-filter">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trainers</SelectItem>
                    <SelectItem value="champion">Champions</SelectItem>
                    <SelectItem value="leader">Gym Leaders</SelectItem>
                    <SelectItem value="regular">Regular Trainers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasFilters && (
                <Button
                  variant="outline"
                  className="col-span-full lg:col-span-1 xl:col-span-2 px-3 py-2"
                  onClick={clearFilters}
                  data-testid="clear-trainer-filters"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {split && (
            <div className="col-span-full flex items-center gap-2 mt-2">
                <Badge variant="secondary">Filtered by: {split}</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearSplit}
                  aria-label="Clear split filter"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Results */}
              {isLoading ? (
                <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div className="col-span-1 xl:col-span-3" key={i}>
                      <TrainerCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : trainers?.length ? (
                <>
                  <div className="col-span-12 overflow-hidden">
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                      Showing {trainers.length} trainers
                      {isFiltered && ' (filtered)'}
                    </p>
                  </div>

                  <div className="col-span-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4">
                  {(() => {
                    const rows: React.ReactNode[] = [];
                    let lastKey: string | null = null;
                    trainers.forEach((trainer: Trainer) => {
                      const groupKey = `${trainer.level_cap ?? 'none'}-${trainer.split ?? ''}`;
                      if (groupKey !== lastKey) {
                        const headingClasses = lastKey ? 'mt-4 mb-2' : 'mb-2';
                        const capLabel =
                          typeof trainer.level_cap === 'number'
                            ? `Level Cap ${trainer.level_cap}`
                            : 'No Level Cap';
                        const splitLabel = trainer.split ? ` – ${trainer.split}` : '';
                        rows.push(
                          <div className="col-span-full" key={`header-${groupKey}`}>
                            <h4 className={headingClasses}>{`${capLabel}${splitLabel}`}</h4>
                          </div>
                        );
                        lastKey = groupKey;
                      }
                      rows.push(
                        <div
                          className="col-span-1 xl:col-span-3"
                          key={`${trainer.trainer_id}-${trainer.game_id}`}
                        >
                          <TrainerCard trainer={trainer} />
                        </div>
                      );
                    });
                    return rows;
                  })()}
                </div>

                <div className="col-span-full flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground" aria-live="polite">
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
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Trainers Found</h3>
                <p className="text-muted-foreground mb-4">
                  {isFiltered
                    ? 'Try adjusting your search or filters'
                    : 'No trainers available for this game'}
                </p>
                {hasFilters && (
                  <Button onClick={clearFilters} data-testid="no-trainers-clear">
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