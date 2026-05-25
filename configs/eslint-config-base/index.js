const js = require("@eslint/js");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/.yarn/**",
      "**/build/**",
      "**/*.min.*",
      "**/*.d.ts",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,cjs,mjs,ts,cts,mts,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    files: ["**/*.{ts,cts,mts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
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
    },
  },
  eslintConfigPrettier,
];
