import '__mocks/mockCogniteSDK';
import { useDocumentAssetNames } from 'domain/documents/internal/hooks/useDocumentAssetNames';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockAssetsByIds } from 'services/assets/__mocks/getMockAssets';

import { testWrapper } from '__test-utils/renderer';

const mockServer = setupServer(getMockAssetsByIds());
describe('useDocumentAssetNames hook', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useDocumentAssetNames([1, 2]),
      {
        wrapper: ({ children }) => testWrapper({ children }),
      }
    );
    await waitForNextUpdate();
    return result.current;
  };

  it('should return asset names', async () => {
    const response = await getHookResult();
    expect(response.data).toEqual(['Asset 1', 'Asset 2']);
  });
});
