/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactNode, useState, type ReactElement } from 'react';
import { type Vector2 } from 'three';
import styled from 'styled-components';
import { useRenderTarget } from './RevealCanvas';
import { type ContextMenuData } from '../architecture/base/renderTarget/CommandsController';
import { ContextMenuUpdater } from '../architecture/base/reactUpdaters/ContextMenuUpdater';
import { withSuppressRevealEvents } from '../higher-order-components/withSuppressRevealEvents';

export const ContextMenu = ({
  Content
}: {
  Content: ({ contextMenuData }: { contextMenuData: ContextMenuData }) => ReactNode;
}): ReactElement => {
  const renderTarget = useRenderTarget();

  const [_update, setUpdate] = useState<number>(0);
  ContextMenuUpdater.setCounterDelegate(setUpdate);

  const contextMenuData = renderTarget.commandsController.contextMenuPositionData;

  if (contextMenuData === undefined) {
    return <></>;
  }

  return (
    <StyledDiv
      $position={contextMenuData.position}
      onClick={() => {
        renderTarget.commandsController.setContextMenuPositionData(undefined);
      }}>
      <Content contextMenuData={contextMenuData} />
    </StyledDiv>
  );
};

const StyledDiv = withSuppressRevealEvents(styled.div<{ $position: Vector2 }>`
  position: absolute;
  left: ${(props) => props.$position.x}px;
  top: ${(props) => props.$position.y}px;
`);
