/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient, type Node3D } from '@cognite/sdk';
import {
  type FdmSDK,
  type InspectResultList,
  type DmsUniqueIdentifier
} from '../../data-providers/FdmSDK';
import { chunk } from 'lodash';
import { type ModelId, type NodeId, type RevisionId, type TreeIndex } from './types';

export async function fetchAncestorNodesForTreeIndex(
  modelId: ModelId,
  revisionId: RevisionId,
  treeIndex: TreeIndex,
  cogniteClient: CogniteClient
): Promise<Node3D[]> {
  const nodeId = await treeIndexesToNodeIds(modelId, revisionId, [treeIndex], cogniteClient);

  const ancestorNodes = await cogniteClient.revisions3D.list3DNodeAncestors(
    modelId,
    revisionId,
    nodeId[0]
  );

  return ancestorNodes.items;
}

export async function inspectNodes(
  fdmClient: FdmSDK,
  dataNodes: DmsUniqueIdentifier[]
): Promise<InspectResultList> {
  const chunkedNodes = chunk(dataNodes, 100);

  const inspectionResult: InspectResultList = {
    items: []
  };

  for (const nodesChunk of chunkedNodes) {
    const chunkInspectionResults = await fdmClient.inspectInstances({
      inspectionOperations: { involvedViews: { allVersions: true } },
      items: nodesChunk.map((node) => ({
        instanceType: 'node',
        externalId: node.externalId,
        space: node.space
      }))
    });

    inspectionResult.items.push(...chunkInspectionResults.items);
  }

  return inspectionResult;
}

export async function treeIndexesToNodeIds(
  modelId: ModelId,
  revisionId: RevisionId,
  treeIndexes: TreeIndex[],
  cogniteClient: CogniteClient
): Promise<NodeId[]> {
  const outputsUrl = `${cogniteClient.getBaseUrl()}/api/v1/projects/${
    cogniteClient.project
  }/3d/models/${modelId}/revisions/${revisionId}/nodes/internalids/bytreeindices`;

  const treeIndexChunks = chunk(treeIndexes, 1000);

  const nodeIds: NodeId[] = [];

  for (const treeIndexChunk of treeIndexChunks) {
    const response = await cogniteClient.post<{ items: NodeId[] }>(outputsUrl, {
      data: { items: treeIndexChunk }
    });

    if (response.status === 200) {
      nodeIds.push(...response.data.items);
    } else {
      throw Error(
        `treeIndex-nodeId translation failed for treeIndexes ${treeIndexChunk.join(',')}`
      );
    }
  }

  return nodeIds;
}

export async function nodeIdsToTreeIndices(
  modelId: ModelId,
  revisionId: RevisionId,
  nodeIds: NodeId[],
  cogniteClient: CogniteClient
): Promise<TreeIndex[]> {
  const outputsUrl = `${cogniteClient.getBaseUrl()}/api/v1/projects/${
    cogniteClient.project
  }/3d/models/${modelId}/revisions/${revisionId}/nodes/treeindices/byinternalids`;
  const response = await cogniteClient.post<{ items: TreeIndex[] }>(outputsUrl, {
    data: { items: nodeIds }
  });
  if (response.status === 200) {
    return response.data.items;
  } else {
    throw new Error(`nodeId-treeIndex translation failed for nodeIds ${nodeIds.join(',')}`);
  }
}

export async function fetchNodesForNodeIds(
  modelId: ModelId,
  revisionId: RevisionId,
  nodeIds: NodeId[],
  cogniteClient: CogniteClient
): Promise<Node3D[]> {
  if (nodeIds.length === 0) {
    return [];
  }
  return await cogniteClient.revisions3D.retrieve3DNodes(
    modelId,
    revisionId,
    nodeIds.map((id) => ({ id }))
  );
}
