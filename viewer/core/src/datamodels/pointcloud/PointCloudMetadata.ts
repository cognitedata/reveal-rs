/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CameraConfiguration } from '@reveal/utilities';

export interface PointCloudMetadata {
  modelBaseUrl: string;
  modelMatrix: THREE.Matrix4;
  cameraConfiguration?: CameraConfiguration;
  scene: any;
}
