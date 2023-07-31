import { normalize } from 'domain/documents/internal/transformers/normalize';

import isEmpty from 'lodash/isEmpty';

import { Document } from '@cognite/sdk';

import { documentSearchService } from 'modules/documentSearch/service';
import { DocumentType } from 'modules/documentSearch/types';

export const searchDocumentById = (
  id: Document['id']
): Promise<DocumentType | undefined> => {
  return documentSearchService.documentsByIds([id]).then((result) => {
    if (isEmpty(result.items)) {
      return undefined;
    }
    return normalize(result.items[0].item);
  });
};
