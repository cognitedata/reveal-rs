/*!
 * Copyright 2023 Cognite AS
 */

import {
  type CogniteClient,
  type Node3D,
  type CogniteInternalId,
  type AssetMappings3DAssetFilter,
  type AssetMappings3DNodeFilter,
  type AssetMappings3DTreeIndexFilter,
  type CogniteExternalId
} from '@cognite/sdk';
import {
  type ModelTreeIndexKey,
  type AssetId,
  type ModelId,
  type RevisionId,
  type ChunkInCacheTypes,
  type ModelAssetIdKey,
  type ModelDMSUniqueInstanceKey,
  type NodeAssetMappingResult,
  type AssetMapping
} from './types';
import { chunk, maxBy } from 'lodash';
import assert from 'assert';
import { isValidAssetMapping } from './utils';
import {
  modelRevisionNodesAssetToKey,
  createModelRevisionKey,
  createModelDMSUniqueInstanceKey,
  createFdmKey
} from './idAndKeyTranslation';
import { type ModelWithAssetMappings } from '../../hooks/cad/ModelWithAssetMappings';
import { AssetMappingPerAssetIdCache } from './AssetMappingPerAssetIdCache';
import { AssetMappingPerNodeIdCache } from './AssetMappingPerNodeIdCache';
import { Node3DPerNodeIdCache } from './Node3DPerNodeIdCache';
import { AssetMappingPerModelCache } from './AssetMappingPerModelCache';
import { isDefined } from '../../utilities/isDefined';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { AssetMappingHybridPerAssetInstanceIdCache } from './AssetMappingHybridPerAssetInstanceIdCache';
import { isDmsInstance } from '../../utilities/instanceIds';

export class AssetMappingAndNode3DCache {
  private readonly _sdk: CogniteClient;

  private readonly modelToAssetMappingsCache: AssetMappingPerModelCache;

  private readonly assetIdsToAssetMappingCache: AssetMappingPerAssetIdCache;

  private readonly assetInstanceIdsToAssetMappingCache: AssetMappingHybridPerAssetInstanceIdCache;

  private readonly nodeIdsToAssetMappingCache: AssetMappingPerNodeIdCache;

  private readonly nodeIdsToNode3DCache: Node3DPerNodeIdCache;

  private readonly _amountOfAssetIdsChunks = 1;

  private readonly isCoreDmOnly: boolean;

  constructor(sdk: CogniteClient, coreDmOnly: boolean) {
    this._sdk = sdk;
    this.assetIdsToAssetMappingCache = new AssetMappingPerAssetIdCache();
    this.assetInstanceIdsToAssetMappingCache = new AssetMappingHybridPerAssetInstanceIdCache();
    this.nodeIdsToAssetMappingCache = new AssetMappingPerNodeIdCache();
    this.modelToAssetMappingsCache = new AssetMappingPerModelCache(this._sdk, coreDmOnly);
    this.nodeIdsToNode3DCache = new Node3DPerNodeIdCache(this._sdk, coreDmOnly);
    this.isCoreDmOnly = coreDmOnly;
  }

  public async getAssetMappingsForLowestAncestor(
    modelId: ModelId,
    revisionId: RevisionId,
    ancestors: Node3D[]
  ): Promise<NodeAssetMappingResult> {
    if (ancestors.length === 0) {
      return { mappings: [] };
    }

    const searchTreeIndices = new Set(ancestors.map((ancestor) => ancestor.treeIndex));
    const allClassicNodeMappings = await this.getAssetMappingsForNodes(
      modelId,
      revisionId,
      ancestors
    );
    const allHybridNodeMappings = await this.getHybridAssetMappingsForNodes(
      modelId,
      revisionId,
      ancestors
    );

    const relevantMappings = allClassicNodeMappings
      .concat(allHybridNodeMappings)
      .filter((mapping) => searchTreeIndices.has(mapping.treeIndex));

    if (relevantMappings.length === 0) {
      return { mappings: [] };
    }

    const maxRelevantMappingTreeIndex = maxBy(
      relevantMappings,
      (mapping) => mapping.treeIndex
    )?.treeIndex;

    assert(maxRelevantMappingTreeIndex !== undefined);

    const mappingsOfNearestAncestor = relevantMappings.filter(
      (mapping) => mapping.treeIndex === maxRelevantMappingTreeIndex
    );

    const nearestMappedAncestor = ancestors.find(
      (node) => node.treeIndex === maxRelevantMappingTreeIndex
    );
    assert(nearestMappedAncestor !== undefined);

    return { node: nearestMappedAncestor, mappings: mappingsOfNearestAncestor };
  }

