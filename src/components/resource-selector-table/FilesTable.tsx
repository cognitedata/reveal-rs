import { useMemo } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Icon } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useTranslation } from 'common';
import { useList } from 'hooks/list';
import { RawFileInfo } from 'types/api';
import { ResourceTableProps } from 'types/types';
import { useSearch } from 'hooks/search';

type FileInfoListTableRecord = { key: string } & Pick<
  RawFileInfo,
  'dataSetId' | 'id' | 'lastUpdatedTime' | 'mimeType' | 'directory'
>;
type FileInfoListTableRecordCT = ColumnType<FileInfoListTableRecord> & {
  title: string;
};

export default function FileInfoTable({
  selected,
  setSelected,
  advancedFilter,
  filter,
  allSources,
  query,
}: ResourceTableProps) {
  const { t } = useTranslation();

  const {
    data: listData,
    isInitialLoading: listLoading,
    error: listError,
  } = useList('files', {
    filter,
    advancedFilter,
    limit: 100,
  });

  const {
    data: searchData,
    isInitialLoading: searchLoading,
    error: searchError,
  } = useSearch(
    'files',
    { name: query },
    {
      filter,
      advancedFilter,
    },
    { enabled: !!query }
  );

  const items = useMemo(
    () =>
      (query ? searchData : listData)?.map((a) => ({
        ...a,
        key: a.id.toString(),
        disabled: allSources,
      })) || [],
    [listData, allSources, query, searchData]
  );

  const isInitialLoading = query ? searchLoading : listLoading;
  const error = query ? searchError : listError;

  const dataSource = items?.map((file) => ({
    ...file,
    disabled: allSources,
  }));

  const columns: FileInfoListTableRecordCT[] = useMemo(
    () => [
      {
        title: t('resource-table-column-name'),
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'resource-table-column-mimeType',
        dataIndex: 'mimeType',
        key: 'mimeType',
      },
      {
        title: 'resource-table-column-directory',
        dataIndex: 'directory',
        key: 'directory',
      },
      {
        title: t('resource-table-column-lastUpdated'),
        dataIndex: 'lastUpdatedTime',
        key: 'lastUpdatedTime',
        render: (value: number) => new Date(value).toLocaleString(),
      },
    ],
    [t]
  );

  const rowSelection = {
    selectedRowKeys: allSources
      ? dataSource?.map((d) => d.id.toString())
      : selected.map((s) => s.id.toString()),

    type: 'checkbox' as RowSelectionType,
    onChange(_: (string | number)[], rows: FileInfoListTableRecord[]) {
      setSelected(rows.map((r) => ({ id: r.id })));
    },
    hideSelectAll: true,
    getCheckboxProps(_: any) {
      return {
        disabled: allSources,
      };
    },
  };

  if (error?.status === 403) {
    return (
      <Alert
        type="warning"
        message={t('error-403-title')}
        description={t('error-403-description')}
      />
    );
  }

  return (
    <Table<FileInfoListTableRecord>
      loading={isInitialLoading}
      columns={columns}
      emptyContent={isInitialLoading ? <Icon type="Loader" /> : undefined}
      appendTooltipTo={undefined}
      rowSelection={rowSelection}
      dataSource={dataSource || []}
    />
  );
}
