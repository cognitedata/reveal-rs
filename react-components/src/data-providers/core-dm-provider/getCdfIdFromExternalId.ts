/*!
 * Copyright 2024 Cognite AS
 */

import { type ModelId, type RevisionId } from '../../components/CacheProvider/types';

export function getModelIdFromExternalId(externalId: string): ModelId {
  // The externalId should be on the form `cog_3d_model_${modelId}`
  return Number(externalId.slice('cog_3d_model_'.length));
}

export function getRevisionIdFromExternalId(externalId: string): RevisionId {
  // The externalId should be on the form `revision_${modelId}_${revisionId}`
  const [_prefix, _modelId, revisionId] = externalId.split('_');
  return Number(revisionId);
}
