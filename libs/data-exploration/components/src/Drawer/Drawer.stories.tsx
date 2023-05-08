import { Button } from '@cognite/cogs.js';
import { useDialog } from '@data-exploration-lib/core';
import React from 'react';
import styled from 'styled-components';
import { Drawer } from './Drawer';

export default {
  title: 'Component/Drawer',
  component: Drawer,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};
export const Example = () => {
  const { open, isOpen, close } = useDialog();
  return (
    <>
      <Button onClick={open}>Open</Button>
      <Drawer visible={isOpen} onClose={close}>
        Some text here
      </Drawer>
    </>
  );
};

const Container = styled.div`
  padding: 20px;
  display: flex;
  position: fixed;
`;
