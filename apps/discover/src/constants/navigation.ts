/* search */

const SEARCH = '/search';
const SEARCH_DOCUMENTS = `${SEARCH}/documents`;
const SEARCH_DOCUMENTS_INSPECT = `${SEARCH_DOCUMENTS}/inspect`;
const SEARCH_SEISMIC = `${SEARCH}/seismic`;
const SEARCH_WELLS = `${SEARCH}/wells`;
const SEARCH_WELLS_INSPECT = `${SEARCH_WELLS}/inspect`;

/* dashboards */
const DASHBOARD = `/dashboard`;

/* favorites */

const FAVORITES = '/favorites';
const FAVORITES_SAVED_SEARCH = `${FAVORITES}/saved-searches`;
const FAVORITES_DETAILS = `${FAVORITES}/:favoriteId/:path`;
const FAVORITE_TAB_DOCUMENTS = (favoriteId: string) =>
  `${FAVORITES}/${favoriteId}/documents`;
const FAVORITE_TAB_WELLS = (favoriteId: string) =>
  `${FAVORITES}/${favoriteId}/wells`;

/* admin */

const ADMIN = '/admin';

const ADMIN_FEEDBACK = `${ADMIN}/feedback`;
const ADMIN_FEEDBACK_GENERAL = `${ADMIN_FEEDBACK}/general`;
const ADMIN_FEEDBACK_DOCUMENT = `${ADMIN_FEEDBACK}/document`;

const ADMIN_PROJECT_CONFIG = `${ADMIN}/projectConfig`;
const INTERNAL_PROJECT_CONFIG = '/__internal__/projectConfig';

const ADMIN_LEGEND = `${ADMIN}/legend`;

const navigationConfig = {
  LOGOUT: '/logout',

  DASHBOARD,

  SEARCH,
  SEARCH_DOCUMENTS,
  SEARCH_DOCUMENTS_INSPECT,
  SEARCH_SEISMIC,
  SEARCH_WELLS,
  SEARCH_WELLS_INSPECT,
  SEARCH_WELLS_INSPECT_OVERVIEW: `${SEARCH_WELLS_INSPECT}/overview`,
  SEARCH_WELLS_INSPECT_STICK_CHART: `${SEARCH_WELLS_INSPECT}/stickChart`,
  SEARCH_WELLS_INSPECT_TRAJECTORY: `${SEARCH_WELLS_INSPECT}/trajectory`,
  SEARCH_WELLS_INSPECT_LOGTYPE: `${SEARCH_WELLS_INSPECT}/wellLogs`,
  SEARCH_WELLS_INSPECT_CASINGSCOMPLETIONS: `${SEARCH_WELLS_INSPECT}/casingsCompletions`,
  SEARCH_WELLS_INSPECT_EVENTSNDS: `${SEARCH_WELLS_INSPECT}/eventsNds`,
  SEARCH_WELLS_INSPECT_EVENTSNPT: `${SEARCH_WELLS_INSPECT}/eventsNpt`,
  SEARCH_WELLS_INSPECT_RELATEDDOCUMENTS: `${SEARCH_WELLS_INSPECT}/relatedDocuments`,
  SEARCH_WELLS_INSPECT_TESTS: `${SEARCH_WELLS_INSPECT}/tests`,
  SEARCH_WELLS_INSPECT_FLUIDS: `${SEARCH_WELLS_INSPECT}/fluids`,
  SEARCH_WELLS_INSPECT_EVENTS: `${SEARCH_WELLS_INSPECT}/events`,
  SEARCH_WELLS_INSPECT_DRILLING: `${SEARCH_WELLS_INSPECT}/drilling`,
  SEARCH_WELLS_INSPECT_DIGITALROCKS: `${SEARCH_WELLS_INSPECT}/digitalRocks`,
  SEARCH_WELLS_INSPECT_THREEDEE: `${SEARCH_WELLS_INSPECT}/threeDee`,
  SEARCH_WELLS_INSPECT_PPFG: `${SEARCH_WELLS_INSPECT}/ppfg`,
  SEARCH_WELLS_INSPECT_MEASUREMENTS: `${SEARCH_WELLS_INSPECT}/measurements`,

  FAVORITES,
  FAVORITES_SAVED_SEARCH,
  FAVORITES_DETAILS,
  FAVORITE_TAB_DOCUMENTS,
  FAVORITE_TAB_WELLS,

  ADMIN,
  ADMIN_FEEDBACK,
  ADMIN_FEEDBACK_GENERAL,
  ADMIN_FEEDBACK_DOCUMENT,

  ADMIN_PROJECT_CONFIG,
  INTERNAL_PROJECT_CONFIG,

  ADMIN_LEGEND,
};

export default navigationConfig;
