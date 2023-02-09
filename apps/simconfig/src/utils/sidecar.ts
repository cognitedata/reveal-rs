/* eslint-disable @typescript-eslint/naming-convention */
import type { CDFCluster, SidecarConfig } from '@cognite/sidecar';
import { getDefaultSidecar } from '@cognite/sidecar';

// # -------------------------------------
// #
// #
// #
// # ONLY CHANGE THESE THINGS: (affects localhost only)
// #
// #
const PROD = false;
// examples: bluefield, greenfield, ew1, bp-northeurope, azure-dev, bp,
// westeurope-1 NOTE: leave on 'azure-dev' for testing in the PR's since that
// is the only place we have the FAKEIdp currently for this project:

const CLUSTER: CDFCluster =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  (process.env.REACT_APP_CLUSTER as CDFCluster) ??
  ('westeurope-1' as CDFCluster);
const LOCAL_SERVICE = Boolean(process.env.REACT_APP_LOCAL_SERVICE) || false;
// #
// #
// #
// # -------------------------------------

const getAadApplicationId = (cluster: string) => {
  const ids: Record<string, string> = {
    'bluefield': '245a8a64-4142-4226-86fa-63d590de14c9',
    'azure-dev': '9d30a99f-4209-470d-8389-c8390c3007fe',
    'ew1': '9686d16c-284e-47a0-8714-9b0b1faed2a0',
    'westeurope-1': '83e4fd8b-321f-4e35-89f9-80dde739a713',
  };

  const aadApplicationId = ids[cluster] || '';

  return {
    aadApplicationId,
  };
};

declare global {
  interface Window {
    __cogniteSidecar: Record<string, unknown> & SidecarConfig;
  }
}

// we are overwriting the window.__cogniteSidecar object because the tenant-selector
// reads from this variable, so when you test on localhost, it (TSA) will not access via this file
// but via the window.__cogniteSidecar global
// now that this var is updated, all should work as expected.
window.__cogniteSidecar = {
  ...getAadApplicationId(CLUSTER),
  ...getDefaultSidecar({
    prod: PROD,
    cluster: CLUSTER,
    localServices: LOCAL_SERVICE ? ['simconfig-api'] : [],
  }),
  nomaApiBaseUrl: 'https://noma.development.cognite.ai',
  locize: {
    keySeparator: false,
    projectId: '1ee63b21-27c7-44ad-891f-4bd9af378b72', // <- move this to release-configs
    version: 'Production', // <- move this to release-configs
  },
  intercomSettings: {
    app_id: 'ou1uyk2p',
    hide_default_launcher: true,
  },
  disableIntercom: true,

  ...window.__cogniteSidecar,

  __sidecarFormatVersion: 1,

  // to be used only locally as a sidecar placeholder
  // when deployed with FAS the values below are partly overriden
  applicationId: 'simconfig',
  applicationName: 'Simulator Configuration App (staging)',
  docsSiteBaseUrl: 'https://docs.cognite.com',
  mixpanel: process.env.REACT_APP_MIXPANEL_TOKEN,
};

export default window.__cogniteSidecar;
