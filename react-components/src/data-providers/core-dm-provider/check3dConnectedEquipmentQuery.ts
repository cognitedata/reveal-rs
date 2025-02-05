/*!
 * Copyright 2024 Cognite AS
 */
import {
  type QueryRequest,
  type QueryTableExpressionV3,
  type SourceSelectorV3
} from '@cognite/sdk';
import { cogniteObject3dSourceWithProperties } from './cogniteObject3dSourceWithProperties';
import {
  COGNITE_CAD_NODE_SOURCE,
  COGNITE_IMAGE_360_ANNOTATION_SOURCE,
  COGNITE_IMAGE_360_SOURCE,
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  COGNITE_VISUALIZABLE_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE
} from './dataModels';
import { type DmsUniqueIdentifier } from '..';
import { hasIdFilter } from './utils/filters';
import { cogniteImage360AnnotationSourceWithProperties } from './cogniteImage360AnnotationSourceWithProperties';
import { cogniteImage360SourceWithProperties } from './cogniteImage360SourceWithProperties';

const pointCloudVolumeSourceWithProperties = [
  {
    source: COGNITE_POINT_CLOUD_VOLUME_SOURCE,
    properties: ['object3D']
  }
] as const satisfies SourceSelectorV3;

const cadNodeSourceWithProperties = [
  {
    source: COGNITE_CAD_NODE_SOURCE,
    properties: ['object3D']
  }
] as const satisfies SourceSelectorV3;

function getRevisionsCadNodeFromObject3D(object3dTableName: string): QueryTableExpressionV3 {
  return {
    nodes: {
      from: object3dTableName,
      through: { view: COGNITE_CAD_NODE_SOURCE, identifier: 'object3D' },
      filter: {
        containsAny: {
          property: [CORE_DM_3D_CONTAINER_SPACE, COGNITE_CAD_NODE_SOURCE.externalId, 'revisions'],
          values: { parameter: 'revisionRefs' }
        }
      }
    }
  };
}

function getRevisionsPointCloudVolumes(object3dTableName: string): QueryTableExpressionV3 {
  return {
    nodes: {
      from: object3dTableName,
      through: { view: COGNITE_POINT_CLOUD_VOLUME_SOURCE, identifier: 'object3D' },
      filter: {
        containsAny: {
          property: [
            CORE_DM_3D_CONTAINER_SPACE,
            COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId,
            'revisions'
          ],
          values: { parameter: 'revisionRefs' }
        }
      }
    }
  };
}

type Image360ConnectionExpressions<Prefix extends string> = Record<
  `${Prefix}_360_annotation_edges` | `${Prefix}_360_image_nodes`,
  QueryTableExpressionV3
>;

function getRevisionsImage360Annotations<const Prefix extends string>(
  prefix: Prefix,
  object3dTableName: string,
  revisionRefs: DmsUniqueIdentifier[]
): Image360ConnectionExpressions<Prefix> {
  const edgesResultExpression = `${prefix}_360_annotation_edges`;
  const imagesResultExpession = `${prefix}_360_image_nodes`;

  return {
    [edgesResultExpression]: {
      edges: {
        from: object3dTableName,
        direction: 'outwards',
        filter: { hasData: [COGNITE_IMAGE_360_ANNOTATION_SOURCE] }
      }
    },
    [imagesResultExpession]: {
      nodes: {
        from: edgesResultExpression,
        chainTo: 'destination',
        filter: {
          and: [
            {
              hasData: [COGNITE_IMAGE_360_SOURCE]
            },
            {
              in: {
                property: [
                  COGNITE_IMAGE_360_SOURCE.space,
                  `${COGNITE_IMAGE_360_SOURCE.externalId}/${COGNITE_IMAGE_360_SOURCE.version}`,
                  'collection360'
                ],
                values: revisionRefs
              }
            }
          ]
        }
      }
    }
  } as Image360ConnectionExpressions<Prefix>;
}

