/*!
 * Copyright 2024 Cognite AS
 */
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getCadModelsForAsset } from '../hooks/network/getCadModelsForAsset';
import { getPointCloudModelsForAsset } from '../hooks/network/getPointCloudModelsForAsset';
import { useFdmSdk, useSDK } from '../components/RevealCanvas/SDKProvider';
import { type InternalId, type CogniteClient } from '@cognite/sdk';
import { type TaggedAddResourceOptions } from '../components/Reveal3DResources/types';
import { getImage360CollectionsForAsset } from '../hooks/network/getImage360CollectionsForAsset';

import { uniqBy } from 'lodash';
import { createAddOptionsKey } from '../utilities/createAddOptionsKey';
import { type Fdm3dDataProvider } from '../data-providers/Fdm3dDataProvider';
import { type DmsUniqueIdentifier } from '../data-providers';
import { getPointCloudModelsForAssetInstance } from '../hooks/network/getPointCloudModelsForAssetInstance';
import { type FdmSDK } from '../data-providers/FdmSDK';
import { useFdm3dDataProvider } from '../components/CacheProvider/CacheProvider';
import {
  type InstanceReference,
  isDmsInstance,
  isHybridAssetCoreDmsInstance,
  isInternalId
} from '../utilities/instanceIds';

export const useModelsForInstanceQuery = (
  instance: InstanceReference | undefined
): UseQueryResult<TaggedAddResourceOptions[]> => {
  const cogniteClient = useSDK();
  const fdm3dDataProvider = useFdm3dDataProvider();
  const fdmSdk = useFdmSdk();

  return useQuery({
    queryKey: ['reveal', 'react-components', 'models-for-instance', instance],
    queryFn: async () => {
      if (instance === undefined) {
        return undefined;
      }

      if (isInternalId(instance)) {
        return await getModelsForAssetInstance(instance, cogniteClient);
      }

      if (isDmsInstance(instance)) {
        return await getModelsForDmsInstance(instance, fdmSdk, fdm3dDataProvider);
      }

      if (isHybridAssetCoreDmsInstance(instance)) {
        return await getModelsForDmsInstance(instance.assetInstanceId, fdmSdk, fdm3dDataProvider);
      }

      throw Error(
        `Can not fetch models for instance: ${JSON.stringify(instance)}. InternalId or DMS ID required`
      );
    },
    enabled: instance !== undefined
  });
};

async function getModelsForAssetInstance(
  instance: InternalId,
  cogniteClient: CogniteClient
): Promise<TaggedAddResourceOptions[]> {
  const cadModelsPromise = getCadModelsForAsset(instance.id, cogniteClient);
  const pointCloudModelsPromise = getPointCloudModelsForAsset(instance.id, cogniteClient);
  const image360CollectionsPromise = getImage360CollectionsForAsset(instance.id, cogniteClient);

  const results = (
    await Promise.all([cadModelsPromise, pointCloudModelsPromise, image360CollectionsPromise])
  ).flat();

  return uniqBy(results, createAddOptionsKey);
}

async function getModelsForDmsInstance(
  instance: DmsUniqueIdentifier,
  fdmSdk: FdmSDK,
  fdm3dDataProvider: Fdm3dDataProvider
): Promise<TaggedAddResourceOptions[]> {
  const cadModelsPromise = fdm3dDataProvider.getCadModelsForInstance(instance);
  const pointCloudModelsPromise = getPointCloudModelsForAssetInstance(instance, fdmSdk);

  const results = (await Promise.all([cadModelsPromise, pointCloudModelsPromise])).flat();

  return uniqBy(results, createAddOptionsKey);
}
