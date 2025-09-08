/**
 * @file Displays the list of wild Pokémon encounters for a route. Sprites now
 * render inside fixed 64×64 squares so rows stay uniform while still using
 * Bootstrap's ratio utilities for responsive centering. The table features
 * sticky headers and a frozen first column so key context remains visible as
 * users scroll. Each sprite and name links to the Pokémon detail view, scoped
 * to the active game, and an inline search field filters results with debounced
 * input while a time-of-day toggle (Day/Night/Any) refines results further. The
 * component syncs `method`, `time`, `search`, and `page` via a `useSearchParams`
 * hook so the current view persists across refreshes. Search text is applied
 * server-side and pagination is handled with explicit Previous/Next buttons
 * rather than auto-loading on scroll. Encounter rows show a high-contrast
 * progress bar for rates and tables virtualize when lists exceed 100 rows.
*/
import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from '@/hooks/use-search-params';
import { FixedSizeList as List, type ListChildComponentProps } from 'react-window';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TypeBadge } from '@/components/pokemon/TypeBadge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { RouteEncounter, GameId, PokedexDetail } from '@/types/database';
import { Sprite } from '@/components/common/Sprite';
import { Map, Search, PawPrint } from 'lucide-react';

interface EncountersListProps {
  gameId: GameId;
  routeId: string;
}

/**
 * Maps encounter methods to background utility classes so tabs and
 * grouped tables share consistent color cues. Unknown methods fall back
 * to a muted tone.
 */
const methodColors: Record<string, string> = {
  Grass: 'bg-success/20',
  Surf: 'bg-primary/20',
  'Old Rod': 'bg-primary/20',
  'Good Rod': 'bg-primary/20',
  'Super Rod': 'bg-primary/20',
  Headbutt: 'bg-warning/20',
  'Rock Smash': 'bg-warning/20',
};

const defaultMethodColor = 'bg-muted/20';

// Helper that returns the mapped color with a safe fallback
const getMethodColor = (method: string): string =>
  methodColors[method] ?? defaultMethodColor;

/**
 * Converts a string to Title Case. Hyphenated and underscored words are split
 * and each capitalized for more readable labels.
 */
const titleCase = (value: string): string =>
  value
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * Renders the encounters table for a given route with tabs per encounter
 * method. Includes a debounced search field to filter Pokémon by name. Sprites
 * remain square and centered for consistent presentation. The component also
 * synchronizes method and time-of-day selections with the URL so the current
 * view can be restored via direct links.
 *
 * @param gameId - Active game identifier.
 * @param routeId - Route whose encounters should be shown.
 */
