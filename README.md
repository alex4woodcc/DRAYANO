# Drayano Gauntlet Companion

A comprehensive web companion for Drayano ROM hack challenges, featuring dark-mode responsive design and complete Pokédex, encounters, and trainer database.

## Features

- **Game Support**: games are queried from Supabase so new hacks appear automatically and URLs include a `?game=` parameter for direct linking. Each game record also exposes a `short_name` and `uses_type_based_damage` flag for flexible display and battle calculations.
- **Pokédex**: Complete database with stats, abilities, learnsets, and a responsive Bootstrap grid

- **Pokémon Detail**: Overview tab presents types and abilities in a responsive grid and shows base stats with accessible color-coded progress bars
- **Learnset Tab**: Groups moves by method with type and category badges, displaying level, power, and accuracy in a responsive grid with card-based rows that provide hover shadows and focus rings for better interaction feedback
- **Idle Charts**: Recharts visualizations defer rendering until the browser is idle and display skeleton placeholders so primary content remains interactive during hydration

- **Encounters**: Route-based wild Pokémon locations with sticky Title Case method tabs sized for touch, a Day/Night/Any toggle, high-contrast rate bars, and virtualization for long lists. Tables keep their headers and first column fixed while scrolling for better context
- **Encounter Search**: Inline search bar filters encounters by Pokémon name with debounced input, syncing to `?search=` and applying the filter server-side
- **Mobile Route Picker**: Below `md` the routes sidebar becomes a "Choose Route" button that opens a searchable drawer
- **Layout**: Application content now lives in a `max-w-[1280px] mx-auto px-4` wrapper and list pages shift from 1 → 2 → 12 columns at responsive breakpoints for predictable drops
- **Encounter Methods**: Filters appear as color-coded tabs with responsive Bootstrap tables, type badges, and skeleton loading states
- **Deep Linking**: Encounters page stores the selected route, method, time, search term, and page in the URL via a `useSearchParams` hook and server queries respect these filters, so refreshing or sharing a link restores the same view
- **Smart Caching**: All React Query `queryKey`s now include the active game and relevant filter values (search text, type, route, etc.) and use 5–15 minute `staleTime`/`cacheTime` windows to avoid redundant network calls when navigating
- **Navigation**: Bootstrap `navbar` with responsive collapse, game switcher, and theme toggle
- **Section Indicator**: Navbar centers the current page title with `.dg-section-label` and displays a `.dg-game-pill` badge whose background lightens the active game's `--dg-navbar-bg` token. Both elements react to light or dark mode so the page and game remain visible across themes
- **Keyboard Navigation**: Navbar items display a high-contrast focus ring with a background offset so keyboard users can easily track focus in both light and dark themes
- **Fast Game Switcher**: local fallback list renders instantly and a mobile-friendly dropdown makes switching games quick on any device
- **Contextual Navigation**: Page titles and breadcrumbs include the active game (e.g., `Pokédex – VW2`) and the navbar highlights the current page with an accessible mobile toggle
- **Visual Game Context**: Navigation bar and home cards adopt the selected game's colors so it's always clear which hack is active. RP uses a deep purple bar with white text, FRO switches to crimson red with white text, VW2 turns light cyan with black text, and SG highlights a dark gold with black text for strong contrast in both themes
- **Dark Neutral Background**: Interface uses a consistent dark backdrop; the navbar and home cards shift colors per game for quick context
- **Accurate Game Cards**: Sacred Gold now shows "SG" and game selection cards fully cover their gradient backgrounds
- **Back to Top**: Floating button appears after scrolling for easy return to the page header
- **Card Density**: Default card padding trimmed (`p-3.5`) for information-dense layouts
- **Home Layout**: Mobile hero typography and spacing trimmed so two game tiles are visible without scrolling; tile gradients and heights now share a common base class
- **Buttons**: Unified Bootstrap-styled `<Button>` component; variants map to `btn-primary`, `btn-outline-secondary`, `btn-sm`, etc.
- **Trainers**: Comprehensive trainer battle database
- **Leader Overview**: Trainers hub shows key story leaders with expandable teams and links to full trainer lists per split
- **Split-scoped Trainer Lists**: Visiting `/trainers/list?split=NAME` filters results to that story split and surfaces a clear "Filtered by" chip with one-click reset
- **Trainer Sprites**: Trainer lists and details now display official sprites
- **Trainer Sprites Backfill**: Missing trainer sprites are fetched via a secondary query so every trainer shows an icon
- **Responsive Sprites**: All Pokémon and trainer sprites use a Tailwind-only `<Sprite>` component with `aspect-square` containers and `object-contain w-full h-full` images. The component accepts explicit `width`/`height` attributes (defaulting to the `size` value) to prevent layout shift, only computes `srcSet` when `highDpi` is true, and falls back gracefully by stripping `@2x` suffixes when retina assets 404.
- **Sprite Placeholders**: Trainer and Pokémon sprites fall back to themed placeholder icons while maintaining square `ratio` containers
- **Team Details**: Pokémon teams show ability, held item, and nature for each member
- **Pokémon Links**: Encounter lists and trainer team sprites link to detailed Pokémon pages scoped to the active game
- **Level Cap Groups**: Trainers page inserts section headers when the level cap or story split changes to mirror in-game progression

