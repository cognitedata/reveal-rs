import React, { useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { Button, Dropdown, Flex } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import notification from 'antd/lib/notification';
import Popconfirm from 'antd/lib/popconfirm';
import styled from 'styled-components';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { useDeleteTable } from 'hooks/sdk-queries';
import { useActiveTable } from 'hooks/table-tabs';
import { useTableData } from 'hooks/table-data';
import { escapeCSVValue } from 'utils/utils';
import AccessButton from 'components/AccessButton';
import DropdownMenu from 'components/DropdownMenu';
import MenuButton from 'components/MenuButton';
import UploadCSV from 'components/UploadCSV';

export const Menu = (): JSX.Element => {
  const history = useHistory();
  const { appPath } = useParams<{
    appPath: string;
  }>();
  const { mutate: deleteTable } = useDeleteTable();
  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const { rows, isDone } = useTableData();
  const [[database, table] = [undefined, undefined]] = useActiveTable();
  const [csvModalVisible, setCSVModalVisible] = useState<boolean>(false);

  const canBeDownloaded = isDone && !!rows?.length;

  const onShareClick = () => {
    /** do something */
  };

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
    <Bar alignItems="center" justifyContent="space-between">
      <Button
        icon="Share"
        iconPlacement="right"
        type="secondary"
        onClick={onShareClick}
      >
        Share
      </Button>
      <Dropdown
        content={
          <DropdownMenu>
            <AccessButton
              permissions={[{ acl: 'rawAcl', actions: ['WRITE'] }]}
              hasWriteAccess={hasWriteAccess}
              onClick={() => setCSVModalVisible(true)}
            >
              Upload CSV
            </AccessButton>
            <Popconfirm
              title="Are you sure you want to delete this table? Once deleted, the table cannot be recovered."
              onConfirm={() =>
                deleteTable(
                  { database: database!, table: table! },
                  {
                    onSuccess() {
                      notification.success({
                        message: `Table ${table} in database ${database} deleted!`,
                        key: 'table-created',
                      });
                      history.replace(createLink(`/${appPath}/${database}`));
                    },
                    onError(e) {
                      notification.error({
                        message: 'An error occured when deleting the table!',
                        description: <pre>{JSON.stringify(e, null, 2)}</pre>,
                        key: 'table-created',
                      });
                    },
                  }
                )
              }
              okText="Yes"
              cancelText="No"
              disabled={!hasWriteAccess}
              cancelButtonProps={{ type: 'default' }}
            >
              <MenuButton
                type="ghost-danger"
                aria-label="Button delete table"
                icon="Trash"
                disabled={!hasWriteAccess}
              >
                Delete Table
              </MenuButton>
            </Popconfirm>
            <CSVLink
              filename={`cognite-${database}-${table}.csv`}
              data={onDownloadData}
            >
              <MenuButton
                type="ghost"
                aria-label="Button download table"
                icon="Download"
                disabled={!canBeDownloaded}
              >
                Download CSV
              </MenuButton>
            </CSVLink>
          </DropdownMenu>
        }
      >
        <Button icon="HorizontalEllipsis" type="secondary" />
      </Dropdown>
      <UploadCSV
        csvModalVisible={csvModalVisible}
        setCSVModalVisible={setCSVModalVisible}
        table={table!}
        database={database!}
      />
    </Bar>
  );
};

const Bar = styled(Flex)`
  & > * {
    margin: 0 4px;
  }
`;
