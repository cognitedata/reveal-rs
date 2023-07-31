import '__mocks/setupMockCogniteSDK';
import { getMockLabelsPost } from 'domain/labels/service/__mocks/getMockLabels';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testWrapper as wrapper } from '__test-utils/renderer';

import { useLabelsQuery } from '../useLabelsQuery';

const mockServer = setupServer(getMockLabelsPost());

describe('useLabelsQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  test('should return labels', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLabelsQuery(), {
      wrapper,
    });

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current).toEqual({
      Mock_Label_1: 'Mock Label 1',
      Mock_Label_2: 'Mock Label 2',
    });
  });
});
