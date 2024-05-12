/*!
 * Copyright 2024 Cognite AS
 */
import { type IdEither } from '@cognite/sdk/';

export const queryKeys = {
  all: ['cdf'] as const,
  // ASSETS
  assetsById: (ids: IdEither[]) => [...assets(), ids] as const,
  // TIMESERIES
  timeseriesById: (ids: IdEither[]) => [...timeseries(), ids] as const,
  timeseriesLatestDatapoint: () => [...timeseries(), 'latest-datapoints'] as const,
  // TIMESERIES RELATIONSHIPS WITH ASSETS
  timeseriesLinkedToAssets: () =>
    [...queryKeys.all, 'timeseries', 'timeseries-linked-assets'] as const
} as const;

const assets = () => {
  return [...queryKeys.all, 'assets'];
};

const timeseries = () => {
  return [...queryKeys.all, 'timeseries'];
};
