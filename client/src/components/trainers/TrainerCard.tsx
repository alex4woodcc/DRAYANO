/**
 * @file TrainerCard component for leader/champion summaries. Presents a clean
 * header with enlarged sprite, compressed metadata, and a single split-level
 * CTA linking to the full trainer list. A compact team preview badge row keeps
 * cards scannable, and an accessible accordion reveals full team details
 * without heavy popovers.
 */

import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TypeBadge } from '@/components/pokemon/TypeBadge';
import { MoveCategoryBadge } from '@/components/moves/MoveCategoryBadge';
import { Trainer } from '@/types/database';
import { Crown, Shield, PawPrint } from 'lucide-react';
import { Sprite } from '@/components/common/Sprite';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useGame } from '@/hooks/use-game';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Link } from 'wouter';
import { Link } from 'wouter';

/**
 * TrainerCard renders a summary card for a trainer including their sprite
 * and optionally expandable team details. Team members link to individual
 * Pokémon pages for quick reference.
 */

interface TrainerCardProps {
  trainer: Trainer;
}

/**
 * Normalize the raw team data returned by the API into a predictable array
 * of team member objects for rendering.
 */
function normalizeTeam(raw: unknown) {
  // Sometimes PostgREST returns jsonb as a string; sometimes as an array
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
      // required-ish basics
      slot_no: Number(m?.slot_no ?? m?.slot ?? 0),
      level: m?.level ?? null,
      shiny: Boolean(m?.shiny),
      forme_id: m?.forme_id ?? m?.forme ?? m?.formeId ?? '',
      name: m?.name ?? m?.pokemon_name ?? '',

      // 🔑 the 3 fields you need in the UI; prefer canonical keys, then fallbacks

      ability:
        m?.ability?.name ??
        m?.ability_name ??
        m?.ability ??
        m?.abilityId ??
        m?.ability_id ??
        undefined,
      ability_description:
        m?.ability?.description ??
        m?.ability_description ??
        m?.ability_desc ??
        undefined,
      item:
        m?.item?.name ??
        m?.item_name ??
        m?.item ??
        m?.itemId ??
        m?.item_id ??
        undefined,
      nature:
        m?.nature?.name ??
        m?.nature_name ??
        m?.nature ??
        m?.nature_id ??
        undefined,


      // other visuals
      type1_id: m?.type1_id ?? m?.type1 ?? '',
      type2_id: m?.type2_id ?? m?.type2 ?? undefined,
      sprite_default_url: m?.sprite_default_url ?? m?.spriteDefaultUrl ?? undefined,
      sprite_shiny_url: m?.sprite_shiny_url ?? m?.spriteShinyUrl ?? undefined,

      // moves normalization (name/type/category/etc.)
      moves: moves.map((mv: any) => ({
        slot: Number(mv?.slot ?? mv?.move_slot ?? 0),
        name: mv?.name ?? mv?.move_name ?? '',
        type_id: mv?.type_id ?? mv?.move_type_id ?? '',
        category: (mv?.category ?? mv?.move_category ?? 'STATUS') as
          | 'PHYSICAL'
          | 'SPECIAL'
          | 'STATUS',
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
function titleize(s?: string | null) {
  if (!s) return undefined;
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Build a multiline HTML string summarizing a move's stats for the tooltip. */
function buildMoveTooltip(move: {
  type_id: string;
  power?: number;
  accuracy?: number;
  effect_text?: string;
}) {
  const parts = [
    `Type: ${move.type_id}`,
    `Power: ${move.power ?? '—'}`,
    `Accuracy: ${move.accuracy ?? '—'}`,
  ];
  if (move.effect_text) parts.push(move.effect_text);
  return parts.join('<br/>');
}

export function TrainerCard({ trainer }: TrainerCardProps) {
  const { currentGame } = useGame();
  const queryClient = useQueryClient();

  /**
   * Prefetch full trainer data so accordion details render instantly on hover or focus.
   */
  const prefetchTrainer = () =>
    queryClient.prefetchQuery<Trainer | null>({
      queryKey: ['trainer-detail', trainer.trainer_id, currentGame],
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      queryFn: async () => {
        const { data, error } = await supabase
          .from('v_app_trainers_full')
          .select('*')
          .eq('game_id', currentGame)
          .eq('trainer_id', trainer.trainer_id)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
    });
  // Champions are determined by their trainer class since the view lacks a dedicated flag
  const isChampion = trainer.trainer_class === 'Champion';

  // Normalize team JSON to get team members (already ordered by slot in the view)
  const team = normalizeTeam(trainer.team);

  return (
    <Card className="hover:shadow-lg transition-all bg-card backdrop-blur supports-[backdrop-filter]:bg-card border border-border/40">
      <CardContent className="p-4 space-y-3">
        {/* Header with sprite, name, split, location, and CTA */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-grow overflow-hidden">

            {/* Trainer sprites (and many others) lack @2x assets, so the Sprite
               component disables high-DPI srcSet generation by default. */}

            <Sprite
              src={trainer.sprite_url}
              alt={trainer.trainer_name}
              size={64}
              width={64}
              height={64}
              className="bg-muted rounded-lg flex-shrink-0"
              highDpi={false}
              placeholder={
                trainer.is_leader ? (
                  <Shield className="w-6 h-6 text-primary" />
                ) : isChampion ? (
                  <Crown className="w-6 h-6 text-yellow-500" />
                ) : (
                  <span className="text-xl">🧑‍🎓</span>
                )
              }
            >
              {trainer.is_leader && (
                <Shield className="w-4 h-4 text-primary absolute -top-1 -right-1 bg-background rounded-full" />
              )}
              {isChampion && (
                <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 bg-background rounded-full" />
              )}
            </Sprite>
            <div className="flex-grow overflow-hidden">
              <h3 className="text-lg font-semibold truncate mb-1">
                {trainer.trainer_name}
              </h3>
              <div className="flex flex-wrap items-center gap-1 text-muted-foreground text-sm">
                {trainer.split && (
                  <Badge variant="outline" className="text-[10px]">
                    {trainer.split}
                  </Badge>
                )}
                {trainer.display_location && (
                  <span className="truncate">{trainer.display_location}</span>
                )}
              </div>
            </div>
          </div>

          {trainer.split && (
            <Link
              href={`/trainers/list?split=${encodeURIComponent(trainer.split)}&game=${currentGame}`}
              className="flex-shrink-0"
            >
              <Button className="btn-sm whitespace-nowrap">View Trainers</Button>
            </Link>
          )}
        </div>

        {/* Team preview - clickable to trainer detail */}
        <Link href={`/trainer/${trainer.trainer_id}?game=${currentGame}`}>
        <Link href={`/trainer/${trainer.trainer_id}?game=${currentGame}`}>
        <div className="flex flex-wrap gap-2">
          {team.slice(0, 6).map((member, index) => (
            <div
              key={index}
            >
              <Sprite
                src={member.sprite_default_url}
                alt={member.name || 'Pokémon'}
                size={56}
                width={56}
                height={56}
                className="rounded"
                placeholder={<PawPrint className="w-4 h-4 text-muted-foreground" />}
              />
              {member.level && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-1 rounded bg-secondary text-secondary-foreground px-1 text-[10px]">
                  Lv.{member.level}
                </span>
              )}
            </div>
            </div>
        </div>
        </Link>
        </Link>

        {/* Full team details */}
        <Accordion type="single" collapsible className="mt-2 border-t border-border/30 pt-2">
          <AccordionItem value="details" className="border-0">
            <AccordionTrigger
              className="btn btn-outline-secondary btn-sm w-full justify-center py-1"
              onMouseEnter={prefetchTrainer}
              onFocus={prefetchTrainer}
            >
              Team Details
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              {team.map((member, i) => (
                <div key={`member-${i}`} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/pokemon/${member.forme_id}?game=${currentGame}`}
                      className="flex-shrink-0"
                    >
                      {member.shiny ? (
                        // Shiny indicator gets an accessible tooltip
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Sprite
                              src={member.sprite_default_url}
                              alt={member.name || 'Pokémon'}
                              width={64}
                              height={64}
                              className="bg-muted rounded relative"
                              placeholder={<PawPrint className="w-4 h-4 text-muted-foreground" />}
                            >
                              <div className="absolute top-0 right-0 w-3 h-3 -translate-y-1/2 translate-x-1/2 bg-warning rounded-full" />
                            </Sprite>
                          </TooltipTrigger>
                          <TooltipContent>Shiny</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Sprite
                          src={member.sprite_default_url}
                          alt={member.name || 'Pokémon'}
                          width={64}
                          height={64}
                          className="bg-muted rounded relative"
                          placeholder={<PawPrint className="w-4 h-4 text-muted-foreground" />}
                        />
                      )}
                    </Link>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex flex-wrap justify-between gap-2 overflow-hidden">
                        <div className="font-medium text-lg truncate">{member.name}</div>
                        {member.level && (
                          <span className="text-sm font-mono bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            Lv.{member.level}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <TypeBadge type={member.type1_id} className="text-xs" />
                        {member.type2_id && (
                          <TypeBadge type={member.type2_id} className="text-xs" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Ability:{' '}
                      {member.ability ? (
                        <InfoTooltip content={member.ability_description || ''}>
                          <span>{member.ability}</span>
                        </InfoTooltip>
                      ) : (
                        '—'
                      )}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Item: {member.item || '—'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Nature: {titleize(member.nature) || '—'}
                    </Badge>
                  </div>

                  {Array.isArray(member.moves) && member.moves.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {member.moves.map((move, idx) => (
                        <InfoTooltip key={idx} content={buildMoveTooltip(move)}>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 text-sm"
                          >
                            <TypeBadge type={move.type_id} />
                            <span className="truncate">{move.name}</span>
                            <MoveCategoryBadge category={move.category} />
                          </Badge>
                        </InfoTooltip>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}