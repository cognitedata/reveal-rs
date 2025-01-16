/*!
 * Copyright 2025 Cognite AS
 */
import { type Asset } from '@cognite/sdk/dist/src';
import { type AssetInstance } from './AssetInstance';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import { isDmsInstance } from '../instanceIds';
import { type FdmNode } from '../../data-providers/FdmSDK';

export function isDmAsset(asset: AssetInstance): asset is FdmNode<AssetProperties> {
  return isDmsInstance(asset);
}

export function isClassicAsset(asset: AssetInstance): asset is Asset {
  const assetId = (asset as Asset).id;
  return assetId !== undefined && typeof assetId === 'number';
}
