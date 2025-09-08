/**
 * Encounters page shows wild Pokémon encounters for selected routes using a 12-column
 * grid. It initializes the selected route from the URL and keeps `route`, `method`,
 * `time`, `search`, and `page` query parameters in sync so direct links restore the
 * same view. On small screens the route sidebar collapses into a sheet-driven
 * combobox for keyboard and touch friendly selection. Headings and breadcrumbs
 * include the active game so users stay oriented.
*/
import '@/index.css';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoutesList } from '@/components/encounters/RoutesList';
import { EncountersList } from '@/components/encounters/EncountersList';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useGame } from '@/hooks/use-game';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { useSearchParams } from '@/hooks/use-search-params';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Route {
  route_id: string;
  route_name: string;
  sort_index: number;
}

/**
 * Renders the Encounters page with route selector and encounter details.
 */
export default function Encounters() {
  const { currentGame } = useGame();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [routesOpen, setRoutesOpen] = useState(false);
  const [params, setParams] = useSearchParams();

  const {
    data: routesData,
    isLoading: routesLoading,
    error: routesError,
    refetch: routesRefetch,
  } = useQuery<Route[]>({
    queryKey: ['routes', currentGame],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_route_encounters_full')
        .select('route_id, route_name, sort_index')
        .eq('game_id', currentGame)
        .order('sort_index');
      if (error) throw error;
      return data.reduce((acc: Route[], current) => {
        if (!acc.find((r) => r.route_id === current.route_id)) {
          acc.push(current as Route);
        }
        return acc;
      }, []);
    },
  });

  const routes = routesData || [];

  /**
   * Provides common rendering for route selection, handling loading and error
   * states consistently for both the desktop sidebar and mobile sheet.
   */
  const renderRoutes = () => {
    if (routesLoading) {
      return <LoadingSkeleton count={8} className="h-12" />;
    }
    if (routesError) {
      return (
        <ErrorBoundary
          error={routesError}
          onRetry={() => routesRefetch()}
          title="Failed to load routes"
        />
      );
    }
    return (
      <RoutesList
        routes={routes}
        selectedRoute={selectedRoute}
        onRouteSelect={handleRouteSelect}
      />
    );
  };

  // Initialize selected route from the URL, falling back to the first route
  // when the param is missing or invalid. Ensures all relevant params exist so
  // refreshing or sharing the link reproduces the same view.
  useEffect(() => {
    if (!routes.length) return;
    const routeParam = params.get('route');
    const validRoute = routeParam && routes.some((r) => r.route_id === routeParam)
      ? routeParam
      : routes[0].route_id;

    setSelectedRoute(validRoute);

    const next = new URLSearchParams(params);
    next.set('route', validRoute);
    if (!next.get('method')) next.set('method', 'all');
    if (!next.get('time')) next.set('time', 'all');
    if (!next.get('page')) next.set('page', '1');
    if (next.toString() !== params.toString()) {
      setParams(next);
    }
  }, [routes, params, setParams]);

  /**
   * Handles selecting a route, synchronizes the `route` query parameter,
   * closes the mobile drawer, and moves focus to the encounters heading
   * for screen-reader context.
   */
  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
    const next = new URLSearchParams(params);
    next.set('route', routeId);
    if (!next.get('method')) next.set('method', 'all');
    if (!next.get('time')) next.set('time', 'all');
    next.set('page', '1');
    if (next.toString() !== params.toString()) {
      setParams(next);
    }
    setRoutesOpen(false);
    setTimeout(() => document.getElementById('encounters-heading')?.focus(), 0);
  };
  return (
    <>
      <Breadcrumbs items={[{ label: `Encounters (${currentGame})` }]} />

      <Card className="p-4 mb-3">
        <div className="grid grid-cols-12 gap-4">
          {/* Header */}
          <div className="col-span-12 text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Encounters – {currentGame}</h1>
            <p className="lead text-muted-foreground">
              Find wild Pokémon locations, encounter rates, and methods
            </p>
          </div>

          {/* Mobile route picker */}
          <div className="col-span-12 md:hidden">
            <Sheet open={routesOpen} onOpenChange={setRoutesOpen}>
              <SheetTrigger asChild>
                <Button className="w-full">Choose Route</Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-4">
                <SheetHeader className="sr-only">
                  <SheetTitle>Routes & Areas</SheetTitle>
                </SheetHeader>
                {renderRoutes()}
              </SheetContent>
            </Sheet>
          </div>

          {/* Routes Sidebar */}
          <div className="col-span-12 md:col-span-3 hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Routes & Areas</CardTitle>
              </CardHeader>
              <CardContent>{renderRoutes()}</CardContent>
            </Card>
          </div>

          {/* Encounters List */}
          <div className="col-span-12 md:col-span-9">
            {selectedRoute ? (
              <EncountersList gameId={currentGame} routeId={selectedRoute} />
            ) : (
              <Card>
                <CardContent className="text-center py-5">
                  <div className="display-4 mb-4">🗺️</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Select a Route
                  </h3>
                  <p className="text-muted-foreground">
                    Choose a route from the sidebar to view wild Pokémon encounters
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
