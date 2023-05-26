// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import config from '@platypus-app/config/config';

import { configureI18n } from '@cognite/react-i18n';
import { CogniteClient } from '@cognite/sdk';

import { setCogniteSDKClient } from '../environments/cogniteSdk';

configureI18n();

const cogniteClient: CogniteClient = new CogniteClient({
  appId: config.APP_APP_ID,
  baseUrl: window.location.origin,
  project: 'mock',
  noAuthMode: true,
  getToken: async () => 'mock',
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
cogniteClient.initAPIs();

setCogniteSDKClient(cogniteClient);
