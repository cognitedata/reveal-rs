import {
  DEFAULT_SCORE_SORTING,
  METADATA_KEY_SEPARATOR,
} from '../../../constants';
import { InternalSortBy, TableSortBy } from '../../../types';

export const mapTableSortByToEventSortFields = (
  sortBy?: TableSortBy[]
): InternalSortBy[] | undefined => {
  if (!sortBy || sortBy.length === 0) {
    return DEFAULT_SCORE_SORTING;
  }
  return sortBy.map((tableSort) => {
    const properties = tableSort.id.split(METADATA_KEY_SEPARATOR);
    return {
      property: properties,
      order: tableSort.desc ? 'desc' : 'asc',
      nulls: tableSort.desc ? 'last' : 'first', // When ascending undefined(null) comes first and last for descending
    };
  });
};
