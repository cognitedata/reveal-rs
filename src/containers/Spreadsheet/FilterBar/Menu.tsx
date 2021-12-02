import React, { useMemo, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Colors, Icon, Menu as CogsMenu } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { useTableData } from 'hooks/table-data';
import { escapeCSVValue } from 'utils/utils';
import DeleteTableModal from 'components/DeleteTableModal/DeleteTableModal';
import { useActiveTableContext } from 'contexts';

export const Menu = (): JSX.Element => {
  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const { rows, isFetched } = useTableData();
  const { database, table } = useActiveTableContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canBeDownloaded = isFetched && !!rows?.length;
  const canBeRenamed = false; // TODO renaming is impossible now

  const stopPropagation = (
    e: React.MouseEvent<HTMLButtonElement | HTMLElement>
  ) => e.stopPropagation();

  const onDownloadData = useMemo(() => {
    return (
      rows.map((item) => {
        const escapedColumns: Record<string, string> = {};
        Object.keys(item).forEach((key) => {
          escapedColumns[key] = escapeCSVValue(item[key]);
        });
        delete escapedColumns['column-index'];
        return { key: item.key, ...escapedColumns };
      }) || []
    );
  }, [rows]);

  return (
    <StyledMenu>
      <CogsMenu.Item aria-label="Button rename table" disabled={!canBeRenamed}>
        <Item>
          <Icon type="Edit" />
          Rename table
        </Item>
      </CogsMenu.Item>
      <CSVLink
        filename={`cognite-${database}-${table}.csv`}
        data={onDownloadData}
      >
        <CogsMenu.Item
          aria-label="Button download table"
          disabled={!canBeDownloaded}
        >
          <Item>
            <Icon type="Download" />
            Download table
          </Item>
        </CogsMenu.Item>
      </CSVLink>
      <CogsMenu.Divider />
      <CogsMenu.Header>Danger zone</CogsMenu.Header>
      <CogsMenu.Item
        aria-label="Button delete table"
        disabled={!hasWriteAccess}
        onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
          stopPropagation(e);
          setIsDeleteModalOpen(true);
        }}
      >
        <Item danger>
          <Icon type="Trash" />
          <span>Delete table</span>
        </Item>
      </CogsMenu.Item>
      <DeleteTableModal
        databaseName={database}
        tableName={table}
        visible={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </StyledMenu>
  );
};

const StyledMenu = styled(CogsMenu)`
  width: 250px;
  a {
    color: inherit;
  }
`;
const Item = styled.span<{ danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 500;

  & > * {
    color: ${({ danger }) =>
      danger ? Colors['text-danger'].hex() : 'inherit'};
  }
`;
