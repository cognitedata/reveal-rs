/*!
 * Copyright 2023 Cognite AS
 */

import { type Cognite3DViewer, type PointerEventData, type CogniteCadModel } from '@cognite/reveal';
import { CogniteInternalId, type CogniteClient } from '@cognite/sdk';
import {
  EdgeItem,
  InspectResultList,
  type FdmSDK,
  DmsUniqueIdentifier,
  Source
} from '../../utilities/FdmSDK';
import { type FdmAssetMappingsConfig } from '../../hooks/types';
import { type NodeDataResult } from './types';

async function getAncestorNodeIdsForTreeIndex(
  client: CogniteClient,
  model: CogniteCadModel,
  treeIndex: number
): Promise<CogniteInternalId[]> {
  const nodeId = await model.mapTreeIndexToNodeId(treeIndex);

  const ancestorNodes = await client.revisions3D.list3DNodeAncestors(
    model.modelId,
    model.revisionId,
    nodeId
  );

  return ancestorNodes.items.map((n) => n.id);
}

async function getMappingEdges(
  fdmClient: FdmSDK,
  fdmConfig: FdmAssetMappingsConfig,
  model: CogniteCadModel,
  ancestorIds: CogniteInternalId[]
): Promise<{ edges: EdgeItem<Record<string, any>>[] }> {
  const filter = {
    and: [
      {
        equals: {
          property: ['edge', 'endNode'],
          value: {
            space: fdmConfig.global3dSpace,
            externalId: `model_3d_${model.modelId}`
          }
        }
      },
      {
        equals: {
          property: [
            fdmConfig.source.space,
            `${fdmConfig.source.externalId}/${fdmConfig.source.version}`,
            'revisionId'
          ],
          value: model.revisionId
        }
      },
      {
        in: {
          property: [
            fdmConfig.source.space,
            `${fdmConfig.source.externalId}/${fdmConfig.source.version}`,
            'nodeId'
          ],
          values: ancestorIds
        }
      }
    ]
  };

  return fdmClient.filterAllInstances(filter, 'edge', fdmConfig.source);
}

async function inspectNode(
  fdmClient: FdmSDK,
  dataNode: DmsUniqueIdentifier
): Promise<InspectResultList> {
  const inspectionResult = await fdmClient.inspectInstances({
    inspectionOperations: { involvedViewsAndContainers: {} },
    items: [
      {
        instanceType: 'node',
        externalId: dataNode.externalId,
        space: dataNode.space
      }
    ]
  });

  return inspectionResult;
}

async function filterNodeData<NodeType>(
  fdmClient: FdmSDK,
  dataNode: DmsUniqueIdentifier,
  dataView: Source
): Promise<NodeType | undefined> {
  if (dataView === undefined) {
    return undefined;
  }

  const dataQueryResult = await fdmClient.filterAllInstances(
    {
      and: [
        { equals: { property: ['node', 'space'], value: dataNode.space } },
        {
          equals: {
            property: ['node', 'externalId'],
            value: dataNode.externalId
          }
        }
      ]
    },
    'node',
    dataView
  );

  return dataQueryResult.edges[0]?.properties[dataView.space]?.[
    `${dataView.externalId}/${dataView.version}`
  ];
}

export async function queryMappedData<NodeType>(
  viewer: Cognite3DViewer,
  cdfClient: CogniteClient,
  fdmClient: FdmSDK,
  fdmConfig: FdmAssetMappingsConfig,
  clickEvent: PointerEventData
): Promise<NodeDataResult<NodeType> | undefined> {
  const intersection = await viewer.getIntersectionFromPixel(
    clickEvent.offsetX,
    clickEvent.offsetY
  );

  if (intersection === null || intersection.type !== 'cad') {
    return;
  }

  const cadIntersection = intersection;
  const model = cadIntersection.model;

  const ancestorIds = await getAncestorNodeIdsForTreeIndex(
    cdfClient,
    model,
    cadIntersection.treeIndex
  );

  const mappings = await getMappingEdges(fdmClient, fdmConfig, model, ancestorIds);

  if (mappings.edges.length === 0) {
    return;
  }

  const dataNode = mappings.edges[0].startNode;

  const inspectionResult = await inspectNode(fdmClient, dataNode);

  const dataView =
    inspectionResult.items[0]?.inspectionResults.involvedViewsAndContainers?.views[0];

  const nodeData = await filterNodeData<NodeType>(fdmClient, dataNode, dataView);

  if (nodeData === undefined) {
    return undefined;
  }

  return { data: nodeData as NodeType, view: dataView };
}
