import { getWellSDKClient } from 'domain/wells/utils/authenticate';

import { fetchAllCursors, FetchOptions } from 'utils/fetchAllCursors';

import { Well, WellFilterRequest } from '@cognite/sdk-wells';

export const getWellsByFilter = ({
  wellFilterRequest,
  options,
}: {
  wellFilterRequest: WellFilterRequest;
  options?: FetchOptions;
}) => {
  return fetchAllCursors<Well>({
    signal: options?.signal,
    action: getWellSDKClient().wells.list,
    actionProps: { ...wellFilterRequest },
  });
};
