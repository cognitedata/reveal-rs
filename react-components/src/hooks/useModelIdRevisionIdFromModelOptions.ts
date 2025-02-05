/*!
 * Copyright 2024 Cognite AS
 */

import { useQueries, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { getModelIdAndRevisionIdFromExternalId } from './network/getModelIdAndRevisionIdFromExternalId';
import { queryKeys } from '../utilities/queryKeys';
import {
  type ClassicDataSourceType,
  type AddModelOptions,
  type DataSourceType
} from '@cognite/reveal';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { isClassicIdentifier, isDM3DModelIdentifier } from '../components';
import { type FdmSDK } from '../data-providers/FdmSDK';
import { EMPTY_ARRAY } from '../utilities/constants';
import { getModelKeys } from '../utilities/getModelKeys';

export const useModelIdRevisionIdFromModelOptions = (
  addModelOptionsArray: Array<AddModelOptions<DataSourceType>> | undefined
): Array<UseQueryResult<AddModelOptions<ClassicDataSourceType>>> => {
  const fdmSdk = useFdmSdk();

  return useQueries({
    queries:
      addModelOptionsArray?.map((addModelOptions) => createQueryConfig(addModelOptions, fdmSdk)) ??
      EMPTY_ARRAY
  });
};

const createQueryConfig = (
  addModelOptions: AddModelOptions<DataSourceType>,
  fdmSdk: FdmSDK
): UseQueryOptions<AddModelOptions<ClassicDataSourceType>> => {
  const modelKeys = getModelKeys([addModelOptions]);
  if (isClassicIdentifier(addModelOptions)) {
    return {
      queryKey: [queryKeys.modelRevisionId(modelKeys)],
      queryFn: async () => await Promise.resolve(addModelOptions),
      staleTime: Infinity
    };
  }

  if (isDM3DModelIdentifier(addModelOptions)) {
    return {
      queryKey: [queryKeys.modelRevisionId(modelKeys)],
      queryFn: async () => {
        const { modelId, revisionId } = await getModelIdAndRevisionIdFromExternalId(
          addModelOptions.revisionExternalId,
          addModelOptions.revisionSpace,
          fdmSdk
        );
        return {
          ...addModelOptions,
          modelId,
          revisionId
        };
      },
      staleTime: Infinity
    };
  }

  return {
    queryKey: [queryKeys.modelRevisionId(modelKeys)],
    queryFn: async () => await Promise.reject(new Error('Unknown identifier type')),
    staleTime: Infinity
  };
};
