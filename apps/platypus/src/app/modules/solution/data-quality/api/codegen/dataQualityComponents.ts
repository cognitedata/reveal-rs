/**
 * Generated by @openapi-codegen
 *
 * @version v1 alpha
 */
import * as reactQuery from '@tanstack/react-query';

import {
  useDataQualityContext,
  DataQualityContext,
} from './dataQualityContext';
import type * as Fetcher from './dataQualityFetcher';
import { dataQualityFetch } from './dataQualityFetcher';
import type * as Responses from './dataQualityResponses';
import type * as Schemas from './dataQualitySchemas';

export type CreateDataSourcesPathParams = {
  /**
   * The project name.
   *
   * @example publicdata
   */
  project?: string;
};

export type CreateDataSourcesError = Fetcher.ErrorWrapper<
  | {
      status: 400;
      payload: Responses.ErrorResponse;
    }
  | {
      status: 409;
      payload: Schemas.UpsertConflict;
    }
>;

export type CreateDataSourcesVariables = {
  body: Schemas.DataSourceCreateRequest;
  pathParams?: CreateDataSourcesPathParams;
} & DataQualityContext['fetcherOptions'];

/**
 * Add or update (upsert) data sources.
 */
export const fetchCreateDataSources = (
  variables: CreateDataSourcesVariables,
  signal?: AbortSignal
) =>
  dataQualityFetch<
    Responses.DataSourceCollectionResponse,
    CreateDataSourcesError,
    Schemas.DataSourceCreateRequest,
    {},
    {},
    CreateDataSourcesPathParams
  >({
    url: '/api/v1/projects/{project}/data-validation/datasources',
    method: 'post',
    ...variables,
    signal,
  });

/**
 * Add or update (upsert) data sources.
 */
export const useCreateDataSources = (
  options?: Omit<
    reactQuery.UseMutationOptions<
      Responses.DataSourceCollectionResponse,
      CreateDataSourcesError,
      CreateDataSourcesVariables
    >,
    'mutationFn'
  >
) => {
  const { fetcherOptions } = useDataQualityContext();
  return reactQuery.useMutation<
    Responses.DataSourceCollectionResponse,
    CreateDataSourcesError,
    CreateDataSourcesVariables
  >(
    (variables: CreateDataSourcesVariables) =>
      fetchCreateDataSources({ ...fetcherOptions, ...variables }),
    options
  );
};

export type ListDataSourcesPathParams = {
  /**
   * The project name.
   *
   * @example publicdata
   */
  project?: string;
};

export type ListDataSourcesQueryParams = {
  /**
   * Cursor for paging through results.
   *
   * @example 4zj0Vy2fo0NtNMb229mI9r1V3YG5NBL752kQz1cKtwo
   */
  cursor?: string;
};

export type ListDataSourcesError = Fetcher.ErrorWrapper<{
  status: 400;
  payload: Responses.ErrorResponse;
}>;

export type ListDataSourcesVariables = {
  pathParams?: ListDataSourcesPathParams;
  queryParams?: ListDataSourcesQueryParams;
} & DataQualityContext['fetcherOptions'];

/**
 * List data sources defined in the current project.
 */
export const fetchListDataSources = (
  variables: ListDataSourcesVariables,
  signal?: AbortSignal
) =>
  dataQualityFetch<
    Responses.DataSourceCollectionResponseWithCursor,
    ListDataSourcesError,
    undefined,
    {},
    ListDataSourcesQueryParams,
    ListDataSourcesPathParams
  >({
    url: '/api/v1/projects/{project}/data-validation/datasources',
    method: 'get',
    ...variables,
    signal,
  });

/**
 * List data sources defined in the current project.
 */
export const useListDataSources = <
  TData = Responses.DataSourceCollectionResponseWithCursor
>(
  variables: ListDataSourcesVariables,
  options?: Omit<
    reactQuery.UseQueryOptions<
      Responses.DataSourceCollectionResponseWithCursor,
      ListDataSourcesError,
      TData
    >,
    'queryKey' | 'queryFn'
  >
) => {
  const { fetcherOptions, queryOptions, queryKeyFn } =
    useDataQualityContext(options);
  return reactQuery.useQuery<
    Responses.DataSourceCollectionResponseWithCursor,
    ListDataSourcesError,
    TData
  >(
    queryKeyFn({
      path: '/api/v1/projects/{project}/data-validation/datasources',
      operationId: 'listDataSources',
      variables,
    }),
    ({ signal }) =>
      fetchListDataSources({ ...fetcherOptions, ...variables }, signal),
    {
      ...options,
      ...queryOptions,
    }
  );
};

