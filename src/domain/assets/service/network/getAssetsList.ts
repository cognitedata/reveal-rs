import { Asset, CogniteClient, CursorResponse } from '@cognite/sdk';
import { InternalSortBy } from 'domain/types';
import { normalizeAssets } from '../transformers/normalize';

export const getAssetsList = (
  sdk: CogniteClient,
  {
    advancedFilter,
    cursor,
    limit,
    filter,
    sort,
  }: {
    advancedFilter?: any;
    cursor?: string;
    limit?: number;
    filter?: Record<string, any>;
    sort?: InternalSortBy[];
  }
) => {
  return sdk
    .post<CursorResponse<Asset[]>>(
      `/api/v1/projects/${sdk.project}/assets/list`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          limit: limit ?? 1000,
          cursor,
          advancedFilter,
          filter,
          sort,
        },
      }
    )
    .then(({ data }) => {
      return {
        items: normalizeAssets(data.items),
        nextCursor: data.nextCursor,
      };
    });
};
