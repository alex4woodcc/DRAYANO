import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// Simple PostCSS plugin to scope all selectors under `.tw-root`
const scopeSelector = () => ({
  postcssPlugin: "scope-tailwind",
  Rule(rule) {
    if (rule.selector.startsWith(":root")) return;
    rule.selector = `.tw-root ${rule.selector}`;
  },
});
scopeSelector.postcss = true;

export default {
  plugins: [tailwindcss(), scopeSelector, autoprefixer()],
};
