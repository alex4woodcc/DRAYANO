import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorBoundaryProps {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorBoundary({ 
  error, 
  onRetry, 
  title = "Something went wrong" 
}: ErrorBoundaryProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {errorMessage}
          </p>
          {onRetry && (
            <Button onClick={onRetry} data-testid="error-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
