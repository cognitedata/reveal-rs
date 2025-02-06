/*!
 * Copyright 2024 Cognite AS
 */
import { type ModelAssetIdKey } from './types';
import { type AssetMapping } from './AssetMappingAndNode3DCache';

export class AssetMappingPerAssetIdCache {
  private readonly _assetIdsToAssetMappings = new Map<ModelAssetIdKey, Promise<AssetMapping[]>>();

  public setAssetIdsToAssetMappingCacheItem(
    key: ModelAssetIdKey,
    item: Promise<AssetMapping[]>
  ): void {
    this._assetIdsToAssetMappings.set(key, Promise.resolve(item));
  }

  public async getAssetIdsToAssetMappingCacheItem(
    key: ModelAssetIdKey
  ): Promise<AssetMapping[] | undefined> {
    return await this._assetIdsToAssetMappings.get(key);
  }

  public async setAssetMappingsCacheItem(key: ModelAssetIdKey, item: AssetMapping): Promise<void> {
    const currentAssetMappings = this.getAssetIdsToAssetMappingCacheItem(key);
    this.setAssetIdsToAssetMappingCacheItem(
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
