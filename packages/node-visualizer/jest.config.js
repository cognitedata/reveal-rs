/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('../jest.react.config.js');

module.exports = {
  ...baseConfig,
  verbose: true,
  setupFiles: ['jest-localstorage-mock'],
  testPathIgnorePatterns: ['test-data.ts'],
  coveragePathIgnorePatterns: ['node_modules', '__tests__', '.stories.'],
  moduleNameMapper: {
    '.+\\.(svg|png|jpg|ttf|woff|woff2)$': [
      '<rootDir>/../../node_modules/jest-transform-stub',
      '<rootDir>/../../../npm/node_modules/jest-transform-stub',
    ],
    '^@cognite/(.*)/dist/mocks$': [
      '../../../packages/$1/src/mocks',
      '../../../packages/$1/dist/mocks',
    ],
    '@cognite/storage': [
      '<rootDir>/../storage/src',
      '<rootDir>/../storage/dist',
    ],
    '@cognite/metrics': [
      '<rootDir>/../metrics/src',
      '<rootDir>/../metrics/dist',
    ],
    '/^@cognite/(?!cogs.js|seismic-sdk-js)(.*)$/': [
      '../../packages/$1/src',
      '../../packages/$1/dist',
      '<rootDir>/packages/$1/src',
      '<rootDir>/packages/$1/dist',
    ],
  },
};
