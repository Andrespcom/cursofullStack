const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    plugins: {
      js,
    },
    rules: js.configs.recommended.rules,
  },
  {
    ignores: ["build/**"],
  },
];
