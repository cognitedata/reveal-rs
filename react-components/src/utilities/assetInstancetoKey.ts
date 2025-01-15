/*!
 * Copyright 2025 Cognite AS
 */
import { type Asset } from '@cognite/sdk';
import { type AssetProperties } from '../data-providers/core-dm-provider/utils/filters';
import { type FdmNode } from '../data-providers/FdmSDK';
import { createFdmKey } from '../components/CacheProvider/idAndKeyTranslation';

export function assetInstanceToKey(asset: Asset | FdmNode<AssetProperties>): string {
  if (isDmAsset(asset)) {
    return createFdmKey(asset);
  } else {
    return String(asset.id);
  }
}

function isDmAsset(
  instance: Asset | FdmNode<AssetProperties>
): instance is FdmNode<AssetProperties> {
  return (
    (instance as FdmNode<AssetProperties>).externalId !== undefined &&
    (instance as FdmNode<AssetProperties>).space !== undefined
  );
}
