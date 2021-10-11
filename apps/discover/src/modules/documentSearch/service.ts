import merge from 'lodash/merge';

import { reportException } from '@cognite/react-errors';
import { DocumentsFilter, DocumentsSearch } from '@cognite/sdk-playground';

import { getCogniteSDKClient } from '_helpers/getCogniteSDKClient';
import { showErrorMessage } from 'components/toast';
import { aggregates } from 'modules/documentSearch/constants';
import {
  SearchQueryFull,
  DocumentResult,
  AggregateNames,
} from 'modules/documentSearch/types';
import { toDocument } from 'modules/documentSearch/utils';

import { getDocumentSDKClient } from './sdk';
import { processFacets } from './utils/processFacets';
import { getSearchQuery } from './utils/queryUtil';
import { toDocuments } from './utils/toDocuments';

const doSearch = (
  searchQuery: DocumentsSearch,
  filter: DocumentsFilter = {},
  sort: string[] = [],
  limit = 100
) => {
  return getDocumentSDKClient().documents.search({
    limit,
    sort: sort.length > 0 ? sort : undefined,
    filter,
    search: searchQuery,
    aggregates,
  });
};

// get the data we need to put into the typeahead dropdown
const getTypeahead = (query: SearchQueryFull) => {
  const queryInfo = getSearchQuery(query);
  return doSearch(queryInfo.query, {}, [], 10).then(toDocuments);
};

export const getLabels = () => {
  return getCogniteSDKClient().labels.list({
    filter: {},
  });
};

export const getDocument = (query: string, documentId: string) => {
  return doSearch(
    { query, highlight: true },
    {
      id: {
        equals: Number(documentId),
      },
    },
    [],
    1
  ).then((response) => toDocument(response.items[0]));
};

const search = (
  query: SearchQueryFull,
  options: { filters?: Record<string, unknown>; sort: string[] },
  limit?: number
): Promise<DocumentResult> => {
  const queryInfo = getSearchQuery(query);
  return doSearch(
    queryInfo.query,
    merge(queryInfo.filter, options.filters),
    options.sort,
    limit
  )
    .then((result): DocumentResult => {
      return {
        count: result.items.length,
        hits: toDocuments(result),
        facets: processFacets(result),
        aggregates: result.aggregates,
      };
    })
    .catch((error) => {
      if (error.status === 400 && error.extra && error.extra.validationError) {
        const validations = error.extra.validationError;

        Object.keys(validations).forEach((key) => {
          showErrorMessage(validations[key]);
        });
      } else {
        showErrorMessage('There has been a service error, please try again');
      }

      reportException(error);

      return {
        count: 0,
        hits: [],
        facets: processFacets({
          items: [],
          aggregates: [],
        }),
      };
    });
};

const documentsByIds = (documentIds: number[]) => {
  return getDocumentSDKClient().documents.search({
    filter: {
      id: {
        in: documentIds,
      },
    },
  });
};

const getCategoriesByAssetIds = (assetIds: number[]) =>
  getDocumentSDKClient()
    .documents.search({
      limit: 0,
      filter: {
        assetIds: {
          containsAny: assetIds,
        },
      },
      aggregates,
    })
    .then((result) => processFacets(result));

const getCategoriesByQuery = (
  query: SearchQueryFull,
  filters: DocumentsFilter,
  category: AggregateNames
) => {
  const queryInfo = getSearchQuery(query);
  return getDocumentSDKClient()
    .documents.search({
      limit: 0,
      search: queryInfo.query,
      filter: merge(queryInfo.filter, filters),
      aggregates: aggregates.filter((aggregate) => aggregate.name === category),
    })
    .then((result) => ({
      facets: processFacets(result)[category],
      total: result.aggregates ? result.aggregates[0].total : 0,
    }));
};

export const documentSearchService = {
  search,
  getTypeahead,
  documentsByIds,
  getCategoriesByAssetIds,
  getCategoriesByQuery,
};