  public async getNodesForAssetIds(
    modelId: ModelId,
    revisionId: RevisionId,
    assetIds: CogniteInternalId[]
  ): Promise<Map<AssetId, Node3D[]>> {
    const relevantAssetIds = new Set(assetIds);

    const assetIdsList = Array.from(relevantAssetIds);
    const chunkSize = Math.round(assetIdsList.length / this._amountOfAssetIdsChunks);
    const listChunks = chunk(assetIdsList, chunkSize);

    const classicAssetMappingsReturned = listChunks.map(async (itemChunk) => {
      const assetMappings = await this.getAssetMappingsForAssetIds(modelId, revisionId, itemChunk);
      return assetMappings;
    });

    const classicAssetMappings = await Promise.all(classicAssetMappingsReturned);

    const relevantClassicAssetMappings = classicAssetMappings
      .flat()
      .filter((mapping) => mapping.assetId !== undefined && relevantAssetIds.has(mapping.assetId));

    const nodes = await this.nodeIdsToNode3DCache.getNodesForNodeIds(
      modelId,
      revisionId,
      relevantClassicAssetMappings.map((assetMapping) => assetMapping.nodeId)
    );

    return nodes.reduce((acc, node, index) => {
      const key = relevantClassicAssetMappings[index].assetId;
      if (key === undefined) return acc;
      const nodesForAsset = acc.get(key);

      if (nodesForAsset !== undefined) {
        nodesForAsset.push(node);
      } else {
        acc.set(key, [node]);
      }

      return acc;
    }, new Map<AssetId, Node3D[]>());
  }

  public async getNodesForAssetInstancesInHybridMappings(
    modelId: ModelId,
    revisionId: RevisionId,
    assetMappings: AssetMapping[]
  ): Promise<Map<CogniteExternalId, Node3D[]>> {
    const nodes = await this.nodeIdsToNode3DCache.getNodesForNodeIds(
      modelId,
      revisionId,
      assetMappings.map(({ nodeId }) => nodeId)
    );

    return nodes.reduce((acc, node, index) => {
      const instanceId = assetMappings[index].assetInstanceId;
      if (instanceId === undefined) return acc;
      const key = createFdmKey(instanceId);
      if (key === undefined) return acc;
      const nodesForAsset = acc.get(key);

      if (nodesForAsset !== undefined) {
        nodesForAsset.push(node);
      } else {
        acc.set(key, [node]);
      }

      return acc;
    }, new Map<CogniteExternalId, Node3D[]>());
  }

  public async generateNode3DCachePerItem(
    modelId: ModelId,
    revisionId: RevisionId,
    nodeIds: number[] | undefined
  ): Promise<void> {
    await this.nodeIdsToNode3DCache.generateNode3DCachePerItem(modelId, revisionId, nodeIds);
  }

  public async generateAssetMappingsCachePerItemFromModelCache(
    modelId: ModelId,
    revisionId: RevisionId,
    assetMappingsPerModel: ModelWithAssetMappings[] | undefined
  ): Promise<void> {
    if (assetMappingsPerModel === undefined) {
      return;
    }
    assetMappingsPerModel.forEach(async (modelMapping) => {
      modelMapping.assetMappings.forEach(async (item) => {
        if (item.assetId !== undefined) {
          const key = modelRevisionNodesAssetToKey(modelId, revisionId, item.assetId);
          await this.assetIdsToAssetMappingCache.setAssetMappingsCacheItem(key, item);
        } else if (item.assetInstanceId !== undefined) {
          const key = createModelDMSUniqueInstanceKey(
            modelId,
            revisionId,
            item.assetInstanceId.space,
            item.assetInstanceId.externalId
          );
          await this.assetInstanceIdsToAssetMappingCache.setHybridAssetMappingsCacheItem(key, item);
        }
      });
    });
  }

