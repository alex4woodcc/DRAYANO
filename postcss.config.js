import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

/**
 * PostCSS configuration with Tailwind scoping for Bootstrap coexistence.
 * Scopes all Tailwind utilities under `.tw-root` to prevent conflicts.
 */
const scopeSelector = () => ({
  postcssPlugin: "scope-tailwind",
  Rule(rule) {
    // Skip :root selectors and CSS custom properties
    if (rule.selector.startsWith(":root") || rule.selector.includes("--")) return;
    
    // Skip already scoped selectors
    if (rule.selector.includes(".tw-root")) return;
    
    // Apply scoping to all other selectors
    rule.selector = `.tw-root ${rule.selector}`;
  },
});
scopeSelector.postcss = true;

export default {
  plugins: [tailwindcss(), scopeSelector, autoprefixer()],
};