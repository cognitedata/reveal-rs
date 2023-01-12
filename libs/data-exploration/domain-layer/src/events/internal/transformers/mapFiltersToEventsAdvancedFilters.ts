import { isNumeric } from '@data-exploration-lib/core';
import {
  AdvancedFilter,
  AdvancedFilterBuilder,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import { InternalEventsFilters } from '../types';
import isArray from 'lodash/isArray';

export type EventsProperties = {
  assetIds: number[];
  dataSetId: number[];
  type: string | string[];
  subtype: string | string[];
  source: string[];
  externalId: string;
  description: string;
  id: number[];
  [key: `metadata|${string}`]: string;
};

export const mapFiltersToEventsAdvancedFilters = (
  {
    dataSetIds,
    createdTime,
    lastUpdatedTime,
    externalIdPrefix,
    type,
    startTime,
    endTime,
    subtype,
    source,
    metadata,
    internalId,
  }: InternalEventsFilters,
  // searchQueryMetadataKeys?: Record<string, string>,
  query?: string
): AdvancedFilter<EventsProperties> | undefined => {
  const builder = new AdvancedFilterBuilder<EventsProperties>();

  const filterBuilder = new AdvancedFilterBuilder<EventsProperties>()
    .in('dataSetId', () => {
      return dataSetIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
    })
    .in('type', () => {
      // this condition need to be removed when remove the legacy implementation
      if (type && !isArray(type)) {
        return [type];
      }
      return type;
    })
    .in('subtype', () => {
      // this condition need to be removed when remove the legacy implementation
      if (subtype && !isArray(subtype)) {
        return [subtype];
      }
      return subtype;
    })
    .in('source', () => {
      if (source) {
        return [source];
      }
      return undefined;
    })
    .in('id', () => {
      if (internalId) {
        return [internalId];
      }
      return undefined;
    })
    .prefix('externalId', externalIdPrefix)
    .range('createdTime', {
      lte: createdTime?.max as number,
      gte: createdTime?.min as number,
    })
    .range('lastUpdatedTime', {
      lte: lastUpdatedTime?.max as number,
      gte: lastUpdatedTime?.min as number,
    })
    .range('startTime', {
      lte: startTime?.max as number,
      gte: startTime?.min as number,
    })
    .range('endTime', {
      lte:
        endTime && !('isNull' in endTime)
          ? (endTime?.max as number)
          : undefined,
      gte:
        endTime && !('isNull' in endTime)
          ? (endTime?.min as number)
          : undefined,
    });

  if (metadata) {
    for (const { key, value } of metadata) {
      filterBuilder.equals(`metadata|${key}`, value);
    }
  }

  builder.and(filterBuilder);

  if (query) {
    const searchQueryBuilder =
      new AdvancedFilterBuilder<EventsProperties>().search(
        'description',
        isEmpty(query) ? undefined : query
      );

    /**
     * We want to filter all the metadata keys with the search query, to give a better result
     * to the user when using our search.
     */
    // if (searchQueryMetadataKeys) {
    //   for (const [key, value] of Object.entries(searchQueryMetadataKeys)) {
    //     searchQueryBuilder.prefix(`metadata|${key}`, value);
    //   }
    // }

    searchQueryBuilder.in('id', () => {
      if (query && isNumeric(query)) {
        return [Number(query)];
      }
      return undefined;
    });
    searchQueryBuilder.prefix('externalId', query);

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<EventsProperties>().and(builder).build();
};
