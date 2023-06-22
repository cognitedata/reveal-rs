/* eslint-disable */
export default {
  displayName: 'shared-cdf-ui-i18n-utils-cdf-ui-i18n-utils',
  preset: '../../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory:
    '../../../../coverage/libs/shared/cdf-ui-i18n-utils/cdf-ui-i18n-utils',
};
