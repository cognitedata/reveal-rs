import { FileInfo } from '@cognite/sdk/dist/src';

import { DataModel, Instance } from './types';

export const queryKeys = {
  all: ['fdx'] as const,

  listDataModels: () => [...queryKeys.all, 'dataModels', 'list'] as const,
  dataModelTypes: (dataModel?: DataModel) =>
    [...queryKeys.all, 'dataModels', 'types', dataModel] as const,

  searchDataTypes: (
    query: string,
    filter: Record<string, unknown>,
    dataModel?: DataModel
  ) =>
    [
      ...queryKeys.all,
      'dataTypes',
      'search',
      query,
      filter,
      dataModel,
    ] as const,

  instance: (instance: Instance, dataModel?: DataModel) =>
    [...queryKeys.all, 'instance', instance, dataModel] as const,

  searchFiles: (query: string, limit?: number) => [
    ...queryKeys.all,
    'files',
    'search',
    query,
    limit,
  ],

  fileContainer: (file?: FileInfo) => [...queryKeys.all, 'file', file] as const,
};
