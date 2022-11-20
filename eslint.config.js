import paazmaya from 'eslint-config-paazmaya';
import globals from 'globals';
import babelParser from 'babel-eslint';

export default [

  paazmaya,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es6
      },
      parser: babelParser
    }
  }
];
