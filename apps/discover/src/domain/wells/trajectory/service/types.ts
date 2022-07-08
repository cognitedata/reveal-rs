import { TrajectoryDataRequest } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

export interface TrajectoriesDataRequest {
  sequenceExternalIds: Set<TrajectoryDataRequest['sequenceExternalId']>;
  unit?: UserPreferredUnit;
}

export interface ResponseItemType {
  wellboreMatchingId: string;
  wellboreAssetExternalId: string;
}
