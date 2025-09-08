/**
 * @file Sprite component providing square containers with Tailwind sizing.
 * Images are lazy-loaded, expose optional intrinsic `width`/`height` attributes
 * to prevent layout shift, and can generate a high-DPR `srcSet` only when
 * enabled. Missing retina assets automatically fall back to their base files.
 * Sprites never overflow their parent container.
 */

import { ReactNode, SyntheticEvent } from 'react';
import { cn } from '@/lib/utils';

interface SpriteProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'width' | 'height'> {
  /** Source URL for the sprite image. If omitted, a placeholder renders instead. */
  src?: string | null;
  /** Alt text describing the sprite image. */
  alt: string;
  /** Optional placeholder node when no sprite is available. */
  placeholder?: ReactNode;
  /** Elements rendered inside the sprite container (e.g., overlays). */
  children?: ReactNode;
  /**
   * Size of the square container. A number sets pixel dimensions; a string can
   * contain Tailwind width/height classes. Defaults to `w-16 h-16` (64×64).
   */
  size?: number | string;
  /** Intrinsic width of the image. Defaults to `size` when provided. */
  width?: number;
  /** Intrinsic height of the image. Defaults to `size` when provided. */
  height?: number;
  /**
   * When true, generate a simple `1x/2x` srcSet using the `@2x` naming
   * convention. Disabled by default because many assets lack high-DPI variants,
   * which would otherwise trigger 404s on retina displays.
   */
  highDpi?: boolean;
}

/** Build a simple srcSet using @2x naming convention for high-DPR displays. */
function buildSrcSet(src: string): string | undefined {
  const index = src.lastIndexOf('.');
  if (index === -1) return undefined;
  const base = src.slice(0, index);
  const ext = src.slice(index);
  return `${src} 1x, ${base}@2x${ext} 2x`;
}

/**
 * Renders a sprite image inside a square container. The container reserves
 * space to prevent layout shift while the image loads. Optionally generates a
 * `1x/2x` srcSet for crisp rendering on high-DPI displays.
 */
export function Sprite({
  src,
  alt,
  placeholder = <span className="text-sm">🐾</span>,
  className,
  children,
  size,
  width,
  height,

  highDpi = false,
  ...divProps
}: SpriteProps) {
  const sizeClasses = typeof size === 'string' ? size : undefined;
  const containerStyle =
    typeof size === 'number'
      ? {
          width: `${size}px`,
          height: `${size}px`,
          flexShrink: 0,
          ...divProps.style,
        }
      : divProps.style;

  const imgWidth = width ?? (typeof size === 'number' ? size : undefined);
  const imgHeight = height ?? (typeof size === 'number' ? size : undefined);

  /**
   * Fallback handler for missing retina assets. If the requested source ends
   * with `@2` or `@2x` (before any query string), strip the suffix and retry
   * with the base file so 404s do not break the image.
   */
  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const [path, query] = img.src.split('?');
    const normalized = path.replace(/(@2x|@2)(\.[a-zA-Z0-9]+)$/i, '$2');
    if (normalized !== path) {
      img.onerror = null;
      img.src = query ? `${normalized}?${query}` : normalized;
    }
  };

  return (
    <div
      {...divProps}
      style={containerStyle}
      className={cn(
        'relative flex items-center justify-center overflow-hidden aspect-square',
        sizeClasses ?? 'w-16 h-16',
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          width={imgWidth}
          height={imgHeight}
          className="w-full h-full object-contain"
          loading="lazy"
          srcSet={highDpi ? buildSrcSet(src) : undefined}
          onError={handleError}
        />
      ) : (
        placeholder
      )}
      {children}
    </div>
  );
}

