/*!
 * Copyright 2024 Cognite AS
 */
import { type AddModelOptions, type DataSourceType } from '@cognite/reveal';
import {
  type AddImage360CollectionDatamodelsOptions,
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components';

export const getModelKeys = (
  models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>
): string[] => {
  return models.map((model) => {
    if (isClassicIdentifier(model)) {
      return `${model.modelId}/${model.revisionId}`;
    } else if (isDM3DModelIdentifier(model)) {
      return `${model.revisionExternalId}/${model.revisionSpace}`;
    }
    return '';
  });
};
