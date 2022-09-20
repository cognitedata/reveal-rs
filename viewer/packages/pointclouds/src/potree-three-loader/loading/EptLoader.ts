import { ModelDataProvider } from '@reveal/modeldata-api';
import { DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE } from '../../constants';
import { PointCloudObjectAnnotationData } from '../../styling/PointCloudObjectAnnotationData';
import { PointCloudEptGeometry } from '../geometry/PointCloudEptGeometry';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import { ClassificationInfo } from './ClassificationInfo';
import { EptJson } from './EptJson';

export class EptLoader {
  static async load(
    baseUrl: string,
    fileName: string,
    modelDataProvider: ModelDataProvider,
    objectProvider: PointCloudObjectAnnotationData
  ): Promise<[PointCloudEptGeometry, ClassificationInfo | undefined]> {
    const eptJsonPromise = modelDataProvider.getJsonFile(baseUrl, fileName);

    const classesJsonPromise: Promise<ClassificationInfo | undefined> = modelDataProvider
      .getJsonFile(baseUrl, DEFAULT_POINT_CLOUD_CLASS_DEFINITION_FILE)
      .then(json => json as ClassificationInfo)
      .catch(_ => {
        // Classes file not found, ignoring
        return undefined;
      });

    return eptJsonPromise.then(async (json: EptJson) => {
      const url = baseUrl + '/';
      const stylableObjects = objectProvider.annotations.map(a => a.stylableObject);
      const geometry = new PointCloudEptGeometry(url, json, modelDataProvider, stylableObjects);
      const root = new PointCloudEptGeometryNode(geometry, modelDataProvider);

      geometry.root = root;
      await geometry.root.load();
      return [geometry, await classesJsonPromise];
    });
  }
}
