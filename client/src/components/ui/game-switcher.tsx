/**
 * @file Enhanced game switcher with shadcn/ui components for mobile.
 * Desktop shows button group, mobile uses Sheet with smooth animations.
 * Provides touch-friendly interactions and consistent search UX.
 */
import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { useGames } from '@/hooks/use-games';
import { GameId } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Game switcher component with responsive design and enhanced mobile UX.
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

  const currentGameData = games?.find(g => g.id === currentGame);

  // Game styling for visual distinction
  const gameStyles: Record<GameId, { bg: string; text: string; accent: string }> = {
    FRO: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-900 dark:text-red-100', accent: 'border-red-500' },
    SG: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-900 dark:text-yellow-100', accent: 'border-yellow-500' },
    RP: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-900 dark:text-purple-100', accent: 'border-purple-500' },
    VW2: { bg: 'bg-cyan-100 dark:bg-cyan-900/20', text: 'text-cyan-900 dark:text-cyan-100', accent: 'border-cyan-500' },
  };

  return (
    <>
      {/* Desktop: Button group */}
      <div className="hidden lg:flex bg-muted/50 rounded-lg p-1 gap-1" data-testid="game-switcher-desktop">
        {games?.map((game) => {
          const isActive = currentGame === game.id;
          const style = gameStyles[game.id];
          
          return (
            <Button
              key={game.id}
              onClick={() => handleGameChange(game.id)}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "transition-all duration-200",
                isActive && style ? `${style.bg} ${style.text} border ${style.accent}` : ""
              )}
              data-testid={`game-${game.id}`}
              title={game.name}
            >
              {game.short_name || game.id}
            </Button>
          );
        })}
      </div>

      {/* Mobile/Tablet: Sheet with Command interface */}
      <div className="lg:hidden" data-testid="game-switcher-mobile">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Game:</span>
              <Badge variant="secondary" className="text-xs">
                {currentGameData?.short_name || currentGame}
              </Badge>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </SheetTrigger>
          
          <SheetContent side="bottom" className="h-[400px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Select Game
              </SheetTitle>
            </SheetHeader>
            
            <Command className="mt-4">
              <CommandInput placeholder="Search games..." />
              <CommandList>
                <CommandEmpty>No games found.</CommandEmpty>
                <CommandGroup>
                  {games?.map((game) => {
                    const isActive = currentGame === game.id;
                    const style = gameStyles[game.id];
                    
                    return (
                      <CommandItem
                        key={game.id}
                        value={`${game.name} ${game.short_name}`}
                        onSelect={() => handleGameChange(game.id)}
                        className={cn(
                          "flex items-center justify-between p-4 cursor-pointer",
                          isActive && "bg-accent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            style?.bg || "bg-muted"
                          )}>
                            <Gamepad2 className={cn("w-5 h-5", style?.text || "text-foreground")} />
                          </div>
                          <div>
                            <div className="font-semibold">{game.short_name || game.id}</div>
                            <div className="text-sm text-muted-foreground">{game.name}</div>
                          </div>
                        </div>
                        {isActive && (
                          <Badge variant="default" className="ml-2">
                            Active
                          </Badge>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}