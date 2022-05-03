import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { singleton } from '@keenondrums/singleton';
import { BaseDetectionModelDataProvider } from 'src/api/vision/detectionModels/BaseDetectionModelDataProvider';
import { getDetectionModelEndpoint } from 'src/api/vision/detectionModels/detectionUtils';

@singleton
export class GaugeReaderDataProvider extends BaseDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionDetectionModelType.GaugeReader);
}
