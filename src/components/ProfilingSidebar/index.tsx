import React from 'react';
import { Drawer } from 'antd';

import { Button, Colors } from '@cognite/cogs.js';

import { useProfilingSidebar } from 'contexts';
import { useColumnSelection } from 'hooks/table-selection';
import { SIDEBAR_PROFILING_DRAWER_WIDTH } from 'utils/constants';

import { Header } from './Header';
import { ProfilingData } from './ProfilingData';

export const ProfilingSidebar = (): JSX.Element => {
  const { isProfilingSidebarOpen, setIsProfilingSidebarOpen } =
    useProfilingSidebar();

  const { selectedColumn } = useColumnSelection();

  const onClickHide = () => setIsProfilingSidebarOpen(false);

  const footer = (
    <Button block icon="PanelRight" type="secondary" onClick={onClickHide}>
      Hide
    </Button>
  );

  return (
    <Drawer
      visible={isProfilingSidebarOpen}
      width={SIDEBAR_PROFILING_DRAWER_WIDTH}
      placement="right"
      closable={false}
      getContainer={false}
      mask={false}
      onClose={onClickHide}
      style={{
        position: 'absolute',
        borderTop: `1px solid ${Colors['greyscale-grey3'].hex()}`,
      }}
      bodyStyle={{ padding: 0 }}
      headerStyle={{ padding: 0 }}
      title={<Header selectedColumn={selectedColumn} />}
      footer={footer}
    >
      <ProfilingData selectedColumn={selectedColumn} />
    </Drawer>
  );
};
