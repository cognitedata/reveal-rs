/*!
 * Copyright 2024 Cognite AS
 */

import { CognitePointCloudModel, type DataSourceType, type Cognite3DViewer } from '@cognite/reveal';

import { type Matrix4 } from 'three';
import { type PointCloud } from '../../reveal/RevealTypes';

export const getGlobalMatrix = (args: {
  modelId: number;
  viewer: Cognite3DViewer<DataSourceType>;
}): Matrix4 | null => {
  const pointCloudModel = getPointCloud(args.modelId, args.viewer);
  if (pointCloudModel === undefined) {
    return null;
  }
  return pointCloudModel.getCdfToDefaultModelTransformation();
};

function getPointCloud(
  modelId: number,
  viewer: Cognite3DViewer<DataSourceType>
): PointCloud | undefined {
  return viewer.models
    .filter((model) => model instanceof CognitePointCloudModel)
    .find((model) => model instanceof CognitePointCloudModel && model.modelId === modelId);
}
