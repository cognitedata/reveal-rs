import { CogniteClient } from '@cognite/sdk';
import { QueryClient, QueryKey } from '@tanstack/react-query';
import { PropertyAggregate, PropertyAggregateResponse } from 'common/types';

import { TS_BASE_QUERY_KEY } from '.';

export const getPropertiesAggregateKey = (): QueryKey => [
  ...TS_BASE_QUERY_KEY,
  'properties-aggregate',
];

/**
 * NOTE: metadata aggreates are always downcased since metadata filters are case-insensitive.
 */
const getPropertiesAggregate = async (sdk: CogniteClient) => {
  const topLevelProperties: PropertyAggregate[] = [
    { values: [{ property: ['name'] }] },
    { values: [{ property: ['description'] }] },
    { values: [{ property: ['unit'] }] },
  ];
  return sdk
    .post<PropertyAggregateResponse>(
      `/api/v1/projects/${sdk.project}/timeseries/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: { aggregate: 'uniqueProperties', path: ['metadata'] },
      }
    )
    .then((r) => {
      if (r.status === 200) {
        return [...topLevelProperties, ...r.data.items];
      } else {
        return Promise.reject(r);
      }
    });
};

export const fetchProperties = async (sdk: CogniteClient, qc: QueryClient) => {
  return qc.fetchQuery(getPropertiesAggregateKey(), () =>
    getPropertiesAggregate(sdk)
  );
};
