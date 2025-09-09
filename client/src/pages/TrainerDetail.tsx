/**
 * @file Comprehensive trainer detail page displaying full battle information,
 * team composition, and strategic insights. Uses the v_app_trainers_full view
 * for complete trainer data with pre-aggregated team details.
 */
import React from 'react';
import '@/index.css';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TypeBadge } from '@/components/pokemon/TypeBadge';
import { MoveCategoryBadge } from '@/components/moves/MoveCategoryBadge';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Sprite } from '@/components/common/Sprite';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { useGame } from '@/hooks/use-game';
import { Trainer, TrainerPokemon, TrainerMove } from '@/types/database';
import { Crown, Shield, PawPrint, ArrowLeft, MapPin, Trophy } from 'lucide-react';

/**
 * Normalize the raw team data returned by the API into a predictable array
 * of team member objects for rendering.
 */
function normalizeTeam(raw: unknown): TrainerPokemon[] {
  const asArray: any[] =
    Array.isArray(raw)
      ? raw
      : typeof raw === 'string'
      ? (() => {
          try {
            return JSON.parse(raw);
          } catch {
            return [];
          }
        })()
      : [];

  return asArray.map((m) => {
    const moves = Array.isArray(m?.moves) ? m.moves : [];

    return {
      slot_no: Number(m?.slot_no ?? m?.slot ?? 0),
      level: m?.level ?? null,
      shiny: Boolean(m?.shiny),
      forme_id: m?.forme_id ?? m?.forme ?? m?.formeId ?? '',
      name: m?.name ?? m?.pokemon_name ?? '',
      ability: m?.ability?.name ?? m?.ability_name ?? m?.ability ?? undefined,
      ability_description: m?.ability?.description ?? m?.ability_description ?? undefined,
      item: m?.item?.name ?? m?.item_name ?? m?.item ?? undefined,
      nature: m?.nature?.name ?? m?.nature_name ?? m?.nature ?? undefined,
      type1_id: m?.type1_id ?? m?.type1 ?? '',
      type2_id: m?.type2_id ?? m?.type2 ?? undefined,
      sprite_default_url: m?.sprite_default_url ?? m?.spriteDefaultUrl ?? undefined,
      sprite_shiny_url: m?.sprite_shiny_url ?? m?.spriteShinyUrl ?? undefined,
      moves: moves.map((mv: any) => ({
        slot: Number(mv?.slot ?? mv?.move_slot ?? 0),
        name: mv?.name ?? mv?.move_name ?? '',
        type_id: mv?.type_id ?? mv?.move_type_id ?? '',
        category: (mv?.category ?? mv?.move_category ?? 'STATUS') as 'PHYSICAL' | 'SPECIAL' | 'STATUS',
        power: mv?.power ?? undefined,
        accuracy: mv?.accuracy ?? undefined,
        pp: mv?.pp ?? undefined,
        priority: mv?.priority ?? undefined,
        effect_text: mv?.effect_text ?? mv?.effect ?? undefined,
      })),
    };
  });
}

/**
 * Convert snake_case or lowercase strings into Title Case labels.
 */
