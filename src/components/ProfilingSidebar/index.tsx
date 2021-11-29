import React, { useContext } from 'react';
import { Button, Colors, Drawer, Flex, Title } from '@cognite/cogs.js';

import { RawExplorerContext } from 'contexts';

const SIDEBAR_PROFILING_WIDTH = 350;

export const ProfilingSidebar = (): JSX.Element => {
  const { isProfilingSidebarOpen, setIsProfilingSidebarOpen, selectedColumn } =
    useContext(RawExplorerContext);

  const onClickHide = () => {
    setIsProfilingSidebarOpen(false);
  };

  return (
    <Drawer
      visible={isProfilingSidebarOpen}
      width={SIDEBAR_PROFILING_WIDTH}
      closable={false}
      showMask={false}
      // @ts-ignore
      getContainer={null}
      level={null}
      handler={null}
      onOk={onClickHide}
      onClose={onClickHide}
      contentWrapperStyle={{
        borderTop: `1px solid ${Colors['greyscale-grey3'].hex()}`,
        boxShadow: `0 0 10px ${Colors['greyscale-grey4'].hex()}`,
      }}
      footer={
        <Button block icon="PanelRight" type="secondary" onClick={onClickHide}>
          Hide
        </Button>
      }
    >
      <Flex>
        <Title level={6}>{selectedColumn?.title ?? '-'}</Title>
      </Flex>
    </Drawer>
  );
};
