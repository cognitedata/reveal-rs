/*!
 * Copyright 2025 Cognite AS
 */
import { createFdmKey } from '../../components/CacheProvider/idAndKeyTranslation';
import { assertNever } from '../assertNever';
import {
  isDmsInstance,
  isExternalId,
  isHybridAssetCoreDmsInstance,
  isInternalId,
  isAssetInstanceReference
} from './typeGuards';
import { type InstanceReference } from './types';

export type InstanceReferenceKey = string;

export function createInstanceReferenceKey(
  instanceReference: InstanceReference
): InstanceReferenceKey {
  if (isDmsInstance(instanceReference)) {
    return createFdmKey(instanceReference);
  } else if (isInternalId(instanceReference)) {
    return String(instanceReference.id);
  } else if (isExternalId(instanceReference)) {
    return instanceReference.externalId;
  } else if (isHybridAssetCoreDmsInstance(instanceReference)) {
    return createFdmKey(instanceReference.assetInstanceId);
  } else if (isAssetInstanceReference(instanceReference)) {
    return instanceReference.assetId.toString();
  }

  assertNever(instanceReference);
}
