/**
 * @file Hook bridging Wouter's search handling with a URLSearchParams-style API.
 * It exposes the current query string as a URLSearchParams instance and a setter
 * that updates the browser's URL without triggering a full navigation or remount.
 */
import { useSearch, useLocation } from 'wouter';
import { useMemo, useCallback } from 'react';

/**
 * Returns the current search params and a setter to replace them while staying on the
 * same page. Useful for syncing filter state with the URL.
 */
export function useSearchParams(): [URLSearchParams, (params: URLSearchParams) => void] {
  const search = useSearch();
  const [loc, navigate] = useLocation();

  // Memoize the parsed params so consumers get a stable reference per change
  const params = useMemo(() => new URLSearchParams(search), [search]);

  // Replace the query string without reloading or pushing a new history entry
  const setParams = useCallback(
    (next: URLSearchParams) => {
      navigate(`${loc.split('?')[0]}?${next.toString()}`, { replace: true });
    },
    [navigate, loc]
  );

  return [params, setParams];
}

