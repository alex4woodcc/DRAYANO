/**
 * Site-wide navigation bar using Bootstrap for responsive layout.
 * Provides access to main sections and includes game and theme controls.
 * Implements a client-side collapse toggle so mobile navigation works
 * even without the Bootstrap JavaScript bundle.
 */
import { Link, useLocation } from "wouter";
import { useEffect, useState, type CSSProperties } from "react";
import { GameSwitcher } from "@/components/ui/game-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Home, Book, Map, Users } from "lucide-react";
import { useGame } from "@/hooks/use-game";
import { useGames } from "@/hooks/use-games";
import type { GameId } from "@/types/database";

/**
 * Translate a raw pathname into a human readable section label.
 * Unknown paths return an empty string so the label space collapses gracefully.
 */
function getSectionLabel(pathname: string): string {
  const sections: Record<string, string> = {
    '/': 'Home',
    '/pokedex': 'Pokédex',
    '/encounters': 'Encounters',
    '/trainers': 'Trainers',
  };

  const match = Object.keys(sections).find((key) =>
    pathname === key || pathname.startsWith(`${key}/`)
  );
  return match ? sections[match] : '';
}

/**
 * Route configuration for primary navigation links.
 */
const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/pokedex", label: "Pokédex", icon: Book },
  { href: "/encounters", label: "Encounters", icon: Map },
  { href: "/trainers", label: "Trainers", icon: Users },
];

/**
 * Renders the responsive Bootstrap navigation bar with collapse support.
 */
export function Navigation() {
  const [location] = useLocation();
  const { currentGame } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  // Map each game to an explicit background and text color. Using inline
  // styles ensures Bootstrap's navbar variables pick up the colors and the
  // bar updates instantly when switching games.
  const gameNavStyles: Record<GameId, { bg: string; fg: string; variant: string }> = {
    RP: { bg: '#3b0764', fg: '#fff', variant: 'navbar-dark' },
    FRO: { bg: '#7f1d1d', fg: '#fff', variant: 'navbar-dark' },
    VW2: { bg: '#bae6fd', fg: '#000', variant: 'navbar-light' },
    SG: { bg: '#b45309', fg: '#000', variant: 'navbar-light' },
  };

  const { bg, fg, variant } = gameNavStyles[currentGame];
  const { data: games } = useGames();
  const currentGameInfo = games?.find((g) => g.id === currentGame);
  const gameDisplay = currentGameInfo?.short_name || currentGameInfo?.name || currentGame;

  const style: CSSProperties & Record<string, string> = {
    backgroundColor: bg,
    color: fg,
    '--bs-navbar-color': fg,
    '--bs-navbar-hover-color': fg,
    '--bs-navbar-active-color': fg,
    '--bs-navbar-brand-color': fg,
    '--bs-navbar-brand-hover-color': fg,
    '--dg-navbar-bg': bg,
    '--dg-navbar-fg': fg,
  };

  // Close the mobile menu when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className={`navbar navbar-expand-md fixed-top ${variant}`} style={style} aria-label="Main navigation">
      <div className="container-fluid position-relative d-flex align-items-center">
        <Link
          href={`/?game=${currentGame}`}
          className="navbar-brand fw-semibold"
          data-testid="logo-home"
          aria-label="Home"
        >
          Drayano Gauntlet
        </Link>


        <span className="dg-section-label">{getSectionLabel(location)}</span>

        <span className="dg-game-pill me-2">{gameDisplay}</span>


        <button
          className="navbar-toggler p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          type="button"
          aria-controls="mainNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((o) => !o)}
          data-testid="mobile-menu-btn"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`navbar-collapse collapse${isOpen ? " show" : ""}`} id="mainNav">
          <ul className="navbar-nav">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = location.startsWith(href);
              return (
                <li className="nav-item" key={href}>
                <Link
                  href={`${href}?game=${currentGame}`}
                  className={`nav-link d-flex align-items-center py-2${active ? " active fw-semibold" : ""}`}
                  aria-current={active ? "page" : undefined}
                  data-testid={`nav-${label.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={16} className="me-2" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Game selection and theme controls */}
        <div className="ms-auto d-flex align-items-center gap-2">
          <GameSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </nav>
    </nav>
  );
}
