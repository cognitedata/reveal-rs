/*!
 * Copyright 2021 Cognite AS
 */

export { CogniteModelBase } from './public/migration/CogniteModelBase';
export { Cognite3DModel } from './public/migration/Cognite3DModel';
export { CognitePointCloudModel } from './public/migration/CognitePointCloudModel';
export { Cognite3DViewer } from './public/migration/Cognite3DViewer';
export {
  Color,
  Cognite3DViewerOptions,
  AddModelOptions,
  Intersection,
  CameraConfiguration
} from './public/migration/types';

const REVEAL_VERSION = process.env.VERSION;
export { REVEAL_VERSION };
