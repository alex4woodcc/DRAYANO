/**
 * @file MoveCategoryBadge component
 * Renders a color-coded badge representing a move's category (Physical,
 * Special, or Status) using the shared palette. Dark-mode colors are written
 * in HSL with roughly 20% less saturation to reduce glare while preserving
 * sufficient contrast against category text.
 */
import { cn } from '@/lib/utils';

const categoryColors: Record<string, { bg: string; text?: string }> = {
  physical: {
    bg: 'bg-[#C22E28] dark:bg-[hsl(4_54%_61%)]',
    text: 'text-gray-100 dark:text-gray-900',
  },
  special: {
    bg: 'bg-[#6390F0] dark:bg-[hsl(217_80%_78%)]',
    text: 'text-gray-100 dark:text-gray-900',
  },
  status: {
    bg: 'bg-[#A8A77A] dark:bg-[hsl(60_17%_72%)]',
    text: 'text-gray-900',
  },
};

interface MoveCategoryBadgeProps {
  /** Move category label such as "PHYSICAL", "SPECIAL", or "STATUS". */
  category: 'PHYSICAL' | 'SPECIAL' | 'STATUS';
  /** Additional class names for positioning. */
  className?: string;
}

/**
 * Display a badge for a move category leveraging the shared palette for
 * visual consistency with type badges.
 */
export function MoveCategoryBadge({ category, className }: MoveCategoryBadgeProps) {
  const key = category.toLowerCase();
  const { bg, text } = categoryColors[key] || categoryColors.status;

  return (
    <span
      className={cn(
        'px-2 py-1 text-sm font-semibold rounded capitalize drop-shadow-sm',
        bg,
        text ?? 'text-foreground',
        className,
      )}
      data-testid={`move-category-${key}`}
    >
      {key}
    </span>
  );
}
