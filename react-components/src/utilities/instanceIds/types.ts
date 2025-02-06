/*!
 * Copyright 2025 Cognite AS
 */
import { type IdEither } from '@cognite/sdk';
import { type DmsUniqueIdentifier, type Source } from '../../data-providers';

export type FdmInstanceWithView = DmsUniqueIdentifier & { view: Source };
export type AssetInstanceReference = { assetId: number };
export type AssetHybridInstanceReference = { assetInstanceId: DmsUniqueIdentifier };
export type InstanceReference =
  | IdEither
  | DmsUniqueIdentifier
  | AssetHybridInstanceReference
  | AssetInstanceReference;
