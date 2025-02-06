/*!
 * Copyright 2024 Cognite AS
 */

import {
  type FdmAssetStylingGroup,
  type AssetStylingGroup,
  type Image360AssetStylingGroup,
  type InstanceStylingGroup,
  type Image360DMAssetStylingGroup,
  type HybridFdmAssetStylingGroup
} from '../components/Reveal3DResources/types';

export function isFdmAssetStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is FdmAssetStylingGroup {
  return (instanceGroup as FdmAssetStylingGroup).fdmAssetExternalIds !== undefined;
}

export function isHybridFdmAssetStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is HybridFdmAssetStylingGroup {
  return (instanceGroup as HybridFdmAssetStylingGroup).hybridFdmAssetExternalIds !== undefined;
}

export function isClassicAssetMappingStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is AssetStylingGroup {
  return (instanceGroup as AssetStylingGroup).assetIds !== undefined;
}

export function isImage360AssetStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is Image360AssetStylingGroup {
  return (instanceGroup as Image360AssetStylingGroup).assetIds !== undefined;
}

export function isImage360DMAssetStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is Image360DMAssetStylingGroup {
  return (instanceGroup as Image360DMAssetStylingGroup).assetRefs !== undefined;
}

export function isImage360AssetMappingStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is Image360AssetStylingGroup | Image360DMAssetStylingGroup {
  return isImage360AssetStylingGroup(instanceGroup) || isImage360DMAssetStylingGroup(instanceGroup);
}

export function isAssetMappingStylingGroup(
  instanceGroup: InstanceStylingGroup
): instanceGroup is FdmAssetStylingGroup | AssetStylingGroup {
  return (
    isClassicAssetMappingStylingGroup(instanceGroup) ||
    isFdmAssetStylingGroup(instanceGroup) ||
    isHybridFdmAssetStylingGroup(instanceGroup)
  );
}
