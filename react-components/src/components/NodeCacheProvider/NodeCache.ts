/*!
 * Copyright 2023 Cognite AS
 */

import { Node3D, type CogniteClient } from '@cognite/sdk';
import { EdgeItem, type DmsUniqueIdentifier, type FdmSDK } from '../../utilities/FdmSDK';
import { Fdm3dNodeData, FdmCadEdge, FdmEdgeWithNode, RevisionNodeCache, nodeIdsToNodes } from './RevisionNodeCache';
import { type CogniteCadModel } from '@cognite/reveal';
import { InModel3dEdgeProperties, SYSTEM_3D_EDGE_SOURCE, SYSTEM_SPACE_3D_SCHEMA } from '../../utilities/globalDataModels';
import { ModelRevisionId, ModelRevisionToEdgeMap } from '../../hooks/useMappedEquipmentBy3DModelsList';

import { partition } from 'lodash';

import assert from 'assert';


export type ModelId = number;
export type RevisionId = number;
export type TreeIndex = number;

export type RevisionKey = `${ModelId}-${RevisionId}`;
export type FdmKey = `${string}-${string}`;
export type RevisionTreeIndex = `${ModelId}-${RevisionId}-${TreeIndex}`;
export type FdmId = DmsUniqueIdentifier;

export class FdmNodeCache {
  private readonly _revisionNodeCaches = new Map<RevisionKey, RevisionNodeCache>();

  private readonly _cdfClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;

  private readonly _completeRevisions = new Set<RevisionKey>();

  public constructor(cdfClient: CogniteClient, fdmClient: FdmSDK) {
    this._cdfClient = cdfClient;
    this._fdmClient = fdmClient;
  }

  public async getAllMappingExternalIds(
    modelRevisionIds: Array<{ modelId: number; revisionId: number }>
  ): Promise<ModelRevisionToEdgeMap> {

    const [cachedRevisionIds, nonCachedRevisionIds] =
      partition(
        modelRevisionIds,
        ids => {
          const key = createRevisionKey(ids.modelId, ids.revisionId);
          return this._completeRevisions.has(key);
        });

    // Get cached data
    const cachedEdges = cachedRevisionIds.map(id => {
      const revisionCache = this.getOrCreateRevisionCache(id.modelId, id.revisionId);
      const revisionKey = createRevisionKey(id.modelId, id.revisionId);
      const cachedRevisionEdges = revisionCache.getAllEdges();
      return [revisionKey, cachedRevisionEdges] as const;
    });

    const groupToModels = await this.getRevisionToEdgesMap(nonCachedRevisionIds);

    this.cacheRevisionData(groupToModels);

    cachedEdges.forEach(([revisionKey, edges]) => {
      groupToModels.set(revisionKey, edges);
    });

    return groupToModels;
  }

  private cacheRevisionData(modelMap: Map<RevisionKey, FdmEdgeWithNode[]>): void {
    for (const [revisionKey, data] of modelMap.entries()) {
      const [modelId, revisionId] = revisionKeyToIds(revisionKey);
      const revisionCache = this.getOrCreateRevisionCache(modelId, revisionId);

      console.log("Inserting mappings - ", data.length, 'of them');
      data.forEach(edgeAndNode => {
        revisionCache.insertTreeIndexMappings(edgeAndNode.node.treeIndex, edgeAndNode);
      });

      this._completeRevisions.add(revisionKey);
    }
  }

  private async getRevisionToEdgesMap(modelRevisionIds: { modelId: number, revisionId: number }[]): Promise<Map<RevisionKey, FdmEdgeWithNode[]>> {
    // Fetched non-cached data
    const revisionIds = modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId);
    const edges = await this.getEdgesForRevisions(revisionIds, this._fdmClient);
    return await groupToModelRevision(edges, modelRevisionIds, this._cdfClient);
  }

  public async getClosestParentExternalId(
    modelId: number,
    revisionId: number,
    treeIndex: number
  ): Promise<Fdm3dNodeData[]> {
    const revisionCache = this.getOrCreateRevisionCache(modelId, revisionId);

    console.log('In `getClosestParentExternalId`');

    return await revisionCache.getClosestParentFdmData(treeIndex);
  }

  private async getEdgesForRevisions(
    revisionIds: number[],
    fdmClient: FdmSDK
  ): Promise<Array<EdgeItem<InModel3dEdgeProperties>>> {
    const versionedPropertiesKey = `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`;
    const filter = {
      in: {
        property: [SYSTEM_SPACE_3D_SCHEMA, versionedPropertiesKey, 'revisionId'],
        values: revisionIds
      }
    };
    const mappings = await fdmClient.filterAllInstances<InModel3dEdgeProperties>(
      filter,
      'edge',
      SYSTEM_3D_EDGE_SOURCE
    );
    return mappings.edges;
  }


  private getOrCreateRevisionCache(modelId: number, revisionId: number): RevisionNodeCache {
    const revisionKey = createRevisionKey(modelId, revisionId);
    if (!this._revisionNodeCaches.has(revisionKey)) {
      this._revisionNodeCaches.set(
        revisionKey,
        new RevisionNodeCache(
          this._cdfClient,
          this._fdmClient,
          modelId,
          revisionId
        )
      );
    }

    return this._revisionNodeCaches.get(revisionKey)!;
  }
}

