// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "vue/no-v-html": "off",
    // 与 Prettier 冲突
    "vue/html-self-closing": "off",
  },
});
