/*!
 * Copyright 2024 Cognite AS
 */
import { type ModelTreeIndexKey } from './types';
import { type AssetMapping } from './AssetMappingAndNode3DCache';

export class AssetMappingPerNodeIdCache {
  private readonly _nodeIdsToAssetMappings = new Map<ModelTreeIndexKey, Promise<AssetMapping[]>>();

  public setNodeIdsToAssetMappingCacheItem(
    key: ModelTreeIndexKey,
    item: Promise<AssetMapping[]>
  ): void {
    this._nodeIdsToAssetMappings.set(key, Promise.resolve(item));
  }

  public async getNodeIdsToAssetMappingCacheItem(
    key: ModelTreeIndexKey
  ): Promise<AssetMapping[] | undefined> {
    return await this._nodeIdsToAssetMappings.get(key);
  }

  public async setAssetMappingsCacheItem(
    key: ModelTreeIndexKey,
    item: AssetMapping
  ): Promise<void> {
    const currentAssetMappings = this.getNodeIdsToAssetMappingCacheItem(key);
    this.setNodeIdsToAssetMappingCacheItem(
      key,
      currentAssetMappings.then((value) => {
        if (value === undefined) {
          return [item];
        }
        value.push(item);
        return value;
      })
    );
  }
}
