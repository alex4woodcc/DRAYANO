/**
 * Floating button that scrolls the page back to the top.
 * Only becomes visible after the user scrolls down.
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

/**
 * Renders the Back to Top control.
 */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  /** Smoothly scrolls the viewport to the top. */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      variant="default"
      aria-label="Back to top"
      className={cn(
        "fixed bottom-6 right-6 w-12 h-12 shadow-lg transition-all duration-300 z-50",
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-16 pointer-events-none"
      )}
      data-testid="back-to-top"
    >
      <ArrowUp className="w-4 h-4" />
    </Button>
  );
}
