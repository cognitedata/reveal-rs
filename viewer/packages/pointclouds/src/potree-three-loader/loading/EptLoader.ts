import { ModelDataProvider } from '@reveal/modeldata-api';
import { PointCloudObjectProvider } from '../../styling/PointCloudObjectProvider';
import { PointCloudEptGeometry } from '../geometry/PointCloudEptGeometry';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import { EptJson } from './EptJson';

export class EptLoader {
  static async load(
    baseUrl: string,
    fileName: string,
    modelDataProvider: ModelDataProvider,
    objectProvider: PointCloudObjectProvider
  ): Promise<PointCloudEptGeometry> {
    return modelDataProvider.getJsonFile(baseUrl, fileName).then(async (json: EptJson) => {
      const url = baseUrl + '/';
      const geometry = new PointCloudEptGeometry(
        url,
        json,
        modelDataProvider,
        objectProvider.annotations.map(a => a.stylableObject)
      );
      const root = new PointCloudEptGeometryNode(geometry, modelDataProvider);

      geometry.root = root;
      await geometry.root.load();
      return geometry;
    });
  }
}
