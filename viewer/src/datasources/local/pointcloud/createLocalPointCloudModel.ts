/*!
 * Copyright 2019 Cognite AS
 */

import { mat4 } from 'gl-matrix';
import { PointCloudModel } from '../../PointCloudModel';
import { FetchPointCloudDelegate } from '../../../models/pointclouds/delegates';
import { SectorModelTransformation } from '../../../models/cad/types';
import { PointCloudLoader } from '../../../utils/potree/PointCloudLoader';
import { EptLoader } from '../../../utils/potree/EptLoader';

const identity = mat4.identity(mat4.create());

export function createLocalPointCloudModel(url: string): PointCloudModel {
  const fetchPointCloud: FetchPointCloudDelegate = async () => {
    const transform: SectorModelTransformation = {
      modelMatrix: identity,
      inverseModelMatrix: identity
    };

    if (url.endsWith('ept.json')) {
      // Entwine format
      return [await EptLoader.load(url), transform];
    } else {
      // Potree format
      return [await PointCloudLoader.load(url), transform];
    }
  };
  return [fetchPointCloud];
}
