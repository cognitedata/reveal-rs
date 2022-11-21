import React, { useState } from 'react';

import { Button, Flex } from '@cognite/cogs.js';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';

import AccessButton from 'components/AccessButton';
import { Dropdown } from 'antd';
import UploadCSV from 'components/UploadCSV';
import { useActiveTableContext } from 'contexts';
import { rowKey } from 'hooks/sdk-queries';

import { Menu } from './Menu';
import { useTranslation } from 'common/i18n';

export const Actions = (): JSX.Element => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { database, table } = useActiveTableContext();
  const [csvModalVisible, setCSVModalVisible] = useState<boolean>(false);

  return (
    <Bar alignItems="center" justifyContent="space-between">
      <AccessButton
        hasWriteAccess={true}
        permissions={[{ acl: 'rawAcl', actions: ['WRITE'] }]}
        onClick={() => setCSVModalVisible(true)}
      >
        {t('spreadsheet-filter-add-new-data')}
      </AccessButton>
      <Dropdown overlay={<Menu />} trigger={['click']}>
        <Button
          aria-label="Options"
          icon="EllipsisHorizontal"
          type="secondary"
        />
      </Dropdown>
      {csvModalVisible && (
        <UploadCSV
          setCSVModalVisible={(visible, tableChanged) => {
            setCSVModalVisible(visible);
            if (tableChanged) {
              queryClient.invalidateQueries(
                rowKey(database!, table!, 0).slice(0, 3)
              );
            }
          }}
        />
      )}
    </Bar>
  );
};

const Bar = styled(Flex)`
  & > * {
    margin: 0 4px;
  }
`;
