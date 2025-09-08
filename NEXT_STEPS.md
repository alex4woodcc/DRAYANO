# Next Steps

## Design Tokens & Theming

- Define `--dg-navbar-bg` and `--dg-navbar-fg` for each game so `.dg-section-label` and `.dg-game-pill` inherit the correct colors.
- The game pill lightens `--dg-navbar-bg` via `color-mix` and selects a contrasting foreground with `color-contrast`, ensuring readability in light and dark themes.
- When adding new games, supply matching tokens in `client/src/styles/bootstrap-theme.css` to keep the navbar and pill responsive.

## Theme Responsiveness

The section label and game pill respond to the global `data-bs-theme` attribute. Users toggling between light and dark modes see the pill and label adjust automatically without additional code.
