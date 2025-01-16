/*!
 * Copyright 2023 Cognite AS
 */

import { type Node3D, type CogniteClient, type CogniteExternalId } from '@cognite/sdk';
import { type Source, type FdmSDK, type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import { RevisionFdmNodeCache } from './RevisionFdmNodeCache';
import {
  type FdmConnectionWithNode,
  type FdmCadConnection,
  type ModelRevisionKey,
  type RevisionId,
  type ModelTreeIndexKey,
  type ModelRevisionToConnectionMap,
  type ModelRevisionId,
  type FdmKey,
  type FdmNodeDataPromises,
  type TreeIndex
} from './types';

import {
  createFdmKey,
  createModelTreeIndexKey,
  createModelRevisionKey,
  revisionKeyToIds
} from './idAndKeyTranslation';

import { partition } from 'lodash';

import assert from 'assert';
import { fetchNodesForNodeIds, inspectNodes, treeIndexesToNodeIds } from './requests';
import { type ThreeDModelFdmMappings } from '../../hooks/types';
import { type Fdm3dDataProvider } from '../../data-providers/Fdm3dDataProvider';

export class FdmNodeCache {
  private readonly _revisionNodeCaches = new Map<ModelRevisionKey, RevisionFdmNodeCache>();

  private readonly _cdfClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;
  private readonly _fdm3dDataProvider: Fdm3dDataProvider;

  private readonly _completeRevisions = new Set<ModelRevisionKey>();

  public constructor(
    cdfClient: CogniteClient,
    fdmClient: FdmSDK,
    fdm3dDataProvider: Fdm3dDataProvider
  ) {
    this._cdfClient = cdfClient;
    this._fdmClient = fdmClient;
    this._fdm3dDataProvider = fdm3dDataProvider;
  }

  public async getMappingsForFdmInstances(
    instances: DmsUniqueIdentifier[],
    modelRevisionIds: ModelRevisionId[]
  ): Promise<ThreeDModelFdmMappings[]> {
    const [cachedModelRevisionIds, nonCachedModelRevisionIds] = partition(
      modelRevisionIds,
      (id) => {
        const revisionKey = createModelRevisionKey(id.modelId, id.revisionId);
        return this._completeRevisions.has(revisionKey);
      }
    );

    const nonCachedModelMappings = await this.getNonCachedModelMappings(
      instances,
      nonCachedModelRevisionIds
    );

    const cachedModelMappings = this.getCachedModelMappings(cachedModelRevisionIds, instances);

    const combinedList = [...cachedModelMappings, ...nonCachedModelMappings];
    return combinedList;
  }

  private getCachedModelMappings(
    modelRevisionIds: ModelRevisionId[],
    externalIds: DmsUniqueIdentifier[]
  ): ThreeDModelFdmMappings[] {
    const inputExternalIdSet = new Set<FdmKey>(externalIds.map(createFdmKey));

    return modelRevisionIds.map((modelRevisionId) => {
      return this.getCachedModelMappingForRevision(modelRevisionId, inputExternalIdSet);
    });
  }

  private getCachedModelMappingForRevision(
    modelRevisionId: ModelRevisionId,
    relevantFdmKeySet: Set<FdmKey>
  ): ThreeDModelFdmMappings {
    const revisionCache = this.getOrCreateRevisionCache(
      modelRevisionId.modelId,
      modelRevisionId.revisionId
    );

    const relevantCachedConnectionData = intersectWithFdmKeySet(
      revisionCache.getAllConnections(),
      relevantFdmKeySet
    );

    const mappings = createMapWithAccumulatedValues(
      relevantCachedConnectionData.map((data) => [
        data.connection.instance.externalId,
        data.cadNode
      ])
    );

    return {
      ...modelRevisionId,
      mappings
    };
  }

  private async getNonCachedModelMappings(
    instances: DmsUniqueIdentifier[],
    modelRevisions: ModelRevisionId[]
  ): Promise<ThreeDModelFdmMappings[]> {
    if (modelRevisions.length === 0 || instances.length === 0) {
      return [];
    }

    const fdmKeySet = new Set(instances.map(createFdmKey));

    const revisionToConnectionsMap = await this.getAndCacheRevisionToConnectionsMap(
      modelRevisions,
      false
    );

    return modelRevisions.map(({ modelId, revisionId }) => {
      const revisionKey = createModelRevisionKey(modelId, revisionId);
      const connections = revisionToConnectionsMap.get(revisionKey);

      return this.getRelevantExternalIdToNodeMapForRevision(
        { modelId, revisionId },
        connections,
        fdmKeySet
      );
    });
  }

  private getRelevantExternalIdToNodeMapForRevision(
    { modelId, revisionId }: ModelRevisionId,
    connections: FdmConnectionWithNode[] | undefined,
    relevantFdmKeySet: Set<FdmKey>
  ): ThreeDModelFdmMappings {
    if (connections === undefined || connections.length === 0)
      return { modelId, revisionId, mappings: new Map<CogniteExternalId, Node3D[]>() };

    const relevantConnections = intersectWithFdmKeySet(connections, relevantFdmKeySet);

    const externalIdToNodeMap = createMapWithAccumulatedValues(
      relevantConnections.map((connection) => [
        connection.connection.instance.externalId,
        connection.cadNode
      ])
    );

    return {
      modelId,
      revisionId,
      mappings: externalIdToNodeMap
    };
  }

  public async getAllMappingExternalIds(
    modelRevisionIds: ModelRevisionId[],
    fetchViews: boolean = false
  ): Promise<ModelRevisionToConnectionMap> {
    const [cachedRevisionIds, nonCachedRevisionIds] = partition(modelRevisionIds, (ids) => {
      const key = createModelRevisionKey(ids.modelId, ids.revisionId);
      return this._completeRevisions.has(key);
    });

    if (fetchViews) {
      await this.fetchAllViewsForCachedRevisions(cachedRevisionIds);
    }

    const cachedConnections = cachedRevisionIds.map((id) =>
      this.getCachedConnectionsForRevision(id)
    );

    const revisionToConnectionsMap = await this.getAndCacheRevisionToConnectionsMap(
      nonCachedRevisionIds,
      fetchViews
    );

    cachedConnections.forEach(([revisionKey, connections]) => {
      revisionToConnectionsMap.set(revisionKey, connections);
    });

    return revisionToConnectionsMap;
  }

  private async fetchAllViewsForCachedRevisions(
    revisions: Array<{
      modelId: number;
      revisionId: number;
    }>
  ): Promise<void> {
    for (const revision of revisions) {
      const revisionCache = this.getOrCreateRevisionCache(revision.modelId, revision.revisionId);

      await revisionCache.fetchViewsForAllConnections();
    }
  }

  private getCachedConnectionsForRevision(id: {
    modelId: number;
    revisionId: number;
  }): [ModelRevisionKey, FdmConnectionWithNode[]] {
    const revisionCache = this.getOrCreateRevisionCache(id.modelId, id.revisionId);
    const revisionKey = createModelRevisionKey(id.modelId, id.revisionId);

    const cachedRevisionConnections = revisionCache.getAllConnections();

    return [revisionKey, cachedRevisionConnections];
  }

  private writeRevisionDataToCache(modelMap: Map<ModelRevisionKey, FdmConnectionWithNode[]>): void {
    for (const [revisionKey, data] of modelMap.entries()) {
      const [modelId, revisionId] = revisionKeyToIds(revisionKey);
      const revisionCache = this.getOrCreateRevisionCache(modelId, revisionId);

      data.forEach((connectionAndNode) => {
        revisionCache.insertTreeIndexMappings(
          connectionAndNode.cadNode.treeIndex,
          connectionAndNode
        );
      });

      this._completeRevisions.add(revisionKey);
    }
  }

  private async getAndCacheRevisionToConnectionsMap(
    modelRevisionIds: ModelRevisionId[],
    fetchViews: boolean
  ): Promise<Map<ModelRevisionKey, FdmConnectionWithNode[]>> {
    const connections =
      await this._fdm3dDataProvider.getCadConnectionsForRevisions(modelRevisionIds);

    const connectionsWithOptionalViews = fetchViews
      ? await this.getViewsForConnections(connections)
      : connections.map((connection) => ({ connection }));

    const revisionToConnectionsMap = await createRevisionToConnectionsMap(
      connectionsWithOptionalViews,
      modelRevisionIds,
      this._cdfClient
    );

    this.writeRevisionDataToCache(revisionToConnectionsMap);

    return revisionToConnectionsMap;
  }

  public getClosestParentDataPromises(
    modelId: number,
    revisionId: number,
    treeIndex: number
  ): FdmNodeDataPromises {
    const revisionCache = this.getOrCreateRevisionCache(modelId, revisionId);

    return revisionCache.getClosestParentFdmData(treeIndex);
  }

  private async getViewsForConnections(
    connections: FdmCadConnection[]
  ): Promise<Array<{ connection: FdmCadConnection; views: Source[] }>> {
    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      connections.map((connection) => connection.instance)
    );

    const dataWithViews = connections.map((connection, ind) => ({
      connection,
      views: nodeInspectionResults.items[ind].inspectionResults.involvedViews
    }));

    return dataWithViews;
  }

  private getOrCreateRevisionCache(modelId: number, revisionId: number): RevisionFdmNodeCache {
    const revisionKey = createModelRevisionKey(modelId, revisionId);

    const revisionCache = this._revisionNodeCaches.get(revisionKey);

    if (revisionCache !== undefined) {
      return revisionCache;
    }

    const newRevisionCache = new RevisionFdmNodeCache(
      this._cdfClient,
      this._fdmClient,
      this._fdm3dDataProvider,
      modelId,
      revisionId
    );

    this._revisionNodeCaches.set(revisionKey, newRevisionCache);

    return newRevisionCache;
  }
}

