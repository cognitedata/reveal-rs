/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObjectCollection } from '@reveal/data-providers';
import { CompletePointCloudAppearance } from './PointCloudAppearance';

/**
 * Represents an object collection that is associated with an appearance
 */
export class StyledPointCloudObjectCollection {
  constructor(public objectCollection: PointCloudObjectCollection, public style: CompletePointCloudAppearance) {}
}
