const globals = require("globals");

module.exports = [
  {
    files: ["**/*.{js,cjs,mjs,ts,cts,mts}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
