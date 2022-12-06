import paazmaya from 'eslint-config-paazmaya';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

export default [
  paazmaya,
  {
    files: ["**/*.tsx", "**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es6
      },
      parser: tsParser
    },
  }
];