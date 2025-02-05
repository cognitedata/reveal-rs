/*!
 * Copyright 2024 Cognite AS
 */
import {
  is360ImageDataModelAddOptions,
  is360ImageEventsAddOptions,
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components/Reveal3DResources/typeGuards';
import { type TaggedAddResourceOptions } from '../components/Reveal3DResources/types';

export function createAddOptionsKey(model: TaggedAddResourceOptions): string {
  const { type, addOptions } = model;

  switch (type) {
    case 'cad':
      return `${type}-${addOptions.modelId}-${addOptions.revisionId}`;
    case 'pointcloud':
      if (isClassicIdentifier(addOptions)) {
        return `${type}-${addOptions.modelId}-${addOptions.revisionId}`;
      }
      if (isDM3DModelIdentifier(addOptions)) {
        return `${type}-${addOptions.revisionExternalId}-${addOptions.revisionSpace}`;
      }
      break;
    case 'image360':
      if (is360ImageDataModelAddOptions(addOptions)) {
        return `${type}-${addOptions.externalId}/${addOptions.space}`;
      }
      if (is360ImageEventsAddOptions(addOptions)) {
        return `${type}-${addOptions.siteId}`;
      }
      break;
    default:
      throw new Error('Unrecognized add option type');
  }

  throw new Error('Unrecognized add option type');
}
