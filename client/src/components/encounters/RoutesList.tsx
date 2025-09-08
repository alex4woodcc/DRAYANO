/**
 * @file Searchable route selection combobox.
 * Uses a `Command` interface to filter routes by name with optional
 * A–Z grouping. Designed for use in both the desktop sidebar and
 * mobile sheet drawer so routing logic lives in one place.
 */
import { useMemo } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface Route {
  route_id: string;
  route_name: string;
  sort_index: number;
}

interface RoutesListProps {
  routes: Route[];
  selectedRoute: string | null;
  onRouteSelect: (routeId: string) => void;
}

/**
 * Renders a searchable combobox of routes. Routes are grouped by their
 * first letter and selecting an item notifies the parent so it can close
 * the drawer and sync the URL.
 */
export function RoutesList({ routes, selectedRoute, onRouteSelect }: RoutesListProps) {
  const groups = useMemo(() => {
    const map = new Map<string, Route[]>();
    routes.forEach((r) => {
      const letter = r.route_name.charAt(0).toUpperCase();
      const list = map.get(letter) || [];
      list.push(r);
      map.set(letter, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [routes]);

  if (!routes.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No routes found for this game</p>
      </div>
    );
  }

  return (
    <Command label="Choose route" data-testid="routes-list">
      <CommandInput placeholder="Search routes" aria-label="Search routes" />
      <CommandList>
        <CommandEmpty>No routes found.</CommandEmpty>
        {groups.map(([letter, items]) => (
          <CommandGroup key={letter} heading={letter}>
            {items.map((route) => (
              <CommandItem
                key={route.route_id}
                value={route.route_name}
                onSelect={() => onRouteSelect(route.route_id)}
                data-selected={selectedRoute === route.route_id}
                data-testid={`route-${route.route_id}`}
              >
                {route.route_name}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
}
