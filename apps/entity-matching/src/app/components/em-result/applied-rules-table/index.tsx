import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import { TableRowSelection } from 'antd/lib/table/interface';
import { useTranslation } from '@entity-matching-app/common';
import { PAGINATION_SETTINGS } from '@entity-matching-app/common/constants';

import { Container, Graphic } from '@entity-matching-app/components/InfoBox';
import ExpandedRule from '@entity-matching-app/components/pipeline-run-results-table/ExpandedRule';

import { ColumnType, Table } from '@cognite/cdf-utilities';

import Extractor from '@entity-matching-app/components/pipeline-run-results-table/Extractor';

import { Body, Flex, Icon, Title } from '@cognite/cogs.js';

import { ExpandButton } from '@entity-matching-app/components/pipeline-run-results-table/GroupedResultsTable';
import { Prediction } from '@entity-matching-app/hooks/entity-matching-predictions';
import { AppliedRule } from '@entity-matching-app/hooks/entity-matching-rules';

type Props = {
  predictions: Prediction[];
  appliedRules: AppliedRule[];
  confirmedPredictions: number[];
  setConfirmedPredictions: Dispatch<SetStateAction<number[]>>;
};

type AppliedRuleTableRecord = { key: number } & AppliedRule;
type AppliedRuleTableRecordCT = ColumnType<AppliedRuleTableRecord> & {
  title: string;
  key:
    | 'source'
    | 'target'
    | 'fields'
    | 'numberOfMatches'
    | 'matches'
    | 'expandable';
};

export default function AppliedRulesTable({
  appliedRules,
  confirmedPredictions,
  setConfirmedPredictions,
}: Props) {
  const { t } = useTranslation();

  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const handleClickExpandButton = (clickedRowKey: number) => {
    setExpandedRowKeys((prevState) =>
      prevState.includes(clickedRowKey)
        ? prevState.filter((key) => key !== clickedRowKey)
        : prevState.concat(clickedRowKey)
    );
  };

  const columns: AppliedRuleTableRecordCT[] = useMemo(
    () => [
      {
        title: t('source'),
        key: 'source',
        render: (rule: AppliedRule) => (
          <Extractor
            extractors={rule.rule.extractors}
            entitySetToRender="sources"
          />
        ),
      },
      {
        title: t('target'),
        key: 'target',
        render: (rule: AppliedRule) => (
          <Extractor
            extractors={rule.rule.extractors}
            entitySetToRender="targets"
          />
        ),
      },
      {
        title: t('rules-matches'),
        key: 'numberOfMatches',
        width: 100,
        sorter: (a: AppliedRule, b: AppliedRule) =>
          a.numberOfMatches - b.numberOfMatches,
        render: (rule: AppliedRule) => rule.numberOfMatches.toLocaleString(),
      },
      {
        title: '',
        dataIndex: 'matches',
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
    [t, expandedRowKeys]
  );

  const appliedRulesList = useMemo(
    () =>
      appliedRules?.map((r, i) => ({
        ...r,
        key: i,
      })) || [],
    [appliedRules]
  );

  const rowSelection: TableRowSelection<AppliedRuleTableRecord> = {
    hideSelectAll: true,

    onChange(selectedKeys) {
      const confirmed = (selectedKeys as number[]).reduce(
        (accl: number[], i) => [
          ...accl,
          ...(appliedRules?.[i]?.matches.map((m) => m.source.id) || []),
        ],
        []
      );
      setConfirmedPredictions(confirmed);
    },
  };

  if (appliedRules.length === 0) {
    return (
      <Container direction="row" justifyContent="space-between">
        <Flex direction="column" alignItems="flex-start">
          <Title level={4}>{t('result-rules-empty-title')}</Title>
          <Body level={1}>{t('result-rules-empty-body')}</Body>
        </Flex>
        <Graphic />
      </Container>
    );
  }

  return (
    <Table<AppliedRuleTableRecord>
      columns={columns}
      emptyContent={undefined}
      appendTooltipTo={undefined}
      dataSource={appliedRulesList}
      pagination={PAGINATION_SETTINGS}
      rowSelection={rowSelection}
      expandable={{
        showExpandColumn: false,
        expandedRowKeys: expandedRowKeys,
        expandedRowRender: (record) =>
          !!record.matches &&
          !!record.rule.extractors &&
          !!record.rule.conditions ? (
            <ExpandedRule
              conditions={record.rule.conditions}
              extractors={record.rule.extractors}
              matches={record.matches}
              selectedSourceIds={confirmedPredictions}
              setSelectedSourceIds={setConfirmedPredictions}
            />
          ) : (
            false
          ),
        indentSize: 64,
      }}
    />
  );
}
