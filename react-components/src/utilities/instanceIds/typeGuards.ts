/*!
 * Copyright 2025 Cognite AS
 */
import { type ExternalId, type IdEither, type InternalId } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { type AssetHybridInstanceReference, type InstanceReference } from './types';

export function isIdEither(instance: InstanceReference): instance is IdEither {
  return (
    (instance as ExternalId).externalId !== undefined || (instance as InternalId).id !== undefined
  );
}

export function isExternalId(idEither: IdEither): idEither is ExternalId {
  return 'externalId' in idEither && !('space' in idEither);
}

export function isInternalId(idEither: IdEither): idEither is InternalId {
  return 'id' in idEither;
}

export function isDmsInstance(instance: InstanceReference): instance is DmsUniqueIdentifier {
  return 'externalId' in instance && 'space' in instance;
}

export function isHybridAssetCoreDmsInstance(
  instance: InstanceReference
): instance is AssetHybridInstanceReference {
  return 'assetInstanceId' in instance && isDmsInstance(instance.assetInstanceId);
}
