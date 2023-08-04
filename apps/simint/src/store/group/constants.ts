import { RequestStatus } from '@simint-app/store/constants';

import type { GroupState } from './types';

export const initialState: GroupState = {
  requestStatus: RequestStatus.Idle,
  initialized: false,
  groups: [],
};
