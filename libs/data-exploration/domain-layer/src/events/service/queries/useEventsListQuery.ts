import { useSDK } from '@cognite/sdk-provider';
import { EventFilter } from '@cognite/sdk/dist/src';

import { useMemo } from 'react';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { InternalSortBy } from '../../../types';
import { EventsProperties } from '../../internal';
import { getEventsList } from '../network';

export const useEventsListQuery = (
  {
    filter,
    advancedFilter,
    limit,
    sort,
  }: {
    filter?: EventFilter;
    advancedFilter?: AdvancedFilter<EventsProperties>;
    limit?: number;
    sort?: InternalSortBy[];
  } = {},
  options?: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.listEvents([advancedFilter, filter, limit, sort]),
    ({ pageParam }) => {
      return getEventsList(sdk, {
        cursor: pageParam,
        filter,
        advancedFilter,
        sort,
        limit,
      });
    },
    {
      getNextPageParam: (param) => param.nextCursor,
      ...(options as any),
    }
  );

  const flattenData = useMemo(
    () => (data?.pages || []).flatMap(({ items }) => items),
    [data?.pages]
  );

  return { data: flattenData, ...rest };
};
