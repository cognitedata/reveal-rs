import { CogniteClient } from '@cognite/sdk';
import { saveToLocalStorage } from '@cognite/storage';

import CogniteAuth from './authentication';
import { FakeIdP } from './types';

jest.mock('@cognite/sdk', () => {
  return {
    CogniteClient: () => {
      return {
        getCDFToken: () => 'test-accessToken',
        loginWithOAuth: () => Promise.resolve(true),
        setBaseUrl: jest.fn(),
        authenticate: () => true,
        login: {
          status: () => {
            return {
              project: 'test',
            };
          },
        },
      };
    },
  };
});

describe('CogniteAuth', () => {
  let client: CogniteClient;
  let auth: CogniteAuth;

  describe('FAKE_IDP', () => {
    beforeEach(() => {
      client = new CogniteClient({ appId: 'test' });
      auth = new CogniteAuth(client, {
        appName: 'test-app',
        flow: 'FAKE_IDP',
      });

      saveToLocalStorage<FakeIdP>('fakeIdp', {
        idToken: 'idToken',
        accessToken: 'accessToken',
        project: 'project',
        cluster: 'cluster',
      });
    });

    test('FAKE_IDP flow - loginAndAuthIfNeeded', async () => {
      await auth.loginAndAuthIfNeeded({
        flow: 'FAKE_IDP',
        project: 'test-project',
      });
      expect(auth.state).toMatchObject({
        authenticated: true,
        error: false,
        initializing: false,
        authResult: {
          accessToken: 'accessToken',
          authFlow: 'FAKE_IDP',
          idToken: 'idToken',
        },
      });
    });

    test('FAKE_IDP flow - loginInitial', async () => {
      await auth.loginInitial({
        flow: 'FAKE_IDP',
        cluster: 'test-cluster',
      });
      expect(auth.state).toMatchObject({
        authenticated: true,
        error: false,
        initializing: false,
        authResult: {
          accessToken: 'accessToken',
          authFlow: 'FAKE_IDP',
          idToken: 'idToken',
        },
      });
    });

    test('FAKE_IDP flow - login - no local state', async () => {
      await auth.login();
      expect(auth.state).toMatchObject({
        authenticated: true,
        error: false,
        initializing: false,
        authResult: {
          accessToken: 'accessToken',
          authFlow: 'FAKE_IDP',
          idToken: 'idToken',
        },
      });
    });
  });

  describe('COGNITE_AUTH', () => {
    beforeEach(() => {
      client = new CogniteClient({ appId: 'test' });
      auth = new CogniteAuth(client, {
        appName: 'test-app',
        flow: 'COGNITE_AUTH',
      });
    });

    test('Make sure CogniteAuth can be constructed', () => {
      auth = new CogniteAuth(client);
      expect(auth.state).toMatchObject({
        authenticated: false,
        error: false,
        initializing: false,
      });
    });

    test('COGNITE_AUTH flow - loginAndAuthIfNeeded', async () => {
      await auth.loginAndAuthIfNeeded({
        flow: 'COGNITE_AUTH',
        project: 'test-project',
      });
      expect(auth.state).toMatchObject({
        authenticated: true,
        error: false,
        initializing: false,
        project: 'test-project',
        authResult: {
          authFlow: 'COGNITE_AUTH',
          accessToken: 'test-accessToken',
        },
      });
    });

    test('COGNITE_AUTH flow - loginInitial', async () => {
      await auth.loginInitial({
        flow: 'COGNITE_AUTH',
        cluster: 'test-cluster',
      });
      expect(auth.state).toMatchObject({
        authenticated: false,
        error: false,
        initializing: false,
      });
    });

    test('COGNITE_AUTH flow - login - no local state', async () => {
      await auth.login();
      expect(auth.state).toMatchObject({
        authenticated: false,
        error: false,
        initializing: false,
      });
    });

    // -@todo this test is not finished
    test('COGNITE_AUTH flow - login - good local state', async () => {
      jest.mock('./utils', () => {
        return {
          getFlow: () => ({
            flow: 'COGNITE_AUTH',
          }),
        };
      });

      await auth.login();
      expect(auth.state).toMatchObject({
        authenticated: false,
        error: false,
        initializing: false,
      });
    });
  });
});
