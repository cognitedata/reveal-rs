import { useSDK } from '@cognite/sdk-provider';
import { CogniteError } from '@cognite/sdk';
import {
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { PropertyAggregate } from 'common/types';

import { fetchProperties as fetchTSProperties } from './timeseries';
import { fetchProperties as fetchEventProperties } from './events';
import { fetchProperties as fetchAssetProperties } from './assets';
import { Filter, SourceType, TargetType } from 'types/api';

type T = SourceType | TargetType;

const AGGREGATE_BASE_KEY = ['aggregate'];

export const aggregatePropertyQueryKey = (t: T): QueryKey => [
  ...AGGREGATE_BASE_KEY,
  t,
  'properties',
];

export const useAggregateProperties = (
  t: T,
  options?: UseQueryOptions<PropertyAggregate[], CogniteError>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useQuery(
    aggregatePropertyQueryKey(t),
    () => {
      switch (t) {
        case 'timeseries': {
          return fetchTSProperties(sdk, queryClient);
        }
        case 'assets': {
          return fetchAssetProperties(sdk, queryClient);
        }
        case 'events':
          return fetchEventProperties(sdk, queryClient);
        default: {
          return Promise.reject(`type: ${t} not implemented`);
        }
      }
    },
    options
  );
};

type AggregateParams = {
  type: T;
  filter: Filter;
  advancedFilter?: any;
};
const aggregateQueryKey = ({
  type,
  filter,
  advancedFilter,
}: AggregateParams): QueryKey => [
  ...AGGREGATE_BASE_KEY,
  type,
  filter,
  advancedFilter,
];

export const useAggregate = (
  params: AggregateParams,
  options?: UseQueryOptions<number | undefined, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    aggregateQueryKey(params),
    () => {
      return sdk
        .post<{ items: { count: number }[] }>(
          `/api/v1/projects/${sdk.project}/${params.type}/aggregate`,
          {
            headers: {
              'cdf-version': 'alpha',
            },
            data: {
              filter: params.filter,
              advancedFilter: params.advancedFilter,
            },
          }
        )
        .then((r) => {
          if (r.status === 200) {
            return r.data.items[0]?.count;
          } else {
            return Promise.reject(r);
          }
        });
    },
    options
  );
};
