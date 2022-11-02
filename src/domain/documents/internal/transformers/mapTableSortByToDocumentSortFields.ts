import { DocumentFilterProperty, DocumentSortItem } from '@cognite/sdk';
import { TableSortBy } from 'components/ReactTable/V2';

const columnToSortMap = new Map<string, DocumentFilterProperty>([
  ['name', ['sourceFile', 'name']],
  ['type', ['type']],
  ['author', ['author']],
  ['modifiedTime', ['modifiedTime']],
  ['createdTime', ['createdTime']],
  ['externalId', ['externalId']],
  ['id', ['id']],
]);

export const mapTableSortByToDocumentSortFields = (
  sortBy: TableSortBy[]
): DocumentSortItem[] | undefined => {
  if (sortBy.length > 0) {
    // Documents sort only supports for 1 property.
    const { id, desc } = sortBy[0];
    return [
      {
        order: desc ? 'desc' : 'asc',
        property: columnToSortMap.get(id)!,
      },
    ];
  }

  return undefined;
};
