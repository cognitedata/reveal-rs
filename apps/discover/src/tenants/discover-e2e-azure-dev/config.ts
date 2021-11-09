import { defaultWellsConfig } from 'tenants/config';

import config from '../discover-e2e-config';

/**
 * This config should be sync with `discover-e2-bluefield` tenant.
 * If there are changes to be made, add them to '../test-config.ts'.
 */
export default {
  ...config,

  enableWellSDKV3: true,

  wells: {
    ...config.wells,
    nds: {
      enabled: true,
    },
    npt: {
      enabled: true,
    },
    trajectory: defaultWellsConfig.wells?.trajectory,
    casing: defaultWellsConfig.wells?.casing,
  },
  documents: config.documents
    ? {
        ...config.documents,
        mapLayerFilters: {
          discoveries: {
            labelAccessor: 'Discovery',
          },
        },
      }
    : undefined,
};
