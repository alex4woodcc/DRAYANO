/**
 * @file Preflight connectivity check page ensuring the database is reachable
 * before loading the main application. Displays status messages in centered
 * cards with clear focus states.
 */
import '@/index.css';
import { usePreflight } from '@/hooks/use-preflight';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function Preflight() {
  const { currentGame } = useGame();
  const { data: preflightResult, isLoading, error, refetch } = usePreflight(currentGame);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-4 text-center">
            <LoadingSkeleton className="h-12 w-12 mx-auto mb-4 rounded-full" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Checking Database Connection
            </h2>
            <p className="text-muted-foreground">
              Validating environment and database views...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !preflightResult?.isReady) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">
              Database Connection Failed
            </h2>
            <p className="text-muted-foreground mb-4 text-sm">
              {preflightResult?.error || error?.toString() || 'Unknown error occurred'}
            </p>
            <Button onClick={() => refetch()} data-testid="preflight-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg text-left">
              <h3 className="font-semibold text-foreground mb-2">Troubleshooting:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check VITE_SUPABASE_URL in Replit Secrets</li>
                <li>• Check VITE_SUPABASE_ANON_KEY in Replit Secrets</li>
                <li>• Verify database views are deployed</li>
                <li>• Ensure RLS policies allow anon access</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            Database Ready
          </h2>
          <p className="text-muted-foreground">
            All systems operational. Redirecting to app...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