export type ListByIdsDataSourcesPathParams = {
  /**
   * The project name.
   *
   * @example publicdata
   */
  project?: string;
};

export type ListByIdsDataSourcesError = Fetcher.ErrorWrapper<{
  status: 400;
  payload: Responses.ErrorResponse;
}>;

export type ListByIdsDataSourcesVariables = {
  body: Schemas.ListOfDataSourceIdsRequest;
  pathParams?: ListByIdsDataSourcesPathParams;
} & DataQualityContext['fetcherOptions'];

/**
 * Retrieve up to 100 data sources by specifying their ids.
 */
export const fetchListByIdsDataSources = (
  variables: ListByIdsDataSourcesVariables,
  signal?: AbortSignal
) =>
  dataQualityFetch<
    Responses.DataSourceCollectionResponse,
    ListByIdsDataSourcesError,
    Schemas.ListOfDataSourceIdsRequest,
    {},
    {},
    ListByIdsDataSourcesPathParams
  >({
    url: '/api/v1/projects/{project}/data-validation/datasources/byids',
    method: 'post',
    ...variables,
    signal,
  });

/**
 * Retrieve up to 100 data sources by specifying their ids.
 */
export const useListByIdsDataSources = (
  options?: Omit<
    reactQuery.UseMutationOptions<
      Responses.DataSourceCollectionResponse,
      ListByIdsDataSourcesError,
      ListByIdsDataSourcesVariables
    >,
    'mutationFn'
  >
) => {
  const { fetcherOptions } = useDataQualityContext();
  return reactQuery.useMutation<
    Responses.DataSourceCollectionResponse,
    ListByIdsDataSourcesError,
    ListByIdsDataSourcesVariables
  >(
    (variables: ListByIdsDataSourcesVariables) =>
      fetchListByIdsDataSources({ ...fetcherOptions, ...variables }),
    options
  );
};

export type DeleteDataSourcesPathParams = {
  /**
   * The project name.
   *
   * @example publicdata
   */
  project?: string;
};

export type DeleteDataSourcesError = Fetcher.ErrorWrapper<{
  status: 400;
  payload: Responses.ErrorResponse;
}>;

export type DeleteDataSourcesVariables = {
  body: Schemas.ListOfDataSourceIdsRequest;
  pathParams?: DeleteDataSourcesPathParams;
} & DataQualityContext['fetcherOptions'];

/**
 * Delete one or more data sources
 */
export const fetchDeleteDataSources = (
  variables: DeleteDataSourcesVariables,
  signal?: AbortSignal
) =>
  dataQualityFetch<
    Responses.ListOfDataSourceIdsResponse,
    DeleteDataSourcesError,
    Schemas.ListOfDataSourceIdsRequest,
    {},
    {},
    DeleteDataSourcesPathParams
  >({
    url: '/api/v1/projects/{project}/data-validation/datasources/delete',
    method: 'post',
    ...variables,
    signal,
  });

/**
 * Delete one or more data sources
 */
export const useDeleteDataSources = (
  options?: Omit<
    reactQuery.UseMutationOptions<
      Responses.ListOfDataSourceIdsResponse,
      DeleteDataSourcesError,
      DeleteDataSourcesVariables
    >,
    'mutationFn'
  >
) => {
  const { fetcherOptions } = useDataQualityContext();
  return reactQuery.useMutation<
    Responses.ListOfDataSourceIdsResponse,
    DeleteDataSourcesError,
    DeleteDataSourcesVariables
  >(
    (variables: DeleteDataSourcesVariables) =>
      fetchDeleteDataSources({ ...fetcherOptions, ...variables }),
    options
  );
};

export type QueryOperation = {
  path: '/api/v1/projects/{project}/data-validation/datasources';
  operationId: 'listDataSources';
  variables: ListDataSourcesVariables;
};