  public async getAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    const key = createModelRevisionKey(modelId, revisionId);
    const cachedResult = await this.modelToAssetMappingsCache.getModelToAssetMappingCacheItems(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    return await this.modelToAssetMappingsCache.fetchAndCacheMappingsForModel(modelId, revisionId);
  }

  private async splitChunkInCacheAssetMappings(
    currentChunk: number[],
    modelId: ModelId,
    revisionId: RevisionId,
    type: string
  ): Promise<ChunkInCacheTypes<AssetMapping>> {
    const chunkInCache: AssetMapping[] = [];
    const chunkNotCached: number[] = [];

    await Promise.all(
      currentChunk.map(async (id) => {
        const key = modelRevisionNodesAssetToKey(modelId, revisionId, id);
        const cachedResult = await this.getItemCacheResult(type, key);
        if (cachedResult !== undefined) {
          chunkInCache.push(...cachedResult);
        } else {
          chunkNotCached.push(id);
        }
      })
    );

    return { chunkInCache, chunkNotInCacheIdClassic: chunkNotCached };
  }

  private async splitChunkInCacheHybridAssetMappings(
    currentChunk: DmsUniqueIdentifier[] | number[],
    modelId: ModelId,
    revisionId: RevisionId,
    type: string
  ): Promise<ChunkInCacheTypes<AssetMapping>> {
    const chunkInCache: AssetMapping[] = [];
    const chunkNotCachedClassic: number[] = [];
    const chunkNotCachedDMS: DmsUniqueIdentifier[] = [];

    await Promise.all(
      currentChunk.map(async (id) => {
        if (typeof id === 'number' && type === 'nodeIds') {
          const key = modelRevisionNodesAssetToKey(modelId, revisionId, id);
          const cachedResult = await this.getItemCacheResult(type, key);
          if (cachedResult !== undefined) {
            chunkInCache.push(...cachedResult);
          } else {
            chunkNotCachedClassic.push(id);
          }
        } else if (typeof id !== 'number' && isDmsInstance(id)) {
          const key = createModelDMSUniqueInstanceKey(modelId, revisionId, id.space, id.externalId);
          const cachedResult = await this.getHybridItemCacheResult(key);
          if (cachedResult !== undefined) {
            chunkInCache.push(...cachedResult);
          } else {
            chunkNotCachedDMS.push(id);
          }
        }
      })
    );

    return {
      chunkInCache,
      chunkNotInCacheIdDMS: chunkNotCachedDMS,
      chunkNotInCacheIdClassic: chunkNotCachedClassic
    };
  }

  public async getItemCacheResult(
    type: string,
    key: ModelTreeIndexKey | ModelAssetIdKey
  ): Promise<AssetMapping[] | undefined> {
    return type === 'nodeIds'
      ? await this.nodeIdsToAssetMappingCache.getNodeIdsToAssetMappingCacheItem(key)
      : await this.assetIdsToAssetMappingCache.getAssetIdsToAssetMappingCacheItem(key);
  }

  public async getHybridItemCacheResult(
    key: ModelDMSUniqueInstanceKey
  ): Promise<AssetMapping[] | undefined> {
    return await this.assetInstanceIdsToAssetMappingCache.getAssetInstanceIdsToHybridAssetMappingCacheItem(
      key
    );
  }

  public setItemCacheResult(
    type: string,
    key: ModelTreeIndexKey | ModelAssetIdKey,
    item: AssetMapping[] | undefined
  ): void {
    const value = Promise.resolve(item ?? []);
    type === 'nodeIds'
      ? this.nodeIdsToAssetMappingCache.setNodeIdsToAssetMappingCacheItem(key, value)
      : this.assetIdsToAssetMappingCache.setAssetIdsToAssetMappingCacheItem(key, value);
  }

