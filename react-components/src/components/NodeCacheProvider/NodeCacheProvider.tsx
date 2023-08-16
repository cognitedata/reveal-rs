/*!
 * Copyright 2023 Cognite AS
 */

import { ReactElement, ReactNode, createContext, useContext, useMemo } from 'react';
import { FdmNodeCache } from './NodeCache';
import { ModelRevisionToEdgeMap } from '../../hooks/useMappedEquipmentBy3DModelsList';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk, useSDK } from '../RevealContainer/SDKProvider';
import { Fdm3dNodeData } from './RevisionNodeCache';

export type FdmNodeCacheContent = {
  cache: FdmNodeCache;
};

export const FdmNodeCacheContext = createContext<FdmNodeCacheContent | undefined>(undefined);

export const useGetAllExternalIds = (
  modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
  enabled: boolean): UseQueryResult<ModelRevisionToEdgeMap> => {
  const content = useContext(FdmNodeCacheContext);

  if (content === undefined) {
    throw Error('Must use useNodeCache inside a NodeCacheContext');
  }

  return useQuery(
    [
      'reveal',
      'react-components',
      ...modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId.toString()).sort()
    ],
    async () => await content.cache.getAllMappingExternalIds(modelRevisionIds),
    { staleTime: Infinity, enabled: enabled && modelRevisionIds.length > 0 }
  );
};

export const useFdm3dNodeData = (
  modelId: number | undefined,
  revisionId: number | undefined,
  treeIndex: number | undefined
): UseQueryResult<Fdm3dNodeData[]> => {
  const content = useContext(FdmNodeCacheContext);

  const result = useQuery(
    [
      'reveal',
      'react-components',
      'tree-index-to-external-id',
      modelId,
      revisionId,
      treeIndex
    ],
    () => content!.cache.getClosestParentExternalId(modelId!, revisionId!, treeIndex!),
    {
      enabled: content !== undefined && modelId !== undefined && revisionId !== undefined && treeIndex !== undefined
    }
  );

  if (content === undefined) {
    throw Error('Must use useNodeCache inside a NodeCacheContext');
  }

  return result;
}

export function NodeCacheProvider({ children }: { children?: ReactNode }): ReactElement {
  const fdmClient = useFdmSdk();
  const cdfClient = useSDK();

  const fdmCache = useMemo(() => new FdmNodeCache(cdfClient, fdmClient)
  , []);


  return <FdmNodeCacheContext.Provider value={{ cache: fdmCache }}>
    {children}
    </FdmNodeCacheContext.Provider>
}
