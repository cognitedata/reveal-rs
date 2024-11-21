/*!
 * Copyright 2024 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type CadPointCloudModelWithModelIdRevisionId } from '../../components/Reveal3DResources/types';
import {
  type COGNITE_ASSET_SOURCE,
  type COGNITE_POINT_CLOUD_VOLUME_SOURCE
} from '../../data-providers/core-dm-provider/dataModels';
import { useFdmSdk } from '../../components/RevealCanvas/SDKProvider';
import {
  getDMSModelsForIds,
  getDMSRevisionsForRevisionIdsAndModelRefs
} from '../../data-providers/utils/getDMSModelRevisionRefs';
import {
  type AssetProperties,
  type PointCloudVolumeObject3DProperties
} from '../../data-providers/utils/filters';
import { type PointCloudVolumeWithAsset } from '../../components/CacheProvider/types';
import { type FdmSDK } from '../../data-providers/FdmSDK';
import { type DMVolumeModelDataResult } from '../../components/Reveal3DResources/useCalculatePointCloudStyling';
import { pointCloudDMVolumesQuery } from './pointCloudDMVolumesQuery';
import { queryKeys } from '../../utilities/queryKeys';

export const usePointCloudDMVolume = (
  modelsData: CadPointCloudModelWithModelIdRevisionId[]
): UseQueryResult<DMVolumeModelDataResult[]> => {
  const fdmSdk = useFdmSdk();
  return useQuery({
    queryKey: [
      queryKeys.pointCloudDMVolumeMappings(),
      ...modelsData.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    queryFn: async () => {
      return await Promise.all(
        modelsData.map(async (model) => {
          const pointCloudDMVolumeWithAsset = await getPointCloudDMVolumesForModel(
            model.modelId,
            model.revisionId,
            fdmSdk
          );
          return {
            model: model.modelOptions,
            pointCloudDMVolumeWithAsset
          };
        })
      );
    },
    staleTime: Infinity,
    enabled: modelsData.length > 0
  });
};

const getPointCloudDMVolumesForModel = async (
  modelId: number,
  revisionId: number,
  fdmSdk: FdmSDK
): Promise<PointCloudVolumeWithAsset[]> => {
  const modelRef = await getDMSModelsForIds([modelId], fdmSdk);
  const revisionRef = await getDMSRevisionsForRevisionIdsAndModelRefs(
    modelRef,
    [revisionId],
    fdmSdk
  );
  const query = pointCloudDMVolumesQuery(revisionRef);

  const response = await fdmSdk.queryNodesAndEdges<
    typeof query,
    [
      {
        source: typeof COGNITE_POINT_CLOUD_VOLUME_SOURCE;
        properties: PointCloudVolumeObject3DProperties;
      },
      {
        source: typeof COGNITE_ASSET_SOURCE;
        properties: AssetProperties;
      }
    ]
  >(query);

  const pointCloudVolumes = response.items.pointCloudVolumes.map((pointCloudVolume) => {
    const pointCloudVolumeProperties = pointCloudVolume.properties.cdf_cdm[
      'CognitePointCloudVolume/v1'
    ] as PointCloudVolumeObject3DProperties;

    const revisionIndex = pointCloudVolumeProperties.revisions.indexOf(revisionRef[0]);

    return {
      externalId: pointCloudVolume.externalId,
      space: pointCloudVolume.space,
      volumeReference: pointCloudVolumeProperties.volumeReferences.at(revisionIndex) ?? 'unknown',
      object3D: pointCloudVolumeProperties.object3D,
      volumeType: pointCloudVolumeProperties.volumeType,
      volume: pointCloudVolumeProperties.volume
    };
  });

  const assets = response.items.assets.map((asset) => {
    const assetProperties = asset.properties.cdf_cdm['CogniteAsset/v1'] as AssetProperties;
    return {
      externalId: asset.externalId,
      space: asset.space,
      object3D: assetProperties.object3D,
      name: assetProperties.name,
      description: assetProperties.description
    };
  });

  const pointCloudVolumesWithAssets = pointCloudVolumes.map((pointCloudVolume) => {
    const asset = assets.find((asset) => {
      const assetObject3D = asset.object3D;
      return (
        assetObject3D.space === pointCloudVolume.object3D.space &&
        assetObject3D.externalId === pointCloudVolume.object3D.externalId
      );
    });

    return {
      ...pointCloudVolume,
      asset
    };
  });
  return pointCloudVolumesWithAssets;
};
