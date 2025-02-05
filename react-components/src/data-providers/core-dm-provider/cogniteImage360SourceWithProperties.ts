/*!
 * Copyright 2024 Cognite AS
 */

import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_IMAGE_360_SOURCE } from './dataModels';

export const cogniteImage360SourceWithProperties = [
  {
    source: COGNITE_IMAGE_360_SOURCE,
    properties: [
      'translationX',
      'translationY',
      'translationZ',
      'eulerRotationX',
      'eulerRotationY',
      'eulerRotationZ',
      'scaleX',
      'scaleY',
      'scaleZ',
      'front',
      'back',
      'left',
      'right',
      'top',
      'bottom',
      'collection360',
      'station360',
      'takenAt'
    ]
  }
] as const satisfies SourceSelectorV3;
