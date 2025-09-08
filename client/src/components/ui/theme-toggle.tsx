/**
 * ThemeToggle component
 * Allows users to switch between light, dark, or system themes.
 * Synchronizes `data-bs-theme`, `.dark` class, and `document.documentElement.style.colorScheme`
 * so native UI controls match the selected mode.
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Theme = 'light' | 'dark' | 'system';

/**
 * Apply the chosen theme to the document and update color-scheme for native widgets.
 */
export const applyTheme = (newTheme: Theme) => {
  const html = document.documentElement;

  if (newTheme === 'system') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedTheme = systemPrefersDark ? 'dark' : 'light';
    html.setAttribute('data-bs-theme', resolvedTheme);
    html.classList.toggle('dark', systemPrefersDark);
    document.documentElement.style.colorScheme = resolvedTheme;
  } else {
    html.setAttribute('data-bs-theme', newTheme);
    html.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.style.colorScheme = newTheme;
  }
};

/**
 * Renders the dropdown button used to toggle between themes.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    // Get stored theme or default to system
    const storedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
        >
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}