/*!
 * Copyright 2023 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { type DmsUniqueIdentifier } from '../data-providers/FdmSDK';
import { zipWith } from 'lodash';
import { useFdm3dDataProvider } from '../components/CacheProvider/CacheProvider';
import { type FdmInstanceWithView } from '../utilities/instanceIds';

export function use3dRelatedEdgeConnections(
  fdmId: DmsUniqueIdentifier | undefined
): UseQueryResult<FdmInstanceWithView[]> {
  const fdmSdk = useFdmSdk();
  const fdmDataProvider = useFdm3dDataProvider();

  return useQuery({
    queryKey: [
      'reveal-react-components',
      'get-3d-related-edge-connections',
      fdmId?.externalId,
      fdmId?.space
    ],
    queryFn: async () => {
      if (fdmId === undefined) {
        return [];
      }

      const relatedInstances = await fdmDataProvider.getEdgeConnected3dInstances(fdmId);

      if (relatedInstances.length === 0) {
        return [];
      }

      const views = await fdmSdk.inspectInstances({
        inspectionOperations: { involvedViews: {} },
        items: relatedInstances.map((instance) => ({
          externalId: instance.externalId,
          space: instance.space,
          instanceType: 'node'
        }))
      });

      return zipWith(relatedInstances, views.items, (node, view) => ({
        ...node,
        view: view.inspectionResults.involvedViews[0]
      }));
    },
    enabled: fdmId !== undefined
  });
}
