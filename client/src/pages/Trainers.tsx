/**
 * @file Trainers overview page listing story split leaders such as gym leaders,
 * champions, and Ghetsis. Each leader renders in an interactive card with
 * expandable team details and an integrated CTA to view all trainers in the
 * respective split.
 */
import '@/index.css';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { TrainerCard } from '@/components/trainers/TrainerCard';
import { TrainerCardSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useGame } from '@/hooks/use-game';
import { Trainer } from '@/types/database';

/**
 * Trainers overview shows split leaders with their teams.
 */
export default function Trainers() {
  const { currentGame } = useGame();

  const { data: leaders, isLoading, error, refetch } = useQuery<Trainer[]>({
    queryKey: ['leader-trainers', currentGame],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async () => {
      let query = supabase
        .from('v_app_trainers_full_base')
        .select('*')
        .eq('game_id', currentGame)
        .or('is_leader.eq.true,trainer_class.eq.Champion,trainer_name.eq.Ghetsis')
        .order('split_group_order', { nullsFirst: false })
        .order('split_order', { nullsFirst: false })
        .order('split_trainer_order', { nullsFirst: false });

      const { data, error } = await query;
      if (error) throw error;
      
      return (Array.isArray(data) ? data : []).filter(
        (r) => typeof r.trainer_id === 'string' && typeof r.trainer_name === 'string'
      ) as Trainer[];
    },
  });

  if (error) {
    return (
      <>
        <Breadcrumbs items={[{ label: `Trainers (${currentGame})` }]} />
        <ErrorBoundary
          error={error}
          onRetry={() => refetch()}
          title="Failed to load leaders"
        />
      </>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: `Trainers (${currentGame})` }]} />
      <Card className="p-4 mb-3">
        <div className="grid grid-cols-12 gap-8 overflow-hidden">
          {/* Header */}
          <div className="col-span-12 text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Story Leaders – {currentGame}</h1>
            <p className="lead text-muted-foreground">
              Review key battles and explore full trainer rosters for each split.
            </p>
          </div>

          {isLoading ? (
            <div className="col-span-12 grid grid-cols-12 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  className="col-span-12 sm:col-span-6 lg:col-span-4"
                  key={i}
                >
                  <TrainerCardSkeleton />
                </div>
              ))}
            </div>
          ) : leaders?.length ? (
            <div className="col-span-12 grid grid-cols-12 gap-4">
              {leaders.map((leader: Trainer) => (
                <div
                  className="col-span-12 sm:col-span-6 lg:col-span-4"
                  key={`${leader.trainer_id}-${leader.game_id}`}
                >
                  <TrainerCard trainer={leader} />
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-12 text-center py-12">
              <div className="text-4xl mb-4">👑</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Leaders Found</h3>
              <p className="text-muted-foreground">No leader data available for this game</p>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}