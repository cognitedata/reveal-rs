import { MockedCogniteClient } from '__mocks/MockedCogniteClient';

export const TEST_PROJECT = 'testProject';

jest.mock('@cognite/react-container', () => {
  const { ...rest } = jest.requireActual('@cognite/react-container');
  const getCogniteSDKClient = () => new MockedCogniteClient();
  const getTenantInfo = () => ['testProject'];
  const getAuthHeaders = () => ({
    auth: true,
    Authorization: 'Bearer fake-token',
  });
  return { ...rest, getTenantInfo, getCogniteSDKClient, getAuthHeaders };
});