async function createRevisionToConnectionsMap(
  connectionsWithViews: Array<{ connection: FdmCadConnection; views?: Source[] }>,
  modelRevisionIds: ModelRevisionId[],
  cdfClient: CogniteClient
): Promise<Map<ModelRevisionKey, FdmConnectionWithNode[]>> {
  const revisionToTreeIndexMap = createRevisionToTreeIndexMap(connectionsWithViews);
  const modelTreeIndexToNodeMap = await createModelTreeIndexToNodeMap(
    revisionToTreeIndexMap,
    modelRevisionIds,
    cdfClient
  );

  return connectionsWithViews.reduce((map, connectionWithViews) => {
    const connectionRevisionId = connectionWithViews.connection.revisionId;
    const modelRevisionId = modelRevisionIds.find((p) => p.revisionId === connectionRevisionId);

    if (modelRevisionId === undefined) return map;

    const value = createFdmConnectionWithNode(
      modelRevisionId,
      modelTreeIndexToNodeMap,
      connectionWithViews.connection,
      connectionWithViews.views
    );

    insertConnectionIntoMapList(value, map, modelRevisionId);

    return map;
  }, new Map<ModelRevisionKey, FdmConnectionWithNode[]>());
}

function createFdmConnectionWithNode(
  modelRevisionId: ModelRevisionId,
  modelTreeIndexToNodeMap: Map<ModelTreeIndexKey, Node3D>,
  connection: FdmCadConnection,
  views?: Source[]
): FdmConnectionWithNode {
  const revisionTreeIndexKey = createModelTreeIndexKey(
    modelRevisionId.modelId,
    modelRevisionId.revisionId,
    connection.treeIndex
  );

  const node = modelTreeIndexToNodeMap.get(revisionTreeIndexKey);
  assert(node !== undefined);

  return { connection, cadNode: node, views };
}

