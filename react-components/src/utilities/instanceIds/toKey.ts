/*!
 * Copyright 2025 Cognite AS
 */
import { createFdmKey } from '../../components/CacheProvider/idAndKeyTranslation';
import { assertNever } from '../assertNever';
import { isDmsInstance, isExternalId, isInternalId } from './typeGuards';
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
  }

  assertNever(instanceReference);
}
