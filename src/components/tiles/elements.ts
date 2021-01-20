import styled from 'styled-components/macro';
import { Title } from '@cognite/cogs.js';
import { SpaceBetween } from 'styles/common';
import layers from 'utils/zindex';

const TileBasic = styled.div`
  display: inline-flex;
  cursor: pointer;
  background-color: var(--cogs-white);
  &:hover {
    box-shadow: var(--cogs-z-4);
  }
`;

export const SmallTileContainer = styled(TileBasic)`
  width: 298px;
  border-radius: 2px;
  border: 1px solid var(--cogs-greyscale-grey4);
`;

export const TileContainer = styled(TileBasic)`
  position: relative;
  flex-direction: column;
  width: 300px;
  border: 1px solid var(--cogs-greyscale-grey4);
  margin: 0 48px 24px 0;
`;

export const TileDescription = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 8px;
  overflow: hidden;
  & > span {
    display: grid;
  }
`;

export const TileHeader = styled(SpaceBetween)<{
  isBoard?: boolean;
  color?: string;
}>`
  padding: 8px 12px;
  height: 56px;
  display: flex;
  align-items: center;
  background-color: var(--cogs-white);
  border-bottom: ${({ isBoard, color }) =>
    isBoard ? `2px solid ${color}` : '1px solid var(--cogs-greyscale-grey4)'};
  z-index: ${layers.TILE_HEADER};
`;

export const TilePreview = styled.div`
  display: flex;
  align-items: center;
  height: 184px;
  background-color: var(--cogs-white);
  padding: 12px;
`;

export const LargeTileContainer = styled(TileBasic)`
  position: relative;
  flex-direction: column;
  width: 954px;
  border: 1px solid var(--cogs-greyscale-grey4);
  margin-bottom: 24px;
`;

export const LargeTilePreview = styled.div`
  display: flex;
  align-items: center;
  height: 531px;
  width: 952px;
  background-color: var(--cogs-white);
  & iframe {
    margin-top: -22px;
  }
`;

export const StyledTitle = styled(Title)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
