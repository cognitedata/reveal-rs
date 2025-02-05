/*!
 * Copyright 2024 Cognite AS
 */

import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_IMAGE_360_ANNOTATION_SOURCE } from './dataModels';

export const cogniteImage360AnnotationSourceWithProperties = [
  {
    source: COGNITE_IMAGE_360_ANNOTATION_SOURCE,
    properties: [
      'name',
      'description',
      'tags',
      'aliases',
      'sourceId',
      'sourceContext',
      'source',
      'sourceCreatedTime',
      'sourceUpdatedTime',
      'sourceCreatedUser',
      'sourceUpdatedUser',
      'confidence',
      'status',
      'polygon',
      'formatVersion'
    ]
  }
] as const satisfies SourceSelectorV3;
