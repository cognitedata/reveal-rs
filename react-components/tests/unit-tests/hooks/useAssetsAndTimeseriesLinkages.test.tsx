import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAssetsAndTimeseriesLinkages } from '../../../src/query/useAssetsAndTimeseriesLinkages';
import { type CogniteClient, type Asset, type Timeseries } from '@cognite/sdk';
import { fetchLinkFromRelationshipsByTimeseries } from '../../../src/hooks/network/fetchLinkFromRelationshipsByTimeseries';
import { getAssetsByIds } from '../../../src/hooks/network/getAssetsByIds';
import {
  type AssetAndTimeseries,
  type AssetAndTimeseriesIds
} from '../../../src/data-providers/types';
import { useSDK } from '../../../src/components/RevealCanvas/SDKProvider';

const sdk = {
  post: vi.fn().mockResolvedValue({ data: {} }),
  project: 'project'
} as unknown as CogniteClient;

const mockTimeseries: Timeseries[] = [
  {
    id: 1,
    externalId: 'timeseries-1',
    assetId: 1,
    isString: false,
    isStep: false,
    description: '',
    lastUpdatedTime: new Date(),
    createdTime: new Date()
  },
  {
    id: 2,
    externalId: 'timeseries-2',
    assetId: 2,
    isString: false,
    isStep: false,
    description: '',
    lastUpdatedTime: new Date(),
    createdTime: new Date()
  }
];

const mockAssetsAndTimeseries: AssetAndTimeseriesIds[] = [
  {
    assetIds: { externalId: 'asset-1' },
    timeseriesIds: { id: 1, externalId: 'timeseries-1' }
  },
  {
    assetIds: { id: 2 },
    timeseriesIds: { id: 2, externalId: 'timeseries-2' }
  }
];

const mockAssets: Asset[] = [
  {
    id: 1,
    externalId: 'asset-1',
    name: 'Asset 1',
    description: '',
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    rootId: 0
  },
  {
    id: 2,
    externalId: 'asset-2',
    name: 'Asset 2',
    description: '',
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    rootId: 0
  }
];

const assetsAndTimeseriesAll: AssetAndTimeseries[] = [
  {
    asset: mockAssets[0],
    timeseries: [mockTimeseries[0]]
  },
  {
    asset: mockAssets[1],
    timeseries: [mockTimeseries[1]]
  }
];

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: any }): any => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

vi.mock('../../../src/hooks/network/fetchLinkFromRelationshipsByTimeseries');
vi.mock('../../../src/hooks/network/getAssetsByIds');
vi.mock('../../../src/components/RevealCanvas/SDKProvider');

vi.mocked(fetchLinkFromRelationshipsByTimeseries).mockResolvedValue(mockAssetsAndTimeseries);
vi.mocked(getAssetsByIds).mockResolvedValue(mockAssets);
vi.mocked(useSDK).mockReturnValue(sdk);

describe('useAssetsAndTimeseriesLinkages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should return assets with related time series data when the input is time series', async () => {
    const { result } = renderHook(() => useAssetsAndTimeseriesLinkages(mockTimeseries), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(assetsAndTimeseriesAll);
    });
  });

  it('should return undefined when the input is empty', async () => {
    const { result } = renderHook(() => useAssetsAndTimeseriesLinkages([]), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(undefined);
    });
  });
});
