/*!
 * Copyright 2024 Cognite AS
 */
import { type NodeAppearance } from '@cognite/reveal';
import { type InstanceStylingGroup } from '.';
import { type InstanceReference, isDmsInstance, isInternalId } from '../../utilities/instanceIds';

export function createInstanceStyleGroup(
  instances: InstanceReference[],
  style: NodeAppearance
): InstanceStylingGroup {
  if (instances.every(isInternalId)) {
    return {
      assetIds: instances.map((instance) => instance.id),
      style: { cad: style, pointcloud: style, image360: style }
    };
  } else if (instances.every(isDmsInstance)) {
    return {
      fdmAssetExternalIds: instances,
      style: { cad: style, pointcloud: style, image360: style }
    };
  }

  throw Error('Error, all instances must be of same type in createInstanceStyle');
}
