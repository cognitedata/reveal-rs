import React from 'react';
import styled from 'styled-components';
import { sdkMock } from 'lib/docs/stub';
import { DataExplorationProvider } from '../context/DataExplorationContext';

export const Container = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
`;

export const Wrapper = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <Container style={style}>
      {/** @ts-ignores */}
      <DataExplorationProvider sdk={sdkMock}>
        {children}
      </DataExplorationProvider>
    </Container>
  );
};
