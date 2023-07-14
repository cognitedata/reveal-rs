import React, { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { zIndex } from '@data-exploration-lib/core';

import { Splitter } from '../Splitter';

interface DrawerProps {
  visible?: boolean;
  width?: string;
  onClose: () => void;
}

export const Drawer: React.FC<PropsWithChildren<DrawerProps>> = ({
  visible,
  onClose,
  children,
}) => {
  return createPortal(
    <DrawerContainer visible={visible}>
      <StyledSplitter
        percentage
        primaryMinSize={10}
        secondaryInitialSize={70}
        primaryIndex={0}
      >
        <PrimaryContainer onClick={onClose}>
          <ClosedButton>
            <Button
              type="tertiary"
              aria-label="Close button"
              icon="Close"
              onClick={onClose}
            />
          </ClosedButton>
        </PrimaryContainer>
        <SecondaryContainer>{children}</SecondaryContainer>
      </StyledSplitter>
    </DrawerContainer>,
    document.body
  );
};

const DrawerContainer = styled.div<{ visible?: boolean }>`
  position: relative;
  height: 100%;
  width: ${(props) => (props.visible ? '100%' : '0')};
  display: ${(props) => (props.visible ? 'flex' : 'none')};
  justify-content: end;
  background: rgba(0, 0, 0, 0.1);
  transition: 0.3s all;
`;

const StyledSplitter = styled(Splitter)`
  height: 100%;
`;

const PrimaryContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const SecondaryContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #fff;
  transition: 0.3s all;
`;

const ClosedButton = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: ${zIndex.DRAWER};
  .cogs.cogs-button--type-tertiary:hover:not([aria-disabled='true']) {
    background: white;
  }
`;
