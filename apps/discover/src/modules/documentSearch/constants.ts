export const FILE_TYPE_KEY = 'type';
export const LAST_UPDATED_KEY_VALUE = 'sourceModifiedTime';
export const LAST_UPDATED_KEY = `sourceFile.${LAST_UPDATED_KEY_VALUE}` as const;
export const LAST_CREATED_KEY_VALUE = 'sourceCreatedTime';
export const LAST_CREATED_KEY = `sourceFile.${LAST_CREATED_KEY_VALUE}` as const;
export const LABELS_KEY = 'labels';
export const SOURCE_KEY = 'sourceFile.source';
export const PAGE_COUNT_KEY = 'pageCount';

export const DOCUMENT_FALLBACK_SEARCH_LIMIT = 100;
export const DEFAULT_FILTER_ITEM_LIMIT = 7;

export const aggregates = [
  {
    name: 'labels',
    aggregate: 'count',
    groupBy: [LABELS_KEY],
  },
  {
    name: 'location',
    aggregate: 'count',
    groupBy: [SOURCE_KEY],
  },
  {
    name: 'filetype',
    aggregate: 'count',
    groupBy: [FILE_TYPE_KEY],
  },
  {
    name: 'lastcreated',
    aggregate: 'dateHistogram',
    field: LAST_CREATED_KEY,
    interval: 'year',
  },
  {
    // this is the backup value for 'lastmodified' and
    // this is used for the TOTAL count of results
    name: 'lastUpdatedTime',
    aggregate: 'dateHistogram',
    field: LAST_UPDATED_KEY,
    interval: 'year',
  },
];
