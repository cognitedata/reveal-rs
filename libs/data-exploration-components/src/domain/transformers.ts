import { isArray, isEmpty, take } from 'lodash';
import { isObjectEmpty } from '@data-exploration-components/utils';
import { InternalAssetData } from './assets';
import { MAX_METADATA_KEYS } from './constants';
import { InternalEventsData } from './events';

/**
 * Tech debt: Remove me once api is shifted over to latest
 */
export const transformNewFilterToOldFilter = <T>(
  filter?: any
): T | undefined => {
  if (filter === undefined) {
    return {} as T;
  }

  if (filter.internalId) {
    filter = {
      ...filter,
      internalId: undefined,
    };
  }

  if (filter.metadata && isArray(filter.metadata)) {
    filter = {
      ...filter,
      metadata: (filter.metadata as { key: string; value: string }[]).reduce(
        (accumulator, { key, value }) => {
          return {
            ...accumulator,
            [key]: value,
          };
        },
        {} as Record<string, unknown>
      ),
    };
  }

  // TODO: Remove this when migrated
  if (filter.assetSubtreeIds) {
    filter = {
      ...filter,
      assetSubtreeIds: filter?.assetSubtreeIds?.map(({ value }: any) => ({
        id: value,
      })) as any,
    };
  }

  if (filter.dataSetIds) {
    filter = {
      ...filter,
      dataSetIds: filter?.dataSetIds?.map(({ value }: any) => ({
        id: value,
      })) as any,
    };
  }

  if (filter.labels) {
    filter = {
      ...filter,
      labels: {
        containsAny: filter?.labels?.map(({ value }: any) => ({
          externalId: value,
        })),
      },
    };
  }

  return filter as T;
};

type ResourceTypeData = InternalEventsData | InternalAssetData;

export const mapMetadataKeysWithQuery = (
  data: ResourceTypeData[],
  query?: string
): Record<string, string> | undefined => {
  if (query === undefined || query === '') {
    return undefined;
  }

  const getUniqueMetadataKeysFromData = (data: ResourceTypeData[]) => {
    const metadataKeysSet = new Set<string>();

    for (const { metadata } of data) {
      if (isObjectEmpty(metadata)) {
        continue;
      }

      const keys = Object.keys(metadata);
      keys.forEach((key) => metadataKeysSet.add(key));
    }

    return [...metadataKeysSet];
  };

  const mergeMetadataKeysWithQuery = (
    query: string,
    metadataKeys: string[]
  ) => {
    if (isEmpty(metadataKeys)) {
      return undefined;
    }

    return metadataKeys.reduce((accumulator, key) => {
      return {
        ...accumulator,
        [key]: query,
      };
    }, {});
  };

  const metadataKeys = take(
    getUniqueMetadataKeysFromData(data),
    MAX_METADATA_KEYS
  );

  return mergeMetadataKeysWithQuery(query, metadataKeys);
};
