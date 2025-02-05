/*!
 * Copyright 2024 Cognite AS
 */

import {
  type TableExpressionLeafFilter,
  type HasExistingDataFilterV3,
  type TableExpressionContainsAnyFilterV3
} from '@cognite/sdk';
import { COGNITE_POINT_CLOUD_VOLUME_SOURCE, CORE_DM_3D_CONTAINER_SPACE } from '../dataModels';
import { type DmsUniqueIdentifier } from '../../FdmSDK';

export type AssetProperties = {
  object3D: DmsUniqueIdentifier;
  name: string;
  description: string;
};

export const ASSET_PROPERTIES_LIST = ['name', 'description', 'object3D'] as const satisfies Array<
  keyof AssetProperties
>;

export const isPointCloudVolumeFilter = {
  hasData: [COGNITE_POINT_CLOUD_VOLUME_SOURCE]
} as const satisfies HasExistingDataFilterV3;

export type PointCloudVolumeObject3DProperties = {
  revisions: DmsUniqueIdentifier[];
  model3D: DmsUniqueIdentifier;
  volumeReferences: string[];
  volumeType: string;
  volume: number[];
  object3D: DmsUniqueIdentifier;
};

export function getRevisionContainsAnyFilter(
  revisionReferences: DmsUniqueIdentifier[]
): TableExpressionContainsAnyFilterV3 {
  return {
    containsAny: {
      property: [
        CORE_DM_3D_CONTAINER_SPACE,
        COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId,
        'revisions'
      ],
      values: revisionReferences
    }
  } as const satisfies TableExpressionContainsAnyFilterV3;
}

export function hasIdFilter(refs: DmsUniqueIdentifier[]): TableExpressionLeafFilter {
  return {
    instanceReferences: refs
  } as unknown as TableExpressionLeafFilter;
}