  public setHybridItemCacheResult(
    key: ModelDMSUniqueInstanceKey,
    item: AssetMapping[] | undefined
  ): void {
    const value = Promise.resolve(item ?? []);
    this.assetInstanceIdsToAssetMappingCache.setAssetInstanceIdsToHybridAssetMappingCacheItem(
      key,
      value
    );
  }

  private getFilterBasedOnType(
    type: string,
    ids: Array<number | DmsUniqueIdentifier>
  ): AssetMappings3DAssetFilter | AssetMappings3DNodeFilter | AssetMappings3DTreeIndexFilter {
    if (type === 'nodeIds') {
      return { nodeIds: ids.filter((id): id is number => typeof id === 'number') };
    }
    if (type === 'assetIds') {
      return { assetIds: ids.filter((id): id is number => typeof id === 'number') };
    }
    return { assetIds: [] };
  }

  private async fetchAssetMappingsRequest(
    currentChunk: number[],
    filterType: string,
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    let assetMapping3DClassic: AssetMapping[] = [];

    if (currentChunk.length === 0) {
      return [];
    }
    const filter = this.getFilterBasedOnType(filterType, currentChunk);

    assetMapping3DClassic = await this._sdk.assetMappings3D
      .filter(modelId, revisionId, {
        limit: 1000,
        filter
      })
      .autoPagingToArray({ limit: Infinity });

    await Promise.all([
      assetMapping3DClassic
        .map(async (item) => {
          if (item.assetId === undefined) return;
          const mapping: AssetMapping = {
            ...item,
            assetId: item.assetId,
            assetInstanceId: item.assetInstanceId
          };
          const keyAssetId: ModelAssetIdKey = modelRevisionNodesAssetToKey(
            modelId,
            revisionId,
            item.assetId
          );
          const keyNodeId = modelRevisionNodesAssetToKey(modelId, revisionId, item.nodeId);
          await this.assetIdsToAssetMappingCache.setAssetMappingsCacheItem(keyAssetId, mapping);
          await this.nodeIdsToAssetMappingCache.setAssetMappingsCacheItem(keyNodeId, mapping);
        })
        .filter((item) => isDefined(item))
    ]);

    return assetMapping3DClassic.filter(isValidAssetMapping);
  }

  private async fetchHybridAssetMappingsRequest(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    let assetMapping3DHybrid: AssetMapping[] = [];

    assetMapping3DHybrid = await this._sdk.assetMappings3D
      .filter(modelId, revisionId, {
        limit: 1000,
        filter: undefined,
        getDmsInstances: true
      })
      .autoPagingToArray({ limit: Infinity });

    await Promise.all([
      assetMapping3DHybrid.map(async (item) => {
        if (item.assetInstanceId === undefined) return;
        const mapping: AssetMapping = {
          ...item,
          assetId: item.assetId,
          assetInstanceId: item.assetInstanceId
        };
        const keyNodeId = modelRevisionNodesAssetToKey(modelId, revisionId, item.nodeId);
        const keyAssetInstanceId = createModelDMSUniqueInstanceKey(
          modelId,
          revisionId,
          item.assetInstanceId.space,
          item.assetInstanceId.externalId
        );
        await this.nodeIdsToAssetMappingCache.setAssetMappingsCacheItem(keyNodeId, mapping);
        await this.assetInstanceIdsToAssetMappingCache.setHybridAssetMappingsCacheItem(
          keyAssetInstanceId,
          mapping
        );
      })
    ]);

    return assetMapping3DHybrid.filter(isValidAssetMapping);
  }