function insertConnectionIntoMapList(
  value: FdmConnectionWithNode,
  map: Map<ModelRevisionKey, FdmConnectionWithNode[]>,
  modelRevisionId: ModelRevisionId
): void {
  const modelRevisionIdKey: ModelRevisionKey = createModelRevisionKey(
    modelRevisionId.modelId,
    modelRevisionId.revisionId
  );

  const connectionsForModel = map.get(modelRevisionIdKey);

  if (connectionsForModel === undefined) {
    map.set(modelRevisionIdKey, [value]);
  } else {
    connectionsForModel.push(value);
  }
}

async function createModelTreeIndexToNodeMap(
  revisionToTreeIndicesMap: Map<RevisionId, TreeIndex[]>,
  modelRevisionIds: ModelRevisionId[],
  cdfClient: CogniteClient
): Promise<Map<ModelTreeIndexKey, Node3D>> {
  const revisionTreeIndexToNode = new Map<ModelTreeIndexKey, Node3D>();

  const nodePromises = [...revisionToTreeIndicesMap.entries()].map(
    async ([revisionId, treeIndices]) => {
      const modelId = modelRevisionIds.find((p) => p.revisionId === revisionId)?.modelId;
      assert(modelId !== undefined);

      const nodeIds = await treeIndexesToNodeIds(modelId, revisionId, treeIndices, cdfClient);
      const nodes = await fetchNodesForNodeIds(modelId, revisionId, nodeIds, cdfClient);

      nodes.forEach((node) => {
        const modelTreeIndexKey = createModelTreeIndexKey(modelId, revisionId, node.treeIndex);
        revisionTreeIndexToNode.set(modelTreeIndexKey, node);
      });
    }
  );

  await Promise.all(nodePromises);

  return revisionTreeIndexToNode;
}

function createRevisionToTreeIndexMap(
  connections: Array<{ connection: FdmCadConnection; view?: Source }>
): Map<RevisionId, TreeIndex[]> {
  return connections.reduce((revisionTreeIndexMap, connectionWithView) => {
    const { treeIndex, revisionId } = connectionWithView.connection;

    const treeIndicesInRevision = revisionTreeIndexMap.get(revisionId);

    if (treeIndicesInRevision !== undefined) {
      treeIndicesInRevision.push(treeIndex);
    } else {
      revisionTreeIndexMap.set(revisionId, [treeIndex]);
    }

    return revisionTreeIndexMap;
  }, new Map<RevisionId, TreeIndex[]>());
}

function intersectWithFdmKeySet(
  connections: FdmConnectionWithNode[],
  relevantFdmKeySet: Set<FdmKey>
): FdmConnectionWithNode[] {
  return connections.filter((connectionData) => {
    const fdmKey = createFdmKey(connectionData.connection.instance);
    return relevantFdmKeySet.has(fdmKey);
  });
}

function createMapWithAccumulatedValues<K, V>(associations: Array<[K, V]>): Map<K, V[]> {
  return associations.reduce((map, [key, value]) => {
    const prevList = map.get(key);

    if (prevList === undefined) {
      map.set(key, [value]);
    } else {
      prevList.push(value);
    }

    return map;
  }, new Map<K, V[]>());
}
