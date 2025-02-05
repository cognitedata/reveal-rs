/*!
 * Copyright 2025 Cognite AS
 */
import { type ExternalId, type IdEither, type InternalId } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { type InstanceReference } from './types';

export type AnnotationAssetRef = { externalId?: string; space?: string };

export function isIdEither(instance: InstanceReference | AnnotationAssetRef): instance is IdEither {
  return isExternalId(instance) || isInternalId(instance);
}

export function isExternalId(idEither: IdEither | AnnotationAssetRef): idEither is ExternalId {
  return 'externalId' in idEither && !('space' in idEither);
}

export function isInternalId(idEither: IdEither | AnnotationAssetRef): idEither is InternalId {
  return 'id' in idEither;
}

export function isDmsInstance(instance: InstanceReference): instance is DmsUniqueIdentifier {
  return 'externalId' in instance && 'space' in instance;
}
