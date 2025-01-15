/*!
 * Copyright 2025 Cognite AS
 */
import { type ExternalId, type IdEither, type InternalId } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { isExternalId, isInternalId } from './typeGuards';

export function isSameDmsId(id0: DmsUniqueIdentifier, id1: DmsUniqueIdentifier): boolean {
  return id0.externalId === id1.externalId && id0.space === id1.space;
}

export function isSameIdEither(id0: IdEither, id1: IdEither): boolean {
  return (
    (isInternalId(id0) && isInternalId(id1) && isSameInternalId(id0, id1)) ||
    (isExternalId(id0) && isExternalId(id1) && isSameExternalId(id0, id1))
  );
}

export function isSameInternalId(id0: InternalId, id1: InternalId): boolean {
  return id0.id === id1.id;
}

export function isSameExternalId(id0: ExternalId, id1: ExternalId): boolean {
  return id0.externalId === id1.externalId;
}
