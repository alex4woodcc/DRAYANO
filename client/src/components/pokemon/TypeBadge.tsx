/**
 * @file TypeBadge component
 * Renders a color-coded badge for a given Pokémon type using an
 * accessible palette. Each type supplies light and dark variants to
 * maintain contrast in either color theme.
 */
import { cn } from '@/lib/utils';

// Palette matching official type colors. Dark-mode variants are expressed in
// HSL with ~20% reduced saturation to soften hues while keeping enough
// lightness for 4.5:1 text contrast. Each type also defines text color tokens
// to meet WCAG AA in both themes.
const typeColors: Record<string, { bg: string; text?: string }> = {
  normal: { bg: 'bg-[#A8A77A] dark:bg-[hsl(60_17%_72%)]', text: 'text-gray-900' },
  fire: { bg: 'bg-[#EE8130] dark:bg-[hsl(22_69%_73%)]', text: 'text-gray-900' },
  water: { bg: 'bg-[#6390F0] dark:bg-[hsl(217_80%_78%)]', text: 'text-gray-900' },
  electric: { bg: 'bg-[#F7D02C] dark:bg-[hsl(48_80%_69%)]', text: 'text-gray-900' },
  grass: { bg: 'bg-[#7AC74C] dark:bg-[hsl(94_51%_68%)]', text: 'text-gray-900' },
  ice: { bg: 'bg-[#96D9D6] dark:bg-[hsl(180_48%_84%)]', text: 'text-gray-900' },
  fighting: {
    bg: 'bg-[#C22E28] dark:bg-[hsl(4_54%_61%)]',
    text: 'text-gray-100 dark:text-gray-900',
  },
  poison: {
    bg: 'bg-[#A33EA1] dark:bg-[hsl(301_31%_63%)]',
    text: 'text-gray-100 dark:text-gray-900',
  },
  ground: { bg: 'bg-[#E2BF65] dark:bg-[hsl(42_66%_78%)]', text: 'text-gray-900' },
  flying: { bg: 'bg-[#A98FF3] dark:bg-[hsl(254_70%_85%)]', text: 'text-gray-900' },
  psychic: { bg: 'bg-[#F95587] dark:bg-[hsl(341_80%_78%)]', text: 'text-gray-900' },
  bug: { bg: 'bg-[#A6B91A] dark:bg-[hsl(68_51%_58%)]', text: 'text-gray-900' },
  rock: { bg: 'bg-[#B6A136] dark:bg-[hsl(48_43%_62%)]', text: 'text-gray-900' },
  ghost: {
    bg: 'bg-[#735797] dark:bg-[hsl(268_28%_61%)]',
    text: 'text-gray-100 dark:text-gray-900',
  },
  dragon: {
    bg: 'bg-[#6F35FC] dark:bg-[hsl(255_79%_74%)]',
    text: 'text-gray-100 dark:text-gray-900',
  },
  dark: {
    bg: 'bg-[#705746] dark:bg-[hsl(27_14%_53%)]',
    text: 'text-gray-100 dark:text-gray-900',
  },
  steel: { bg: 'bg-[#B7B7CE] dark:bg-[hsl(240_26%_88%)]', text: 'text-gray-900' },
  fairy: { bg: 'bg-[#D685AD] dark:bg-[hsl(330_54%_81%)]', text: 'text-gray-900' },
};

interface TypeBadgeProps {
  /** Pokémon type string (e.g., "fire", "water"). */
  type: string;
  /** Additional class names for layout adjustments. */
  className?: string;
}

/**
 * Displays a single Pokémon type as a styled badge. The type name is
 * normalized and mapped to hex color tokens with dark-mode fallbacks.
 */
export function TypeBadge({ type, className }: TypeBadgeProps) {
  const normalizedType = type.toLowerCase();
  const { bg, text } = typeColors[normalizedType] || {
    bg: 'bg-gray-500 dark:bg-gray-400',
    text: 'text-foreground',
  };

  return (
    <span
      className={cn(
        'px-2 py-1 text-sm font-semibold rounded capitalize drop-shadow-sm',
        bg,
        text ?? 'text-foreground',
        className,
      )}
      data-testid={`type-${normalizedType}`}
    >
      {type}
    </span>
  );
}
