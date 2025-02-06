/*!
 * Copyright 2024 Cognite AS
 */

import {
  type CogniteCadModel,
  type Image360Collection,
  type CognitePointCloudModel,
  type DataSourceType
} from '@cognite/reveal';

export type PointCloud = CognitePointCloudModel<DataSourceType>;
export type Image360Model = Image360Collection<DataSourceType>;

export type RevealModel = PointCloud | Image360Model | CogniteCadModel;
