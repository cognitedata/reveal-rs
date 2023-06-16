import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@entity-matching-app/common';
import { PAGINATION_SETTINGS } from '@entity-matching-app/common/constants';
import Confidence from '@entity-matching-app/components/em-result/Confidence';
import {
  EMPipelineRunMatch,
  Pipeline,
} from '@entity-matching-app/hooks/entity-matching-pipelines';
import { TableRowSelection } from 'antd/lib/table/interface';

import { ColumnType, Table } from '@cognite/cdf-utilities';
import { Icon } from '@cognite/cogs.js';
import { CogniteInternalId } from '@cognite/sdk';

import ExpandedMatch from './ExpandedMatch';
import ResourceCell from './ResourceCell';

type BasicResultsTableRecord = EMPipelineRunMatch & { key: number };

type BasicResultsTableColumnType = ColumnType<BasicResultsTableRecord> & {
  title: string;
};

type BasicResultsTableProps = {
  matches?: EMPipelineRunMatch[];
  pipeline: Pipeline;
  selectedSourceIds: CogniteInternalId[];
  setSelectedSourceIds: Dispatch<SetStateAction<CogniteInternalId[]>>;
};

const BasicResultsTable = ({
  matches,
  pipeline,
  selectedSourceIds,
  setSelectedSourceIds,
}: BasicResultsTableProps): JSX.Element => {
  const { t } = useTranslation();

  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const handleClickExpandButton = (clickedRowKey: number) => {
    setExpandedRowKeys((prevState) =>
      prevState.includes(clickedRowKey)
        ? prevState.filter((key) => key !== clickedRowKey)
        : prevState.concat(clickedRowKey)
    );
  };

  const columns: BasicResultsTableColumnType[] = useMemo(
    () => [
      {
        title: t('qm-result-source', {
          resource: t('resource').toLocaleLowerCase(),
        }),
        dataIndex: 'source',
        key: 'source',
        render: (source: EMPipelineRunMatch['source']) => (
          <ResourceCell resource={source} />
        ),
      },
      {
        title: t('qm-result-target'),
        dataIndex: 'target',
        key: 'target',
        render: (target: EMPipelineRunMatch['target']) => (
          <ResourceCell resource={target} />
        ),
      },
      {
        title: t('confidence'),
        dataIndex: 'score',
        key: 'score',
        render: (score: EMPipelineRunMatch['score']) => (
          <Confidence score={score} />
        ),
        sorter: (rowA: EMPipelineRunMatch, rowB: EMPipelineRunMatch) =>
          (rowA.score ?? 0) - (rowB.score ?? 0),
        width: 64,
      },
      {
        title: '',
        dataIndex: 'source',
        key: 'expandable',
        render: (_, record) => (
          <ExpandButton onClick={() => handleClickExpandButton(record.key)}>
            <Icon
              type={
                expandedRowKeys.includes(record.key)
                  ? 'ChevronUp'
                  : 'ChevronDown'
              }
            />
          </ExpandButton>
        ),
        width: 64,
      },
    ],
    [expandedRowKeys, t]
  );

  const dataSource = useMemo(
    () =>
      matches?.map((match) => ({
        ...match,
        key:
          match.source?.id && typeof match.source.id === 'number'
            ? match.source.id
            : -1,
      })) ?? [],
    [matches]
  );

  const rowSelection: TableRowSelection<BasicResultsTableRecord> = {
    selectedRowKeys: selectedSourceIds,
    onChange: (_, rows, info) => {
      if (info.type === 'single') {
        const ids = rows.map(({ key }) => key);
        setSelectedSourceIds(ids);
      }
    },
    onSelectAll: (all) => {
      if (all) {
        setSelectedSourceIds(dataSource.map(({ key }) => key));
      } else {
        setSelectedSourceIds([]);
      }
    },
  };

  return (
    <Table<BasicResultsTableRecord>
      columns={columns}
      dataSource={dataSource}
      emptyContent={undefined}
      appendTooltipTo={undefined}
      pagination={PAGINATION_SETTINGS}
      expandable={{
        showExpandColumn: false,
        expandedRowKeys: expandedRowKeys,
        expandedRowRender: (record) => (
          <ExpandedMatch
            source={record.source}
            target={record.target}
            matchFields={pipeline.modelParameters?.matchFields}
          />
        ),
        indentSize: 64,
      }}
      rowSelection={rowSelection}
    />
  );
};

const ExpandButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  box-shadow: none;
  cursor: pointer;
  display: flex;
  height: 36px;
  justify-content: center;
  padding: 0;
  width: 36px;
`;

export default BasicResultsTable;