- **Overflow Control**: Trainers, Encounters, and Pokédex pages now apply `flex-wrap` and `text-truncate` across routes, encounter tables, and team details to prevent horizontal scrolling at 360px, 768px, and 1024px

- **Fluid Typography**: Headings scale smoothly using `clamp()` so titles remain legible on phone-width viewports.
- **Touch Targets**: Navigation links and the game switcher use larger padding and spacing, and all icon buttons and toggles now provide ≥44×44 px hit areas with visible focus outlines.
- **Responsive Tables**: Demo tables on the Styleguide page sit in `.table-responsive` wrappers to avoid sideways scrolling on narrow screens.

- **Trainer Card Details**: Leader cards now highlight a single “View Trainers” CTA, enlarged sprites with compressed metadata, lighter dividers, and clickable team preview badges that wrap cleanly. The compact accordion still reveals ability, item, nature, and move badges for each Pokémon
- **Trainer Prefetch**: Hovering or focusing the “Team Details” button preloads full trainer data via React Query so the accordion expands instantly
- **Info Tooltips**: Ability and move names expose brief descriptions through keyboard-accessible Radix tooltips with consistent dark-mode styling; longer content renders inline per accessibility guidance. All other ad-hoc tooltips and popovers now pipe through this unified wrapper, eliminating Bootstrap `data-bs-*` attributes and browser `title` hints.

- **Forms**: Search and type filters use Bootstrap `input-group`, `form-control`, and `form-select` with accessible floating labels and validation feedback
- **Type Badges**: Refreshed palette with light/dark variants and larger, high-contrast text for improved legibility
- **Move Category Badges**: Physical, Special, and Status moves use matching badges for quick scanning
- **Theme Tokens**: Badges fall back to `text-foreground` and overlays use neutral gray tints for consistent contrast in light and dark modes
- **Dark Scheme Polish**: Introduces `--surface-0/1/2` tokens so background, cards, and sticky headers step through subtle grays. Accent, badge, and CTA hues are ~20% less saturated and off-white pill text maintains a ≥4.5:1 contrast ratio.
- **Dark Mode**: WCAG 2.1 compliant design with excellent contrast; base surfaces use dark gray `hsl(0,0%,12%)` for comfortable reading
- **Instant Theme**: Inline script sets theme and `color-scheme` before React loads
- **Native UI**: Root declares `color-scheme: light dark` and the theme toggle updates `document.documentElement.style.colorScheme` so forms and scrollbars match the active theme
- **Responsive**: Mobile-first design that works on all devices
- **Accessible**: Screen reader friendly with keyboard navigation
- **Live count announcements**: Item totals on list pages update via `aria-live="polite"` so screen readers announce new results when filters or pages change
- **Depth & Elevation**: Cards and tables now sit on slightly lighter surfaces with subtle shadows and encounter rows alternate backgrounds for clearer grouping
- **Styleguide**: `/styleguide` page demonstrates Bootstrap typography, buttons, forms, alerts, cards, tables, and skeleton loaders
- **Bug Fix**: Trainer teams now correctly display held items and natures
- **Bug Fix**: Resolved mismatched `<span>` tag in TrainerCard that caused build errors
- **Bug Fix**: Selecting a game card on the Home page now switches the active game for all tools
- **Bug Fix**: Sprite component disables high-DPI `srcSet` by default so sprites load correctly even when `@2x` assets are missing