function getObject3dRelation(visualizableTableName: string): QueryTableExpressionV3 {
  return {
    nodes: {
      from: visualizableTableName,
      through: { view: COGNITE_VISUALIZABLE_SOURCE, identifier: 'object3D' },
      direction: 'outwards'
    }
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createCheck3dConnectedEquipmentQuery(
  initialNodes: DmsUniqueIdentifier[],
  initialDirectNodes: DmsUniqueIdentifier[],
  revisionRefs: DmsUniqueIdentifier[]
) {
  return {
    with: {
      initial_nodes: {
        nodes: {
          filter: {
            and: [
              hasIdFilter(initialNodes),
              {
                hasData: [COGNITE_VISUALIZABLE_SOURCE]
              }
            ]
          }
        }
      },
      directly_referenced_nodes: {
        nodes: {
          filter: {
            and: [
              hasIdFilter(initialDirectNodes),
              {
                hasData: [COGNITE_VISUALIZABLE_SOURCE]
              }
            ]
          }
        }
      },
      indirectly_referenced_edges: {
        edges: {
          from: 'initial_nodes',
          direction: 'outwards',
          nodeFilter: {
            hasData: [COGNITE_VISUALIZABLE_SOURCE]
          }
        }
      },
      indirectly_referenced_nodes: {
        nodes: {
          from: 'indirectly_referenced_edges'
        }
      },
      initial_nodes_object_3ds: getObject3dRelation('initial_nodes'),
      initial_nodes_cad_nodes: getRevisionsCadNodeFromObject3D('initial_nodes_object_3ds'),
      initial_nodes_point_cloud_volumes: getRevisionsPointCloudVolumes('initial_nodes_object_3ds'),
      ...getRevisionsImage360Annotations('initial', 'initial_nodes_object_3ds', revisionRefs),
      direct_nodes_object_3ds: getObject3dRelation('directly_referenced_nodes'),
      direct_nodes_cad_nodes: getRevisionsCadNodeFromObject3D('direct_nodes_object_3ds'),
      direct_nodes_point_cloud_volumes: getRevisionsPointCloudVolumes('direct_nodes_object_3ds'),
      ...getRevisionsImage360Annotations('direct', 'direct_nodes_object_3ds', revisionRefs),
      indirect_nodes_object_3ds: getObject3dRelation('indirectly_referenced_nodes'),
      indirect_nodes_cad_nodes: getRevisionsCadNodeFromObject3D('indirect_nodes_object_3ds'),
      indirect_nodes_point_cloud_volumes: getRevisionsPointCloudVolumes(
        'indirect_nodes_object_3ds'
      ),
      ...getRevisionsImage360Annotations('indirect', 'indirect_nodes_object_3ds', revisionRefs)
    },
    select: {
      indirectly_referenced_edges: {},
      initial_nodes_object_3ds: { sources: cogniteObject3dSourceWithProperties },
      initial_nodes_cad_nodes: {
        sources: cadNodeSourceWithProperties
      },
      initial_nodes_point_cloud_volumes: { sources: pointCloudVolumeSourceWithProperties },
      initial_360_annotation_edges: { sources: cogniteImage360AnnotationSourceWithProperties },
      initial_360_image_nodes: { sources: cogniteImage360SourceWithProperties },
      direct_nodes_object_3ds: { sources: cogniteObject3dSourceWithProperties },
      direct_nodes_cad_nodes: {
        sources: cadNodeSourceWithProperties
      },
      direct_nodes_point_cloud_volumes: { sources: pointCloudVolumeSourceWithProperties },
      direct_360_annotation_edges: { sources: cogniteImage360AnnotationSourceWithProperties },
      direct_360_image_nodes: { sources: cogniteImage360SourceWithProperties },
      indirect_nodes_object_3ds: { sources: cogniteObject3dSourceWithProperties },
      indirect_nodes_cad_nodes: {
        sources: cadNodeSourceWithProperties
      },
      indirect_nodes_point_cloud_volumes: {
        sources: pointCloudVolumeSourceWithProperties
      },
      indirect_360_annotation_edges: { sources: cogniteImage360AnnotationSourceWithProperties },
      indirect_360_image_nodes: { sources: cogniteImage360SourceWithProperties }
    }
  } as const satisfies Omit<QueryRequest, 'parameters' | 'cursor'>;
}
