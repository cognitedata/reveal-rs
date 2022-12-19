import {
  CogniteClient,
  CogniteEvent,
  CursorResponse,
  EventFilter,
} from '@cognite/sdk';
import { EventsProperties } from '@data-exploration-components/domain/events';
import { InternalSortBy } from '@data-exploration-components/domain/types';
import { normalizeEvents } from '../transformers/normalize';
import { AdvancedFilter } from '@data-exploration-components/domain/builders';

export const getEventsList = (
  sdk: CogniteClient,
  {
    filter,
    advancedFilter,
    cursor,
    limit,
    sort,
  }: {
    advancedFilter?: AdvancedFilter<EventsProperties>;
    filter?: EventFilter;
    cursor?: string;
    limit?: number;
    sort?: InternalSortBy[];
  }
) => {
  return sdk
    .post<CursorResponse<CogniteEvent[]>>(
      `/api/v1/projects/${sdk.project}/events/list`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          limit: limit ?? 1000,
          cursor,
          filter,
          advancedFilter,
          sort,
        },
      }
    )
    .then(({ data }) => {
      return {
        items: normalizeEvents(data.items),
        nextCursor: data.nextCursor,
      };
    });
};
