import { useSDK } from '@cognite/sdk-provider';
import { DocumentsAggregateAllUniqueValuesRequest } from '@cognite/sdk/dist/src';
import { queryKeys } from '@data-exploration-components/domain/queryKeys';
import { InternalDocumentFilter } from '@data-exploration-components/domain/documents';
import isEmpty from 'lodash/isEmpty';
import { useQuery } from 'react-query';
import { getDocumentAggregates } from '../../network/getDocumentAggregates';
import { useMemo } from 'react';
import { mapFiltersToDocumentSearchFilters } from '@data-exploration-components/domain/documents';
import { EMPTY_OBJECT } from '@data-exploration-components/utils';

export const useDocumentFilteredAggregates = (
  aggregates: DocumentsAggregateAllUniqueValuesRequest['properties'],
  filters: InternalDocumentFilter = EMPTY_OBJECT,
  query?: string
) => {
  const sdk = useSDK();

  const transformFilter = useMemo(
    () => mapFiltersToDocumentSearchFilters(filters, query),
    [filters, query]
  );
  return useQuery(
    queryKeys.documentsFilteredAggregates(filters, aggregates),
    () => {
      return getDocumentAggregates(
        {
          properties: aggregates,
          limit: 10000,
          filter: transformFilter as any,
          ...(query ? { search: { query } } : {}),
        },
        sdk
      );
    },
    {
      enabled: !isEmpty(aggregates),
    }
  );
};