  private async fetchMappingsInQueue(
    index: number,
    idChunks: number[][],
    filterType: string,
    modelId: ModelId,
    revisionId: RevisionId,
    assetMappingsList: AssetMapping[]
  ): Promise<AssetMapping[]> {
    const assetMappings = await this.fetchAssetMappingsRequest(
      idChunks[index],
      filterType,
      modelId,
      revisionId
    );

    assetMappingsList = assetMappingsList.concat(assetMappings);
    if (index >= idChunks.length - 1) {
      return assetMappingsList;
    }

    const nextIndex = index + 1;
    return await this.fetchMappingsInQueue(
      nextIndex,
      idChunks,
      filterType,
      modelId,
      revisionId,
      assetMappingsList
    );
  }

  private async fetchAndCacheMappingsForIds(
    modelId: ModelId,
    revisionId: RevisionId,
    ids: Array<number | DmsUniqueIdentifier>,
    filterType: string
  ): Promise<AssetMapping[]> {
    if (ids.length === 0) {
      return [];
    }
    const idChunks = chunk(ids, 1000);

    const numericIdChunks = idChunks.map((chunk) =>
      chunk.filter((id): id is number => typeof id === 'number')
    );

    const initialIndex = 0;
    const assetMappings = await this.fetchMappingsInQueue(
      initialIndex,
      numericIdChunks,
      filterType,
      modelId,
      revisionId,
      []
    );

    const mappings: AssetMapping[] = assetMappings.map((item) => {
      return {
        ...item,
        assetId: item.assetId,
        assetInstanceId: item.assetInstanceId
      };
    });
    return mappings;
  }

  private async getAssetMappingsForNodes(
    modelId: ModelId,
    revisionId: RevisionId,
    nodes: Node3D[]
  ): Promise<AssetMapping[]> {
    const nodeIds = nodes.map((node) => node.id);

    const { chunkNotInCacheIdClassic, chunkInCache } = await this.splitChunkInCacheAssetMappings(
      nodeIds,
      modelId,
      revisionId,
      'nodeIds'
    );

    if (chunkNotInCacheIdClassic === undefined || chunkNotInCacheIdClassic?.length === 0) {
      return chunkInCache;
    }
    const assetMappings = await this.fetchAndCacheMappingsForIds(
      modelId,
      revisionId,
      chunkNotInCacheIdClassic,
      'nodeIds'
    );

    const allAssetMappings = chunkInCache.concat(assetMappings);

    return allAssetMappings;
  }

  private async getHybridAssetMappingsForNodes(
    modelId: ModelId,
    revisionId: RevisionId,
    nodes: Node3D[]
  ): Promise<AssetMapping[]> {
    const nodeIds = nodes.map((node) => node.id);

    const { chunkNotInCacheIdClassic, chunkInCache } =
      await this.splitChunkInCacheHybridAssetMappings(nodeIds, modelId, revisionId, 'nodeIds');

    if (chunkNotInCacheIdClassic === undefined || chunkNotInCacheIdClassic?.length === 0) {
      return chunkInCache;
    }

    const assetMappings = await this.fetchAndCacheMappingsForIds(
      modelId,
      revisionId,
      chunkNotInCacheIdClassic,
      'nodeIds'
    );

    const allAssetMappings = chunkInCache.concat(assetMappings);

    return allAssetMappings;
  }

  private async getAssetMappingsForAssetIds(
    modelId: ModelId,
    revisionId: RevisionId,
    assetIds: number[]
  ): Promise<AssetMapping[]> {
    const { chunkNotInCacheIdClassic, chunkInCache } = await this.splitChunkInCacheAssetMappings(
      assetIds,
      modelId,
      revisionId,
      'assetIds'
    );

    if (chunkNotInCacheIdClassic === undefined || chunkNotInCacheIdClassic?.length === 0) {
      return chunkInCache;
    }

    const assetMappings = await this.fetchAndCacheMappingsForIds(
      modelId,
      revisionId,
      chunkNotInCacheIdClassic,
      'assetIds'
    );
    const allAssetMappings = chunkInCache.concat(assetMappings);
    return allAssetMappings;
  }

  private async getHybridAssetMappingsForAssetInstances(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    const hybridAssetMappings = await this.fetchHybridAssetMappingsRequest(modelId, revisionId);

    return hybridAssetMappings;
  }
}
