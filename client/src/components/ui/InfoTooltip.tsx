/**
 * @file InfoTooltip.tsx
 * Provides a reusable Radix tooltip wrapper that shows brief informational
 * text on hover or focus. The trigger remains keyboard focusable and the
 * tooltip content is linked via `aria-describedby` for accessibility.
 */
import { useId, ReactNode } from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';

interface InfoTooltipProps {
  /**
   * HTML string shown inside the tooltip. Content must remain brief and
   * non-interactive; long or complex markup should use a modal instead.
   */
  content: string;
  /** Optional placement of the tooltip relative to the trigger. */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  /** Element that activates the tooltip on hover or focus. */
  children: ReactNode;
}

/**
 * Wraps arbitrary children in a span that displays a Radix tooltip when
 * hovered or focused. The component enforces short, non-interactive content
 * and warns in development if those constraints are violated.
 */
export function InfoTooltip({
  content,
  placement = 'top',
  children,
}: InfoTooltipProps) {
  const id = useId();

  // Strip tags for length check and detect any focusable elements.
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  const hasInteractive = /<(a|button|input|select|textarea)\b/i.test(content);
  const allowTooltip = textContent.length <= 200 && !hasInteractive;

  if (!allowTooltip) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'InfoTooltip: content is too long or contains interactive elements. Use a modal instead.'
      );
    }
    return (
      <span tabIndex={0} className="inline-block">
        {children}
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            role="button"
            aria-describedby={id}
            className="inline-block"
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent
          id={id}
          side={placement === 'auto' ? undefined : placement}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default InfoTooltip;
