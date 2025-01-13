/*!
 * Copyright 2024 Cognite AS
 */
import { type AssetMapping3D, type CogniteClient } from '@cognite/sdk';
import { type ModelId, type RevisionId, type ModelRevisionKey } from './types';
import { type AssetMapping } from './AssetMappingAndNode3DCache';
import { isValidAssetMapping } from './utils';
import { createModelRevisionKey } from './idAndKeyTranslation';
import { isDefined } from '../../utilities/isDefined';

export class AssetMappingPerModelCache {
  private readonly _sdk: CogniteClient;

  private readonly _modelToAssetMappings = new Map<ModelRevisionKey, Promise<AssetMapping[]>>();

  private readonly isCoreDmOnly: boolean;

  constructor(sdk: CogniteClient, coreDmOnly: boolean) {
    this._sdk = sdk;
    this.isCoreDmOnly = coreDmOnly;
  }

  public setModelToAssetMappingCacheItems(
    key: ModelRevisionKey,
    assetMappings: Promise<AssetMapping[]>
  ): void {
    this._modelToAssetMappings.set(key, assetMappings);
  }

  public async getModelToAssetMappingCacheItems(
    key: ModelRevisionKey
  ): Promise<AssetMapping[] | undefined> {
    return await this._modelToAssetMappings.get(key);
  }

  public async fetchAndCacheMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    const key = createModelRevisionKey(modelId, revisionId);
    const assetMappings = this.fetchAssetMappingsForModel(modelId, revisionId);

    this.setModelToAssetMappingCacheItems(key, assetMappings);
    return await assetMappings;
  }

  private async fetchAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    const assetMappingsClassic = await this.fetchAssetMappingsForModelClassic(modelId, revisionId);
    const assetMappingsCoreDms = await this.fetchAssetMappingsForModelCoreDms(modelId, revisionId);

    console.log('TEST fetchAssetMappingsForModel assetMappingsClassic', assetMappingsClassic);
    console.log('TEST fetchAssetMappingsForModel assetMappingsCoreDms', assetMappingsCoreDms);

    const allAssetMappings = assetMappingsClassic.concat(assetMappingsCoreDms);

    console.log('TEST fetchAssetMappingsForModel allAssetMappings', allAssetMappings);
    return allAssetMappings;
  }

  private async fetchAssetMappingsForModelClassic(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    const filterQuery = {
      limit: 1000
    };

    const assetMappings = await this._sdk.assetMappings3D
      .list(modelId, revisionId, filterQuery)
      .autoPagingToArray({ limit: Infinity });

    return assetMappings.filter(isValidAssetMapping).map((mapping) => {
      const newMapping = {
        ...mapping,
        assetId: mapping.assetId
      };
      return newMapping;
    });
  }

  private async fetchAssetMappingsForModelCoreDms(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    if (this.isCoreDmOnly) return [];

    const filterQuery = {
      limit: 1000,
      getDmsInstances: true
    };

    const assetMappings = await this._sdk.assetMappings3D
      .list(modelId, revisionId, filterQuery)
      .autoPagingToArray({ limit: Infinity });

    const requests = assetMappings.map((mapping) => ({ id: mapping.nodeId }));

    const nodes = await this.getNode3DInfoFromNodeIds(modelId, revisionId, requests);

    return assetMappings
      .map((mapping) => {
        const nodeFound = nodes.find((node) => node.id === mapping.nodeId);
        if (nodeFound === undefined) return undefined;

        const newMapping: NonNullable<AssetMapping3D> = {
          ...mapping,
          nodeId: mapping.nodeId,
          treeIndex: nodeFound.treeIndex,
          subtreeSize: nodeFound.subtreeSize,
          assetId: mapping.assetId,
          assetInstanceId: mapping.assetInstanceId
        };
        console.log('TEST fetchAssetMappingsForModelCoreDms newMapping', newMapping);
        return newMapping;
      })
      .filter((mapping) => isDefined(mapping));
  }

  private async getNode3DInfoFromNodeIds(
    modelId: ModelId,
    revisionId: RevisionId,
    nodeIds: Array<{ id: number }>
  ): Promise<Array<{ treeIndex: number; subtreeSize: number; id: number }>> {
    try {
      const nodes = await this._sdk.revisions3D.retrieve3DNodes(modelId, revisionId, nodeIds);
      return nodes.map((node) => {
        return { treeIndex: node.treeIndex, subtreeSize: node.subtreeSize, id: node.id };
      });
    } catch (error) {
      console.error('Error fetching node3DInfo', error);
      return [];
    }
  }
}
