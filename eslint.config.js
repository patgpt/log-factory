import pluginJs from "@eslint/js";
import { 
  Linter,
 } from "eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

 

/**@type {Linter.Config}**/
const config ={
  files: ["**/*.{js,mjs,cjs,ts,toml,md,json}"],
  ignores: ["node_modules/**", "dist/**", "build/**", "coverage/**", "bun.lockb", "bunfig.toml","logs/**"],
  languageOptions: { globals: globals.browser },
  ...pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginPrettierRecommended.configs.recommended,
}

export default config;



 