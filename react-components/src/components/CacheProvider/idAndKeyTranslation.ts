/*!
 * Copyright 2023 Cognite AS
 */

import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import {
  type FdmKey,
  type ModelTreeIndexKey,
  type ModelRevisionKey,
  type TreeIndex,
  type RevisionId,
  type ModelId,
  type ModelAssetIdKey,
  type ModelDMSUniqueInstanceKey
} from './types';

import { split } from 'lodash';

export function createModelRevisionKey(modelId: ModelId, revisionId: RevisionId): ModelRevisionKey {
  return `${modelId}/${revisionId}`;
}

export function revisionKeyToIds(revisionKey: ModelRevisionKey): [ModelId, RevisionId] {
  const components = split(revisionKey, '/');
  return [Number(components[0]), Number(components[1])];
}

export function createModelTreeIndexKey(
  modelId: ModelId,
  revisionId: RevisionId,
  treeIndex: TreeIndex
): ModelTreeIndexKey {
  return `${modelId}/${revisionId}/${treeIndex}`;
}

export function createModelDMSUniqueInstanceKey(
  modelId: ModelId,
  revisionId: RevisionId,
  space: string,
  externalId: string
): ModelDMSUniqueInstanceKey {
  return `${modelId}/${revisionId}/${space}/${externalId}`;
}

export function createFdmKey(id: DmsUniqueIdentifier): FdmKey {
  return `${id.space}/${id.externalId}`;
}

export function modelRevisionNodesAssetToKey(
  modelId: ModelId,
  revisionId: RevisionId,
  id: number
): ModelAssetIdKey {
  return `${modelId}/${revisionId}/${id}`;
}
