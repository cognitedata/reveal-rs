import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';

import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'es',
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      // https://github.com/facebook/react/issues/20235
      // with react 17 we are getting Unresolved dependencies for react/jsx-runtime
      'react/jsx-runtime',
      'lodash/isFunction',
      'lodash/isString',
      'lodash/isObject',
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
      json(),
    ],
  },
  {
    input: 'src/mocks.ts',
    output: [
      {
        file: 'dist/mocks.js',
        format: 'cjs',
        exports: 'default',
      },
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
      }),
      json(),
    ],
  },
];