function titleize(s?: string | null): string | undefined {
  if (!s) return undefined;
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Build a multiline HTML string summarizing a move's stats for the tooltip.
 */
function buildMoveTooltip(move: TrainerMove): string {
  const parts = [
    `Type: ${move.type_id}`,
    `Power: ${move.power ?? '—'}`,
    `Accuracy: ${move.accuracy ?? '—'}`,
    `PP: ${move.pp ?? '—'}`,
  ];
  if (move.effect_text) {
    parts.push(`Effect: ${move.effect_text}`);
  }
  return parts.join('<br/>');
}

/**
 * Team composition analysis component showing type coverage and level distribution.
 */
function TeamAnalysis({ team }: { team: TrainerPokemon[] }) {
  const typeDistribution = team.reduce((acc, member) => {
    acc[member.type1_id] = (acc[member.type1_id] || 0) + 1;
    if (member.type2_id) {
      acc[member.type2_id] = (acc[member.type2_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const avgLevel = team.length > 0 
    ? Math.round(team.reduce((sum, m) => sum + (m.level || 0), 0) / team.length)
    : 0;

  const levelRange = team.length > 0 
    ? {
        min: Math.min(...team.map(m => m.level || 0)),
        max: Math.max(...team.map(m => m.level || 0))
      }
    : { min: 0, max: 0 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Team Size</span>
            <span className="font-semibold">{team.length}/6</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Average Level</span>
            <span className="font-semibold">Lv.{avgLevel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Level Range</span>
            <span className="font-semibold">
              {levelRange.min === levelRange.max 
                ? `Lv.${levelRange.min}` 
                : `Lv.${levelRange.min}-${levelRange.max}`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Shiny Pokémon</span>
            <span className="font-semibold">{team.filter(m => m.shiny).length}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Type Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center gap-1">
                  <TypeBadge type={type} className="text-xs" />
                  <span className="text-xs text-muted-foreground">×{count}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Individual team member card with comprehensive details.
 */
function TeamMemberCard({ member, gameId }: { member: TrainerPokemon; gameId: string }) {
  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link
            href={`/pokemon/${member.forme_id}?game=${gameId}`}
            className="flex-shrink-0 relative"
          >
            <Sprite
              src={member.shiny ? member.sprite_shiny_url : member.sprite_default_url}
              alt={member.name || 'Pokémon'}
              size={80}
              width={80}
              height={80}
              className="bg-muted rounded-lg"
              placeholder={<PawPrint className="w-6 h-6 text-muted-foreground" />}
            />
            {member.shiny && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-background" />
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-lg truncate">{member.name}</h4>
              {member.level && (
                <Badge variant="secondary" className="font-mono">
                  Lv.{member.level}
                </Badge>
              )}
            </div>

            <div className="flex gap-1 mb-3">
              <TypeBadge type={member.type1_id} className="text-xs" />
              {member.type2_id && <TypeBadge type={member.type2_id} className="text-xs" />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 text-sm">
              <div>
                <span className="text-muted-foreground">Ability:</span>
                <div className="font-medium">
                  {member.ability ? (
                    <InfoTooltip content={member.ability_description || ''}>
                      <span>{member.ability}</span>
                    </InfoTooltip>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Item:</span>
                <div className="font-medium">{member.item || '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Nature:</span>
                <div className="font-medium">{titleize(member.nature) || '—'}</div>
              </div>
            </div>

            {member.moves.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-2">Moves</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {member.moves.map((move, idx) => (
                    <InfoTooltip key={idx} content={buildMoveTooltip(move)}>
                      <div className="flex items-center gap-1 p-2 bg-muted/30 rounded text-xs">
                        <span className="font-medium truncate">{move.name}</span>
                        <TypeBadge type={move.type_id} className="text-[10px] px-1" />
                        <MoveCategoryBadge category={move.category} className="text-[10px] px-1" />
                      </div>
                    </InfoTooltip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main trainer detail page component.
 */
export default function TrainerDetail() {
  const [, params] = useRoute('/trainer/:trainerId');
  const { currentGame } = useGame();

  const { data: trainer, isLoading, error, refetch } = useQuery<Trainer | null>({
    queryKey: ['trainer-detail', params?.trainerId, currentGame],
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async () => {
      if (!params?.trainerId) return null;
      
      const { data, error } = await supabase
        .from('v_app_trainers_full')
        .select('*')
        .eq('game_id', currentGame)
        .eq('trainer_id', params.trainerId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!params?.trainerId,
  });

  if (!params?.trainerId) {
    return (
      <>
        <Breadcrumbs items={[
          { label: 'Trainers', href: `/trainers?game=${currentGame}` },
          { label: 'Not Found' }
        ]} />
        <Card className="p-4 mb-3">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Trainer not found</p>
          </div>
        </Card>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Breadcrumbs items={[
          { label: 'Trainers', href: `/trainers?game=${currentGame}` },
          { label: 'Loading...' }
        ]} />
        <Card className="p-4 mb-3">
          <LoadingSkeleton count={8} className="h-8 mb-4" />
        </Card>
      </>
    );
  }

  if (error || !trainer) {
    return (
      <>
        <Breadcrumbs items={[
          { label: 'Trainers', href: `/trainers?game=${currentGame}` },
          { label: 'Error' }
        ]} />
        <ErrorBoundary
          error={error || 'Trainer not found'}
          onRetry={() => refetch()}
          title="Failed to load trainer"
        />
      </>
    );
  }

  const team = normalizeTeam(trainer.team);
  const isChampion = trainer.trainer_class === 'Champion';

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Trainers', href: `/trainers?game=${currentGame}` },
        { label: trainer.trainer_name }
      ]} />

      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" asChild>
          <Link href={`/trainers?game=${currentGame}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trainers
          </Link>
        </Button>

        {/* Trainer Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <Sprite
                  src={trainer.sprite_url}
                  alt={trainer.trainer_name}
                  size={128}
                  width={128}
                  height={128}
                  className="bg-muted rounded-lg"
                  highDpi={false}
                  placeholder={
                    trainer.is_leader ? (
                      <Shield className="w-12 h-12 text-primary" />
                    ) : isChampion ? (
                      <Crown className="w-12 h-12 text-yellow-500" />
                    ) : (
                      <span className="text-4xl">🧑‍🎓</span>
                    )
                  }
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{trainer.trainer_name}</h1>
                  {trainer.is_leader && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Leader
                    </Badge>
                  )}
                  {isChampion && (
                    <Badge variant="default" className="flex items-center gap-1 bg-yellow-500 text-yellow-50">
                      <Crown className="w-3 h-3" />
                      Champion
                    </Badge>
                  )}
                </div>

                <p className="text-xl text-muted-foreground mb-4">{trainer.trainer_class}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trainer.display_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{trainer.display_location}</span>
                    </div>
                  )}
                  {trainer.split && (
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline">{trainer.split}</Badge>
                    </div>
                  )}
                  {trainer.level_cap && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Level Cap:</span>
                      <Badge variant="destructive" className="font-mono">
                        Lv.{trainer.level_cap}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Team Size:</span>
                    <span className="font-semibold">{team.length}/6</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team">Team Details</TabsTrigger>
            <TabsTrigger value="analysis">Battle Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-6">
            {team.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {team.map((member, index) => (
                  <TeamMemberCard
                    key={`${member.forme_id}-${index}`}
                    member={member}
                    gameId={currentGame}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <PawPrint className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Team Data</h3>
                  <p className="text-muted-foreground">
                    Team information is not available for this trainer.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <TeamAnalysis team={team} />
            
            {/* Battle Strategy Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Battle Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Recommended Counters</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on this trainer's team composition, consider Pokémon with types that resist their main attacks and can exploit their weaknesses.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Key Threats</h4>
                    <p className="text-sm text-muted-foreground">
                      Watch out for high-level Pokémon with powerful movesets and held items that can turn the tide of battle.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}