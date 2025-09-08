/**
 * @file Game switcher with proper Bootstrap integration for navbar.
 * Shows all 4 games with responsive button group and mobile dropdown.
 */
import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { useGames } from '@/hooks/use-games';
import { GameId } from '@/types/database';

/**
 * Game switcher component for navbar with responsive design.
 */
export function GameSwitcher() {
  const { currentGame, setCurrentGame } = useGame();
  const { data: games } = useGames();
  const [isOpen, setIsOpen] = useState(false);

  const handleGameChange = (gameId: GameId) => {
    setCurrentGame(gameId);
    setIsOpen(false);
    
    // Update URL to include game parameter
    const url = new URL(window.location.href);
    url.searchParams.set('game', gameId);
    window.history.replaceState({}, '', url.toString());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const currentGameData = games?.find(g => g.id === currentGame);
  return (
    <>
      {/* Desktop: Button group */}
      <div className="d-none d-lg-flex bg-muted rounded p-1" data-testid="game-switcher-desktop">
        {games?.map((game) => (
          <button
            key={game.id}
            onClick={() => handleGameChange(game.id)}
            className={`btn btn-sm px-3 py-1 text-xs fw-medium rounded-1 ${
              currentGame === game.id 
                ? 'btn-primary' 
                : 'btn-outline-secondary border-0 text-muted-foreground'
            }`}
            data-testid={`game-${game.id}`}
            title={game.name}
          >
            {game.short_name || game.id}
          </button>
        ))}
      </div>

      {/* Mobile/Tablet: Dropdown */}
      <div className="dropdown d-lg-none" data-testid="game-switcher-mobile">
        <button
          className="btn btn-outline-secondary btn-sm dropdown-toggle"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          aria-expanded={isOpen}
          data-bs-toggle="dropdown"
        >
          <span className="d-none d-sm-inline me-1">Game:</span>
          {currentGameData?.short_name || currentGame}
        </button>
        <ul className={`dropdown-menu${isOpen ? ' show' : ''}`}>
          {games?.map((game) => (
            <li key={game.id}>
              <button
                className={`dropdown-item ${currentGame === game.id ? 'active' : ''}`}
                onClick={() => handleGameChange(game.id)}
              >
                <strong>{game.short_name || game.id}</strong>
                <br />
                <small className="text-muted">{game.name}</small>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
   
  );
}
