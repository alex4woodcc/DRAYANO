/**
 * @file Not found page displayed for unmatched routes. Provides a concise
 * message in a centered card with accessible focus styles.
 */
import '@/index.css';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
      <div className="min-h-screen w-full grid place-items-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-4">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Did you forget to add the page to the router?
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
