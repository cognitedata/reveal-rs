/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type Timeseries, type IdEither } from '@cognite/sdk';

import { getTimeseriesByIds } from '../hooks/network/getTimeseriesByIds';
import { queryKeys } from '../utilities/queryKeys';
import { useSDK } from '../components/RevealCanvas/SDKProvider';

export const useTimeseriesByIdsQuery = (ids: IdEither[]): UseQueryResult<Timeseries[]> => {
  const sdk = useSDK();
  return useQuery(queryKeys.timeseriesById(ids), async () => await getTimeseriesByIds(sdk, ids));
};