export function EncountersList({ gameId, routeId }: EncountersListProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [params, setParams] = useSearchParams();

  // Debounce search input to avoid filtering on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Pagination page size
  const PAGE_SIZE = 50;

  interface EncountersResponse {
    rows: RouteEncounter[];
    hasMore: boolean;
  }

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<EncountersResponse>({
    queryKey: [
      'encounters',
      gameId,
      routeId,
      selectedMethod,
      timeOfDay,
      debouncedSearchTerm,
      page,
    ],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async () => {
      let query = supabase
        .from('v_route_encounters_full')
        .select('*')
        .eq('game_id', gameId)
        .eq('route_id', routeId);

      if (selectedMethod !== 'all') {
        query = query.eq('method', selectedMethod);
      }

      if (timeOfDay && timeOfDay !== 'all') {
        query = query.eq('time_of_day', timeOfDay);
      }

      if (debouncedSearchTerm) {
        query = query.ilike('forme_label', `%${debouncedSearchTerm}%`);
      }

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;

      const { data, error } = await query
        .order('sort_index')
        .order('method')
        .order('slot_no')
        .range(start, end);

      if (error) throw error;
      const rows = (data ?? []).slice(0, PAGE_SIZE);
      const hasMore = (data ?? []).length > PAGE_SIZE;
      return { rows, hasMore };
    },
    enabled: !!routeId,
  });

  // Fetch minimal encounter rows to derive available methods and times of day
  const { data: metaRows = [] } = useQuery<Pick<RouteEncounter, 'method' | 'time_of_day' | 'route_name'>[]>({
    queryKey: ['encounter-filters', gameId, routeId],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_route_encounters_full')
        .select('method, time_of_day, route_name')
        .eq('game_id', gameId)
        .eq('route_id', routeId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!routeId,
  });

  // All encounter methods and times are derived up front for stable tab lists
  const methods = useMemo(
    () => Array.from(new Set(metaRows.map((e) => e.method))).sort(),
    [metaRows]
  );
  const timesOfDay = useMemo(
    () =>
      Array.from(
        new Set(
          metaRows.map((e) => e.time_of_day).filter((t): t is string => Boolean(t))
        )
      ).sort(),
    [metaRows]
  );
  const routeName = metaRows[0]?.route_name || 'Unknown Route';

  // Read method, time, search, and page from the URL whenever the query string changes
  useEffect(() => {
    if (!routeId) return;
    const methodParam = params.get('method');
    const validMethod =
      methodParam && (methodParam === 'all' || methods.includes(methodParam))
        ? methodParam
        : 'all';
    const timeParam = params.get('time');
    const validTime =
      timeParam && (timeParam === 'all' || timesOfDay.includes(timeParam))
        ? timeParam
        : 'all';
    const searchParam = params.get('search') ?? '';
    const pageParam = parseInt(params.get('page') ?? '1', 10);
    setSelectedMethod(validMethod);
    setTimeOfDay(validTime);
    setSearchTerm(searchParam);
    setDebouncedSearchTerm(searchParam);
    setPage(Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam);
  }, [params, routeId, methods, timesOfDay]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, selectedMethod, timeOfDay, routeId]);

  // Push current selections to the URL
  useEffect(() => {
    if (!routeId) return;
    const next = new URLSearchParams(params);
    next.set('route', routeId);
    next.set('method', selectedMethod);
    next.set('time', timeOfDay);
    if (debouncedSearchTerm) {
      next.set('search', debouncedSearchTerm);
    } else {
      next.delete('search');
    }
    next.set('page', page.toString());
    if (next.toString() !== params.toString()) {
      setParams(next);
    }
  }, [selectedMethod, timeOfDay, routeId, debouncedSearchTerm, page, params, setParams]);

  if (!routeId) {
    return (
      <div className="text-center py-12">
        <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Select a Route</h3>
        <p className="text-muted-foreground">Choose a route to view wild Pokémon encounters</p>
      </div>
    );
  }

  if (isLoading) {
    return <EncountersListSkeleton />;
  }

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        onRetry={() => refetch()}
        title="Failed to load encounters"
      />
    );
  }

  const encounters = data?.rows ?? [];

  if (!encounters.length) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Encounters Found</h3>
        <p className="text-muted-foreground">No encounters found for this route</p>
      </div>
    );
  }

  if ((debouncedSearchTerm || timeOfDay !== 'all') && encounters.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Matches</h3>
        <p className="text-muted-foreground">No Pokémon match your filters</p>
      </div>
    );
  }

  // Group encounters by method for rendering
  const encountersByMethod = encounters.reduce((acc, encounter) => {
    if (!acc[encounter.method]) {
      acc[encounter.method] = [];
    }
    acc[encounter.method].push(encounter);
    return acc;
  }, {} as Record<string, RouteEncounter[]>);

  // Determine which encounters are currently shown based on active method
  const displayedEncounters =
    selectedMethod === 'all' ? encounters : encountersByMethod[selectedMethod] ?? [];
  const isFiltered =
    selectedMethod !== 'all' || !!debouncedSearchTerm || timeOfDay !== 'all';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle
              id="encounters-heading"
              tabIndex={-1}
              data-testid="route-title"
              className="truncate"
            >
              {routeName} Encounters
            </CardTitle>
            <p className="text-muted-foreground text-sm">Wild Pokémon encounters and rates</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="px-6 pt-4 space-y-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            placeholder="Search Pokémon"
            aria-label="Search Pokémon"
          />
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {displayedEncounters.length} Pokémon
            {isFiltered && ' (filtered)'}
          </p>
        </div>

        <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
          <div className="sticky top-0 bg-background px-6 pb-4 z-10">
            <TabsList
              className="grid w-full grid-cols-auto h-11"
              style={{ gridTemplateColumns: `repeat(${methods.length + 1}, minmax(0, 1fr))` }}
            >
              <TabsTrigger value="all" className="min-w-[44px] h-11 px-4 text-sm truncate">
                All
              </TabsTrigger>
              {methods.map((method) => (
                <TabsTrigger
                  key={method}
                  value={method}
                  className={`min-w-[44px] h-11 px-4 text-sm truncate data-[state=active]:${getMethodColor(method)}`}
                >
                  {titleCase(method)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {timesOfDay.length > 0 && (
            <div className="px-6 pb-4">
              <ToggleGroup
                type="single"
                value={timeOfDay}
                // Radix returns an empty string when the active toggle is clicked again;
                // fall back to 'all' so the query doesn't apply an empty filter.
                onValueChange={(v) => setTimeOfDay(v || 'all')}
                size="lg"
                className="justify-start"
              >
                <ToggleGroupItem value="day" disabled={!timesOfDay.includes('day')} className="min-w-[44px]">
                  Day
                </ToggleGroupItem>
                <ToggleGroupItem value="night" disabled={!timesOfDay.includes('night')} className="min-w-[44px]">
                  Night
                </ToggleGroupItem>
                <ToggleGroupItem value="all" className="min-w-[44px]">
                  Any
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          <TabsContent value="all" className="mt-0">
            <EncountersTable gameId={gameId} encounters={encounters} groupByMethod={true} />
          </TabsContent>

          {methods.map((method) => (
            <TabsContent key={method} value={method} className="mt-0">
              <EncountersTable
                gameId={gameId}
                encounters={encountersByMethod[method] ?? []}
                groupByMethod={false}
              />
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex items-center justify-between px-6 py-4">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="min-w-[44px]"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            disabled={!data?.hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="min-w-[44px]"
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Renders a Bootstrap table of encounters with sticky headers and a fixed
 * first column for easier scanning. When `groupByMethod` is true the
 * encounters are grouped into separate tables by method for the "All" tab.
 * Otherwise the rows optionally virtualize using `react-window` when more than
 * 100 encounters are present to maintain smooth scrolling.
 */
function EncountersTable({
  gameId,
  encounters,
  groupByMethod,
}: {
  gameId: GameId;
  encounters: RouteEncounter[];
  groupByMethod: boolean;
}) {
  const useVirtual = !groupByMethod && encounters.length > 100;

  if (groupByMethod) {
    // Group by method for the "All" tab
    const encountersByMethod = encounters.reduce((acc, encounter) => {
      if (!acc[encounter.method]) {
        acc[encounter.method] = [];
      }
      acc[encounter.method].push(encounter);
      return acc;
    }, {} as Record<string, RouteEncounter[]>);

    return (
      <div className="space-y-6">
        {Object.entries(encountersByMethod).map(([method, methodEncounters]) => (
          <div key={method}>
            <div className={`px-6 py-2 border-t border-border ${getMethodColor(method)}`}>
              <h4 className="font-semibold text-foreground">{titleCase(method)}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="table align-middle text-sm encounter-table">
                <thead>
                  <tr>
                    <th className="text-start">Pokémon</th>
                    <th className="text-start">Type</th>
                    <th className="text-start">Level</th>
                    <th className="text-start">Rate</th>
                    {methodEncounters.some(e => e.subarea) && (
                      <th className="text-start">Area</th>
                    )}
                    {methodEncounters.some(e => e.time_of_day) && (
                      <th className="text-start">Time</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {methodEncounters.map((encounter, index) => (
                    <EncounterRow key={`${encounter.id}-${index}`} encounter={encounter} gameId={gameId} showMethod={false} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (useVirtual) {
    const rowHeight = 64;
    return (
      <div className="overflow-x-auto" style={{ maxHeight: '600px' }}>
        <table className="table align-middle text-sm encounter-table">
          <thead>
            <tr>
              <th className="text-start">Pokémon</th>
              <th className="text-start">Type</th>
              <th className="text-start">Level</th>
              <th className="text-start">Rate</th>
              {encounters.some((e) => e.subarea) && (
                <th className="text-start">Area</th>
              )}
              {encounters.some((e) => e.time_of_day) && (
                <th className="text-start">Time</th>
              )}
            </tr>
          </thead>
          <List
            height={Math.min(600, encounters.length * rowHeight)}
            itemCount={encounters.length}
            itemSize={rowHeight}
            width={'100%'}
            outerElementType="tbody"
          >
            {({ index, style }: ListChildComponentProps) => (
              <EncounterRow
                key={`${encounters[index].id}-${index}`}
                encounter={encounters[index]}
                gameId={gameId}
                showMethod={false}
                style={style}
              />
            )}
          </List>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table align-middle text-sm encounter-table">
        <thead>
          <tr>
            <th className="text-start">Pokémon</th>
            <th className="text-start">Type</th>
            <th className="text-start">Level</th>
            <th className="text-start">Rate</th>
            {encounters.some(e => e.subarea) && (
              <th className="text-start">Area</th>
            )}
            {encounters.some(e => e.time_of_day) && (
              <th className="text-start">Time</th>
            )}
          </tr>
        </thead>
        <tbody>
          {encounters.map((encounter, index) => (
            <EncounterRow key={`${encounter.id}-${index}`} encounter={encounter} gameId={gameId} showMethod={false} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Displays a single encounter row with sprite, typing, level range, slim rate
 * progress bar and other metadata. The sprite and name link to the detailed
 * Pokémon view for the current game.
 */
function EncounterRow({ encounter, showMethod, gameId, style }: { encounter: RouteEncounter, showMethod: boolean, gameId: GameId, style?: CSSProperties }) {
  const queryClient = useQueryClient();
  const prefetch = () =>
    queryClient.prefetchQuery<PokedexDetail | null>({
      queryKey: ['pokedex-detail', encounter.forme_id, gameId],
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      queryFn: async () => {
        const { data, error } = await supabase
          .from('v_pokedex_detail_app')
          .select('*')
          .eq('game_id', gameId)
          .eq('forme_id', encounter.forme_id)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
    });

  return (
    <tr
      style={style}
      className="odd:bg-muted/10 even:bg-muted/5 hover:bg-muted/20 transition-colors"
      data-testid={`encounter-${encounter.forme_id}`}
    >
      <td>
        <Link
          href={`/pokemon/${encounter.forme_id}?game=${gameId}`}

          className="flex items-center gap-3"

        >
          <Sprite
            src={encounter.sprite_default_url}
            alt={encounter.forme_label}
            size={48}
            width={48}
            height={48}
            className="bg-muted rounded-lg flex-shrink-0"
            placeholder={<PawPrint className="w-4 h-4" />}
          />
          <span className="font-medium truncate">
            {encounter.forme_label}
          </span>
        </Link>
      </td>
      <td>
        <div className="flex gap-1">
          <TypeBadge type={encounter.type1_id} className="text-xs" />
          {encounter.type2_id && <TypeBadge type={encounter.type2_id} className="text-xs" />}
        </div>
      </td>
      <td>
        <span className="font-mono">
          {encounter.min_level === encounter.max_level
            ? encounter.min_level
            : `${encounter.min_level}-${encounter.max_level}`}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted/60 dark:bg-muted/40 h-2 rounded">
            <div
              className="bg-primary h-2 rounded"
              style={{ width: `${encounter.rate}%` }}
            />
          </div>
          <span className="font-mono fw-semibold whitespace-nowrap">
            {encounter.rate}%
          </span>
        </div>
      </td>
      {encounter.subarea && (
        <td>
          <span className="text-muted-foreground truncate block">
            {encounter.subarea}
          </span>
        </td>
      )}
      {encounter.time_of_day && (
        <td>
          <span className="text-muted-foreground truncate block">
            {titleCase(encounter.time_of_day)}
          </span>
        </td>
      )}
      {showMethod && (
        <td>
          <span className="px-2 py-1 bg-success/25 text-success text-xs rounded">
            {titleCase(encounter.method)}
          </span>
        </td>
      )}
    </tr>
  );
}

/**
 * Skeleton card shown while encounters load to maintain layout stability.
 */
function EncountersListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <LoadingSkeleton className="h-6 w-48 mb-2" />
            <LoadingSkeleton className="h-4 w-64" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          <LoadingSkeleton className="h-12 w-full" />
          <LoadingSkeleton count={8} className="h-16 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}