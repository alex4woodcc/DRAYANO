
/**
 * Root application component wiring global providers and
 * synchronizing the active game from the URL.
 */

import { Switch, Route, useSearch } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/layout/Navigation";
import { BackToTop } from "@/components/layout/BackToTop";
import { usePreflight } from "@/hooks/use-preflight";
import { useGame } from "@/hooks/use-game";
import type { GameId } from "@/types/database";

import Home from "@/pages/Home";
import Pokedex from "@/pages/Pokedex";
import PokemonDetail from "@/pages/PokemonDetail";
import Encounters from "@/pages/Encounters";
import Trainers from "@/pages/Trainers";
import TrainersList from "@/pages/TrainersList";
import TrainerDetail from "@/pages/TrainerDetail";
import TrainerDetail from "@/pages/TrainerDetail";
import Preflight from "@/pages/Preflight";
import Styleguide from "@/pages/Styleguide";
import NotFound from "@/pages/not-found";

/**
 * Main application shell handling game state and routing.
 * Restores a neutral dark background while reading the
 * selected game from the URL and updating the store.
 */
function AppContent() {
  const { currentGame, setCurrentGame } = useGame();
  const search = useSearch();



  // Sync game selection with the `game` query parameter and keep
  // Zustand store updated when navigating between games.
  useEffect(() => {
    const params = new URLSearchParams(search);
    const gameParam = params.get("game") as GameId | null;
    if (gameParam && gameParam !== currentGame) {
      setCurrentGame(gameParam);
    }
  }, [search, currentGame, setCurrentGame]);

  const { isLoading } = usePreflight(currentGame);

  // Show preflight screen while checking - if failed, let the app load and show errors in components
  if (isLoading) {
    return <Preflight />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        data-testid="skip-to-main"
      >
        Skip to main content
      </a>

      <Navigation />

      <main id="main-content" className="py-8">
        <div className="max-w-[1280px] mx-auto px-4">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/pokedex" component={Pokedex} />
            <Route path="/pokemon/:formeId" component={PokemonDetail} />
            <Route path="/encounters" component={Encounters} />
            <Route path="/trainers" component={Trainers} />
            <Route path="/trainers/list" component={TrainersList} />
            <Route path="/trainer/:trainerId" component={TrainerDetail} />
            <Route path="/trainer/:trainerId" component={TrainerDetail} />
            <Route path="/styleguide" component={Styleguide} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>

      <BackToTop />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
