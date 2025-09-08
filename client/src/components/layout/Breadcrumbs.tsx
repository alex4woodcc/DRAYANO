import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <div className={cn("bg-muted/30 border-b border-border", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <nav className="flex items-center space-x-2 text-sm" data-testid="breadcrumbs">
          <Link href="/">
            <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <Home className="h-4 w-4" />
            </span>
          </Link>
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              {item.href ? (
                <Link href={item.href}>
                  <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
