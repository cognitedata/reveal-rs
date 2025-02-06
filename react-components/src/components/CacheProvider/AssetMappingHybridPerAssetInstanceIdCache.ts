/*!
 * Copyright 2024 Cognite AS
 */
import { type AssetMapping, type ModelDMSUniqueInstanceKey } from './types';

export class AssetMappingHybridPerAssetInstanceIdCache {
  private readonly _assetInstanceIdsToHybridAssetMappings = new Map<
    ModelDMSUniqueInstanceKey,
    Promise<AssetMapping[]>
  >();

  public setAssetInstanceIdsToHybridAssetMappingCacheItem(
    key: ModelDMSUniqueInstanceKey,
    item: Promise<AssetMapping[]>
  ): void {
    this._assetInstanceIdsToHybridAssetMappings.set(key, item);
  }

  public async getAssetInstanceIdsToHybridAssetMappingCacheItem(
    key: ModelDMSUniqueInstanceKey
  ): Promise<AssetMapping[] | undefined> {
    return await this._assetInstanceIdsToHybridAssetMappings.get(key);
  }

  public async setHybridAssetMappingsCacheItem(
    key: ModelDMSUniqueInstanceKey,
    item: AssetMapping
  ): Promise<void> {
    const currentAssetMappings = await this.getAssetInstanceIdsToHybridAssetMappingCacheItem(key);
    if (currentAssetMappings === undefined) {
      this.setAssetInstanceIdsToHybridAssetMappingCacheItem(key, Promise.resolve([item]));
      return;
    }
    currentAssetMappings.push(item);
  }
}
