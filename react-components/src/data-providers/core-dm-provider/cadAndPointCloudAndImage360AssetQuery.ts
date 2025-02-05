/*!
 * Copyright 2024 Cognite AS
 */

import { type TableExpressionLeafFilter, type QueryRequest } from '@cognite/sdk';
import { type Source, type InstanceFilter, type DmsUniqueIdentifier } from '../FdmSDK';
import { cogniteAssetSourceWithProperties } from './cogniteAssetSourceWithProperties';
import {
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_ASSET_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE,
  COGNITE_IMAGE_360_SOURCE,
  COGNITE_3D_OBJECT_SOURCE,
  COGNITE_IMAGE_360_ANNOTATION_SOURCE,
  COGNITE_3D_REVISION_SOURCE
} from './dataModels';

const containsCadRevisionFilter: InstanceFilter = {
  containsAny: {
    property: [CORE_DM_3D_CONTAINER_SPACE, COGNITE_CAD_NODE_SOURCE.externalId, 'revisions'],
    values: { parameter: 'revisionRefs' }
  }
} as const;

const containsPointCloudRevisionFilter: InstanceFilter = {
  containsAny: {
    property: [
      CORE_DM_3D_CONTAINER_SPACE,
      COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId,
      'revisions'
    ],
    values: { parameter: 'revisionRefs' }
  }
} as const;

function containsImage360CollectionFilter(revisionRefs: DmsUniqueIdentifier[]): InstanceFilter {
  return {
    and: [
      { instanceReferences: revisionRefs } as unknown as TableExpressionLeafFilter,
      {
        hasData: [COGNITE_3D_REVISION_SOURCE]
      },
      {
        equals: {
          property: ['cdf_cdm_3d', 'Cognite3DRevision', 'type'],
          value: 'Image360'
        }
      }
    ]
  } as const;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function cadAndPointCloudAndImage36AssetQuery(
  sourcesToSearch: Source[],
  revisionRefs: DmsUniqueIdentifier[],
  filter: InstanceFilter | undefined,
  limit: number
) {
  return {
    with: {
      cad_nodes: {
        nodes: {
          filter: containsCadRevisionFilter
        },
        limit
      },
      cad_object_3d: {
        nodes: {
          from: 'cad_nodes',
          through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' },
          direction: 'outwards'
        }
      },
      cad_assets: {
        nodes: {
          from: 'cad_object_3d',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          direction: 'inwards',
          filter
        }
      },
      pointcloud_volumes: {
        nodes: {
          filter: containsPointCloudRevisionFilter
        },
        limit
      },
      pointcloud_object_3d: {
        nodes: {
          from: 'pointcloud_volumes',
          through: { view: COGNITE_POINT_CLOUD_VOLUME_SOURCE, identifier: 'object3D' },
          direction: 'outwards'
        }
      },
      pointcloud_assets: {
        nodes: {
          from: 'pointcloud_object_3d',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          filter
        }
      },
      image360_collections: {
        nodes: {
          filter: containsImage360CollectionFilter(revisionRefs)
        },
        limit
      },
      image360_revisions: {
        nodes: {
          from: 'image360_collections',
          through: { view: COGNITE_IMAGE_360_SOURCE, identifier: 'collection360' },
          direction: 'inwards'
        },
        limit
      },
      image360_annotations: {
        edges: {
          from: 'image360_revisions',
          direction: 'inwards',
          filter: { hasData: [COGNITE_IMAGE_360_ANNOTATION_SOURCE] }
        }
      },
      image360_object3ds: {
        nodes: {
          from: 'image360_annotations',
          chainTo: 'destination',
          filter: { hasData: [COGNITE_3D_OBJECT_SOURCE] }
        }
      },
      image360_assets: {
        nodes: {
          from: 'image360_object3ds',
          through: { view: COGNITE_ASSET_SOURCE, identifier: 'object3D' },
          direction: 'inwards',
          filter: { hasData: [COGNITE_ASSET_SOURCE] }
        }
      }
    },
    select: {
      cad_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      },
      pointcloud_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      },
      image360_collections: {},
      image360_revisions: {},
      image360_annotations: {},
      image360_object3ds: {},
      image360_assets: {
        sources: [
          ...cogniteAssetSourceWithProperties,
          ...sourcesToSearch.map((source) => ({ source, properties: ['*'] }))
        ]
      }
    }
  } as const satisfies Omit<QueryRequest, 'parameters' | 'cursors'>;
}
