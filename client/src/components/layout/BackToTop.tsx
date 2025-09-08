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
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        width: '3rem',
        height: '3rem',
        boxShadow: 'var(--bs-box-shadow-lg)',
        transition: 'opacity 0.3s, transform 0.3s',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(4rem)',
        pointerEvents: isVisible ? 'auto' : 'none',
        zIndex: 50,
      }}
      data-testid="back-to-top"
    >
      <ArrowUp style={{ width: '1rem', height: '1rem' }} />
    </Button>
  );
}
