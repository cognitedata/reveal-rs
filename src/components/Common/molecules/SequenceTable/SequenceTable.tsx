import React, { useEffect, useState } from 'react';
import { Sequence, SequenceColumn } from 'cognite-sdk-v3';
import Table, { Column } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import AutoSizer from 'react-virtualized-auto-sizer';
import TableStyle from 'react-base-table/styles.css';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import Highlighter from 'react-highlight-words';
import { TableWrapper, TimeDisplay } from 'components/Common';

const headerRenderer = ({
  column: { title },
}: {
  column: { title: string };
}) => (
  <Body level={3} strong>
    {title}
  </Body>
);

const ActionCell = ({ sequence }: { sequence: Sequence }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: sequence.id, type: 'sequence' });
};

export const SequenceTable = ({
  sequences,
  query,
  onSequenceClicked,
}: {
  sequences: Sequence[];
  query?: string;
  onSequenceClicked: (sequence: Sequence) => void;
}) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);
  const mode = useResourceMode();
  const resourcesState = useResourcesState();

  const currentItems = resourcesState.filter(el => el.state === 'active');
  useEffect(() => {
    TableStyle.use();
    return () => TableStyle.unuse();
  }, []);

  const onSequenceSelected = (sequence: Sequence) => {
    onSequenceClicked(sequence);
    setPreviewId(sequence.id);
  };

  return (
    <TableWrapper>
      <AutoSizer>
        {({ width, height }) => (
          <Table
            rowEventHandlers={{
              onClick: ({ rowData: sequence, event }) => {
                onSequenceSelected(sequence);
                return event;
              },
            }}
            rowClassName={({ rowData }) => {
              const extraClasses: string[] = [];
              if (previewId === rowData.id) {
                extraClasses.push('previewing');
              }
              if (currentItems.some(el => el.id === rowData.id)) {
                extraClasses.push('active');
              }
              return `row clickable ${extraClasses.join(' ')}`;
            }}
            width={width}
            height={height}
            columns={[
              {
                key: 'name',
                title: 'Name',
                dataKey: 'name',
                headerRenderer,
                width: 300,
                resizable: true,
                cellProps: { query },
                cellRenderer: ({ cellData: name }: { cellData: string }) => (
                  <Body level={2} strong>
                    <Highlighter
                      searchWords={(query || '').split(' ')}
                      textToHighlight={name}
                    />
                  </Body>
                ),
                frozen: Column.FrozenDirection.LEFT,
              },
              {
                key: 'externalId',
                title: 'External ID',
                dataKey: 'externalId',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: externalId,
                }: {
                  cellData?: string;
                }) => <Body level={2}>{externalId}</Body>,
                resizable: true,
              },
              {
                key: 'columns',
                title: '# of Columns',
                dataKey: 'columns',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: columns,
                }: {
                  cellData: SequenceColumn[];
                }) => <Body level={2}>{columns.length}</Body>,
                resizable: true,
              },
              {
                key: 'lastUpdatedTime',
                title: 'Last updated',
                dataKey: 'lastUpdatedTime',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: lastUpdatedTime,
                }: {
                  cellData?: number;
                }) => (
                  <Body level={2}>
                    <TimeDisplay value={lastUpdatedTime} relative withTooltip />
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'createdTime',
                title: 'Created',
                dataKey: 'createdTime',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: createdTime,
                }: {
                  cellData?: number;
                }) => (
                  <Body level={2}>
                    <TimeDisplay value={createdTime} relative withTooltip />
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'labels',
                title: 'Labels',
                width: 200,
                resizable: true,
                headerRenderer,
                cellRenderer: () => <Body level={3}>Coming soon....</Body>,
              },
              ...(mode !== 'none'
                ? [
                    {
                      key: 'action',
                      title: 'Select',
                      width: 80,
                      resizable: true,
                      align: Column.Alignment.CENTER,
                      frozen: Column.FrozenDirection.RIGHT,
                      headerRenderer,
                      cellRenderer: ({
                        rowData: sequence,
                      }: {
                        rowData: Sequence;
                      }) => {
                        return <ActionCell sequence={sequence} />;
                      },
                    },
                  ]
                : []),
            ]}
            fixed
            data={sequences}
          />
        )}
      </AutoSizer>
    </TableWrapper>
  );
};
