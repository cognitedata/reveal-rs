import { Key, useEffect, useMemo, useState } from 'react';
import { ColumnType, RowSelectionType, Table } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';

import PipelineName from 'components/pipeline-name/PipelineName';
import { stringSorter } from 'common/utils';
import { useTranslation } from 'common';
import { Pipeline, useEMPipelines } from 'hooks/contextualization-api';
import { PipelineTableTypes } from 'types/types';

import { stringContains } from 'utils/shared';
import EntityMatchingFilter from 'components/em-filter/EntityMatchingFilter';

type PipelineListTableRecord = { key: string } & Pick<
  Pipeline,
  PipelineTableTypes
>;
type PipelineListTableRecordCT = ColumnType<PipelineListTableRecord> & {
  title: string;
  key: PipelineTableTypes;
};

const PipelineTable = (): JSX.Element => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [pipelinesList, setPipelinesList] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const { data, isInitialLoading } = useEMPipelines();
  const { t } = useTranslation();

  const handleToggleCheckbox = (
    _: Key[],
    selectedRows: PipelineListTableRecord[]
  ) => {
    setSelectedRowKeys(selectedRows.map(({ key }) => key));
  };

  const rowSelection = {
    selectedRowKeys,
    type: 'checkbox' as RowSelectionType,
    onChange: handleToggleCheckbox,
  };

  const dataSource = useMemo(
    () => data?.map((a) => ({ ...a, key: a.id.toString() })) || [],
    [data]
  );

  const columns: PipelineListTableRecordCT[] = useMemo(
    () => [
      {
        title: t('pipeline-list-table-column-title-name'),
        dataIndex: 'name',
        key: 'name',
        render: (value, record) => <PipelineName id={record.id} name={value} />,
        sorter: (a, b) => stringSorter(a, b, 'name'),
      },
      {
        title: t('pipeline-list-table-column-title-description'),
        dataIndex: 'description',
        key: 'description',
        render: (description: string) => description || '—',
        sorter: (a: any, b: any) =>
          stringSorter(a?.description, b?.description, 'description'),
      },
      {
        title: t('pipeline-list-table-column-title-owner'),
        dataIndex: 'owner',
        key: 'owner',
        sorter: (a: any, b: any) => stringSorter(a?.owner, b?.owner, 'owner'),
      },
    ],
    [t]
  );

  useEffect(() => {
    const newPipelines = dataSource?.filter((pipeline) =>
      stringContains(pipeline?.name, query)
    );
    setPipelinesList(newPipelines);
  }, [dataSource, query]);

  if (isInitialLoading) {
    return <Loader />;
  }

  return (
    <>
      <EntityMatchingFilter query={query} setQuery={setQuery} />
      <Table<PipelineListTableRecord>
        columns={columns}
        emptyContent={undefined}
        appendTooltipTo={undefined}
        dataSource={pipelinesList}
        rowSelection={rowSelection}
      />
    </>
  );
};

export default PipelineTable;
