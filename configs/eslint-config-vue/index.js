const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const vuePlugin = require("eslint-plugin-vue");
const vueParser = require("vue-eslint-parser");
const globals = require("globals");

module.exports = [
  ...vuePlugin.configs["flat/essential"],
  {
    files: ["**/*.{js,cjs,mjs,ts,cts,mts,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-undef": "off",
      "no-useless-catch": "off",
      "vue/multi-word-component-names": "off",
      "vue/attributes-order": "off",
      "vue/require-default-prop": "off",
    },
  },
];