async function getNodeIdsForAsset(
  space: string,
  externalId: string
): Promise<Array<{ modelId: number; revisionId: number; nodeId: number }>> {
  return [];
}

function createRevisionKey(modelId: number, revisionId: number): RevisionKey {
  return `${modelId}-${revisionId}`;
}

function revisionKeyToIds(revisionKey: RevisionKey): [number, number] {
  const components = revisionKey.split('-');
  return [Number(components[0]), Number(components[1])];
}

export function createRevisionTreeIndex(
  modelId: number,
  revisionId: number,
  treeIndex: number
): RevisionTreeIndex {
  return `${modelId}-${revisionId}-${treeIndex}`;
}

export function createFdmKey(spaceId: string, externalId: string): FdmKey {
  return `${spaceId}-${externalId}`;
}

function treeIndexKeyToId(key: RevisionTreeIndex): {
  modelId: number;
  revisionId: number;
  treeIndex: number;
} {
  const parts = key.split('-');

  return { modelId: Number(parts[0]), revisionId: Number(parts[1]), treeIndex: Number(parts[2]) };
}

export function fdmKeyToId(fdmKey: FdmKey): FdmId {
  const parts = fdmKey.split('-');

  return { space: parts[0], externalId: parts[1] };
}

export function insertIntoSetMap<T, U>(
  key: T,
  value: U,
  globalMap: Map<T, U[] >
): void {
  const prevVal = globalMap.get(key);

  if (prevVal === undefined) {
    globalMap.set(key, [value]);
    return;
  }

  prevVal.push(value);
}

async function groupToModelRevision(
  edges: Array<EdgeItem<InModel3dEdgeProperties>>,
  modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
  cdfClient: CogniteClient
): Promise<Map<RevisionKey, Array<FdmEdgeWithNode>>> {
  const nodeIdsPerRevision = edges.reduce(
    (revisionNodeIdMap, edge) => {
      const nodeIdsInRevision = revisionNodeIdMap.get(edge.properties.revisionId);
      if (nodeIdsInRevision !== undefined) {
        nodeIdsInRevision.push(edge.properties.revisionNodeId);
      } else {
        revisionNodeIdMap.set(edge.properties.revisionId, [edge.properties.revisionNodeId]);
      }

      return revisionNodeIdMap;
    },
    new Map<RevisionId, number[]>());

  type RevisionNodeId = `${RevisionId}-${number}`;
  const revisionNodeIdToNode = new Map<RevisionNodeId, Node3D>();

  const treeIndexesPromises = [...nodeIdsPerRevision.entries()].map(async ([revisionId, nodeIds]) => {
    const modelId = modelRevisionIds.find(p => p.revisionId === revisionId)?.modelId;
    assert(modelId !== undefined);

    const nodes = await nodeIdsToNodes(modelId, revisionId, nodeIds, cdfClient);
    nodeIds.forEach((e, ind) => {
      const revisionNodeIdKey = `${revisionId}-${e}` as const;
      revisionNodeIdToNode.set(revisionNodeIdKey, nodes[ind]);
    });
  });

  await Promise.all(treeIndexesPromises);

  return edges.reduce((map, edge) => {
    const edgeRevisionId = edge.properties.revisionId;
    const modelRevisionId = modelRevisionIds.find((p) => p.revisionId === edgeRevisionId);
    if (modelRevisionId === undefined) return map;
    const modelRevisionIdKey: ModelRevisionId = createRevisionKey(modelRevisionId.modelId, modelRevisionId.revisionId);
    const edgesForModel = map.get(modelRevisionIdKey);
    const revisionNodeIdKey = `${modelRevisionId.revisionId}-${edge.properties.revisionNodeId}` as const;
    const value = { edge, node: revisionNodeIdToNode.get(revisionNodeIdKey)! };
    if (edgesForModel === undefined) {
      map.set(modelRevisionIdKey, [value]);
    } else {
      edgesForModel.push(value);
    }

    return map;
  }, new Map<ModelRevisionId, Array<FdmEdgeWithNode>>());
}
