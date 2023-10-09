import { singleton } from '@keenondrums/singleton';

import { BaseLegacyDetectionModelDataProvider } from '../BaseLegacyDetectionModelDataProvider';
import { getDetectionModelEndpoint } from '../detectionUtils';
import { VisionDetectionModelType } from '../types';

@singleton
export class GaugeReaderDataProvider extends BaseLegacyDetectionModelDataProvider {
  url = getDetectionModelEndpoint(VisionDetectionModelType.GaugeReader);
}
