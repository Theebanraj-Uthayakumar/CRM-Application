module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  env: {
    node: true,
    jest: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  ignorePatterns: ["dist", "src/generated"],
  rules: {
    "no-console": ["warn", { allow: ["info", "warn", "error"] }],
    "@typescript-eslint/no-explicit-any": "off",
  },
};
