// Updated database types based on the architecture guide
/** Identifier for a supported game. */
export type GameId = string;

/** Game metadata fetched from Supabase. */
export interface Game {
  /** Unique game identifier such as `FRO` or `SG`. */
  id: GameId;
  /** Human readable game name. */
  name: string;
  /** Short display name or slug for URLs and badges. */
  short_name: string;
  /** Whether the game applies type-based damage adjustments. */
  uses_type_based_damage: boolean;
  /** Optional longer description for marketing or hero cards. */
  description?: string;
}

export interface PokedexEntry {
  forme_id: string;
  display_name: string;
  game_id: GameId;
  type1_id: string;
  type2_id?: string;
  sprite_default_url?: string;
  sprite_shiny_url?: string;
}

export interface PokedexDetail {
  forme_id: string;
  display_name: string;
  game_id: GameId;
  type1_id: string;
  type2_id?: string;
  type1: string;
  type2?: string;
  ability1_id?: string;
  ability2_id?: string;
  hidden_ability_id?: string;
  ability1_name?: string;
  ability2_name?: string;
  hidden_ability_name?: string;
  ability1_description?: string;
  ability2_description?: string;
  hidden_ability_description?: string;
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
  sprite_default_url?: string;
  sprite_shiny_url?: string;
  learnset: Record<string, LearnsetMove[]>;
}

export interface LearnsetMove {
  move_id: string;
  name: string;
  type_id: string;
  category: 'PHYSICAL' | 'SPECIAL' | 'STATUS';
  power?: number;
  accuracy?: number;
  pp?: number;
  priority?: number;
  level?: number;
  effect_text?: string;
}

export interface RouteEncounter {
  route_id: string;
  route_name: string;
  forme_id: string;
  forme_label: string;
  game_id: GameId;
  method: string;
  subarea?: string;
  time_of_day?: string;
  weather?: string;
  min_level: number;
  max_level: number;
  rate: number;
  slot_no: number;
  sort_index: number;
  types: string[];
  type1_id: string;
  type2_id?: string;
  sprite_default_url?: string;
  sprite_shiny_url?: string;
  id: string;
}

export interface Trainer {
  trainer_id: string;
  trainer_name: string;
  trainer_class: string;
  game_id: GameId;
  split?: string;
  split_group_order?: number;
  split_order?: number;
  split_trainer_order?: number;
  display_location?: string;
  location_route_id?: string;
  variant_key: string;
  variant_label: string;
  level_cap?: number;
  is_leader: boolean;
  /** Optional sprite for visualizing the trainer */
  sprite_url?: string;
  /** Optional mugshot or portrait for detail views */
  mugshot_url?: string;
  team: TrainerPokemon[];
}

export interface TrainerPokemon {
  slot_no: number;
  level: number;
  shiny: boolean;
  forme_id: string;
  name: string;
  ability?: string;
  ability_description?: string;
  item?: string;
  nature?: string;
  type1_id: string;
  type2_id?: string;
  sprite_default_url?: string;
  sprite_shiny_url?: string;
  moves: TrainerMove[];
}

export interface TrainerMove {
  slot: number;
  name: string;
  type_id: string;
  category: 'PHYSICAL' | 'SPECIAL' | 'STATUS';
  power?: number;
  accuracy?: number;
  pp?: number;
  priority?: number;
  effect_text?: string;
}

export interface Move {
  move_uid: string;
  id: string;
  display_name: string;
  type_id: string;
  category: 'PHYSICAL' | 'SPECIAL' | 'STATUS';
  power?: number;
  accuracy?: number;
  pp?: number;
  priority?: number;
  effect_text?: string;
}