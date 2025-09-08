/**
 * @file Reusable loading skeleton components for cards and lists. Provides
 * lightweight placeholders mirroring their live counterparts to reduce layout
 * shift during data fetching.
 */
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-muted rounded-md",
            className
          )}
        />
      ))}
    </>
  );
}

export function PokemonCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <LoadingSkeleton className="h-24 w-24 mx-auto rounded-lg" />
      <LoadingSkeleton className="h-4 w-3/4 mx-auto" />
      <div className="flex justify-center space-x-2">
        <LoadingSkeleton className="h-6 w-16 rounded-full" />
        <LoadingSkeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

/** Skeleton version of TrainerCard mirroring its denser layout. */
export function TrainerCardSkeleton() {
  return (
    <div className="bg-card border border-border/40 rounded-lg p-4 space-y-3">
      <div className="d-flex align-items-center gap-2">
        <LoadingSkeleton className="h-16 w-16 rounded-lg" />
        <div className="flex-grow-1 space-y-2">
          <LoadingSkeleton className="h-4 w-24" />
          <LoadingSkeleton className="h-3 w-16" />
        </div>
        <LoadingSkeleton className="h-6 w-20 rounded" />
      </div>
      <div className="d-flex flex-wrap gap-2">
        <LoadingSkeleton className="h-14 w-14 rounded" />
        <LoadingSkeleton className="h-14 w-14 rounded" />
        <LoadingSkeleton className="h-14 w-14 rounded" />
      </div>
      <LoadingSkeleton className="h-6 w-full rounded" />
    </div>
  );
}