- **Bug Fix**: Trainer sprites now load correctly in VW2 by avoiding missing `@2x` variants
- **Bug Fix**: Clicking the "Any" time-of-day filter no longer clears encounters or crashes the page

## Keyboard Navigation

All interactive controls use native HTML elements or expose appropriate ARIA roles and keyboard handlers. Accordion and tab components now connect triggers and panels with matching `id`/`aria-controls` pairs, and every focusable element shows a theme-aware focus ring in dark mode.

### Badge Palette

Type and move category badges use light/dark color pairs defined in HSL. Dark-mode hues reduce saturation by roughly 20% and keep lightness high enough for at least a 4.5:1 contrast ratio against their respective text colors (`text-gray-100` or `text-gray-900`).
## UI/UX Refresh

- **Bootstrap 5.3.3 CSS**: loaded via CDN in `index.html` with theme overrides in `client/src/styles/bootstrap-theme.css`. Bootstrap JS has been removed in favor of Radix/Shadcn components.
- **Tailwind scope**: Tailwind utilities are scoped under `.tw-root` to avoid collisions with Bootstrap's class names.
- **Dark mode**: follows `prefers-color-scheme` with a persistent toggle that updates `<html data-bs-theme>` and `color-scheme`.
- **Grid & media**: mobile-first Bootstrap grid (`sm`–`xxl`) with `.container`/`.container-fluid`, `row`/`col` utilities, and fluid media using Tailwind responsive image classes.
- **Styleguide**: preview components at [/styleguide](/styleguide).
- **Theming**: All page components now import global `index.css` so dual-mode color tokens and `:focus-visible` states apply consistently. Primary sections are wrapped in Bootstrap `Card` with `p-4 mb-3` spacing and hierarchy established through heading levels and `.lead` text.

### Game Switcher

Use the game switcher in the top navigation—desktop shows a button group while
mobile devices display a compact dropdown—to swap between supported ROM hacks.
The selector uses a built-in fallback list so it renders instantly even if
Supabase is slow or offline. Your selection persists in `localStorage` via
Zustand and automatically refreshes all active React Query data so pages like
**Pokédex**, **Encounters**, and **Trainers** always reflect the current game.
Game context is encoded in the URL (`?game=ID`) so views can be bookmarked or
shared directly.

### Test Matrix

| Page | 360px | 768px | 1280px | Keyboard Only |
|------|------|------|------|--------------|
| Home | [screenshot](https://placehold.co/360x640?text=Home+360) | [screenshot](https://placehold.co/768x1024?text=Home+768) | [screenshot](https://placehold.co/1280x800?text=Home+1280) | [gif](https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif) |
| Pokédex | [screenshot](https://placehold.co/360x640?text=Pokedex+360) | [screenshot](https://placehold.co/768x1024?text=Pokedex+768) | [screenshot](https://placehold.co/1280x800?text=Pokedex+1280) | [gif](https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif) |
| Encounters | [screenshot](https://placehold.co/360x640?text=Encounters+360) | [screenshot](https://placehold.co/768x1024?text=Encounters+768) | [screenshot](https://placehold.co/1280x800?text=Encounters+1280) | [gif](https://media.giphy.com/media/14uQ3cOFteDaU/giphy.gif) |

## Setup

### Required Replit Secrets

Set these environment variables in your Replit Secrets:

