 
/**
 * @type {import('lint-staged').Config}
 */
export default {
  '*.{js,ts,jsx,tsx}': ['bunx eslint --fix', 'bunx prettier --write'],
  '*.{json,md}': ['bunx prettier --write'],
};
