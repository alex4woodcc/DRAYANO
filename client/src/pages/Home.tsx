/**
 * @file Home page listing available tools and current game details. Sections
 * are grouped with responsive cards and a 12-column grid to maintain a
 * consistent hierarchy across breakpoints.
 */
import '@/index.css';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Map, Users, ArrowRight } from 'lucide-react';
import { useGame } from '@/hooks/use-game';
import { useGames } from '@/hooks/use-games';
import type { GameId } from '@/types/database';

// Game-specific styling with dark mode considerations.
// Each card echoes the navbar color for quick visual association.
const gameStyles: Record<
  GameId,
  { gradient: string; icon: string; description: string; text: string; muted: string }
> = {
  FRO: {
    gradient: 'from-red-700 to-red-800 dark:from-red-800 dark:to-red-900',
    icon: '🔥',
    description: 'Enhanced Fire Red with new challenges',
    text: 'text-gray-100',
    muted: 'text-gray-100/90',
  },
  SG: {
    gradient:
      'from-amber-600 to-yellow-700 dark:from-amber-700 dark:to-yellow-800',
    icon: '⚡',
    description: 'Silver with increased difficulty',
    text: 'text-gray-900',
    muted: 'text-gray-900/80',
  },
  RP: {
    gradient:
      'from-purple-900 to-indigo-950 dark:from-purple-950 dark:to-indigo-950',
    icon: '💎',
    description: 'Platinum with all Pokémon available',
    text: 'text-gray-100',
    muted: 'text-gray-100/90',
  },
  VW2: {
    gradient:
      'from-cyan-100 to-blue-200 dark:from-cyan-200 dark:to-blue-300',
    icon: '⚡',
    description: 'White 2 with comprehensive improvements',
    text: 'text-gray-900',
    muted: 'text-gray-900/80',
  },
};

// Shared base classes to standardize game tile gradients and height.
const tileBase =
  'h-36 cursor-pointer transition-all hover:shadow-lg group overflow-hidden border-0 bg-gradient-to-br';

const tools = [
  {
    title: 'Pokédex',
    description: 'Browse Pokémon stats, types, abilities, and learnsets',
    icon: Book,
    href: '/pokedex',
    color: 'text-blue-500',
  },
  {
    title: 'Encounters',
    description: 'Find wild Pokémon locations, rates, and encounter methods',
    icon: Map,
    href: '/encounters',
    color: 'text-green-500',
  },
  {
    title: 'Trainers',
    description: 'View trainer battles, teams, and difficulty levels',
    icon: Users,
    href: '/trainers',
    color: 'text-purple-500',
  },
];

/**
 * Home landing component rendering game selection and quick access tools.
 */
export default function Home() {
  const { currentGame, setCurrentGame } = useGame();
  const { data: games } = useGames();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <Card className="p-3 sm:p-4 mb-2 sm:mb-3 text-center space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground">
            Drayano Gauntlet
          </h1>
          <p className="lead tracking-wide sm:tracking-normal text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive companion for Drayano ROM hack challenges
          </p>
        </div>
      </Card>

      {/* Game Selection Cards */}
      <Card className="p-3 sm:p-4 mb-2 sm:mb-3">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 text-center mb-4 sm:mb-6">
            <h2 className="h2 mb-2 text-foreground">Choose Your Adventure</h2>
            <p className="lead text-muted-foreground">
              Select a Drayano ROM hack to explore
            </p>
          </div>

          {games?.map((game) => {
            const style = gameStyles[game.id] || gameStyles.FRO;
            const isActive = currentGame === game.id;

            return (
              <Link
                className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3"
                href={`/?game=${game.id}`}
                onClick={() => setCurrentGame(game.id)}
                key={game.id}
              >
                <Card
                  className={`${tileBase} ${style.gradient} ${style.text} ${
                    isActive ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardContent className="text-center p-2 sm:p-3.5">
                    <div className="text-3xl mb-2">{style.icon}</div>
                    <h3 className="text-lg font-bold mb-1">{game.short_name || game.id}</h3>
                    <p className={`text-sm mb-3 ${style.muted}`}>{style.description}</p>
                    <div className="flex items-center justify-center text-sm">
                      <span className="mr-1">Explore</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Quick Access Tools */}
      <Card className="p-4 mb-3">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 text-center">
            <h2 className="h2 mb-2 text-foreground">Quick Access</h2>
            <p className="lead text-muted-foreground">
              Jump directly to any tool for the current game
            </p>
          </div>

          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                className="col-span-12 sm:col-span-6 md:col-span-4"
                href={`${tool.href}?game=${currentGame}`}
              >
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader className="text-center">
                    <Icon className={`w-12 h-12 mx-auto mb-4 ${tool.color} group-hover:scale-110 transition-transform`} />
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </Card>

    </div>
  );
}
