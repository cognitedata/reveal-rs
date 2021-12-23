import { TopBar } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const StyledTopBar = styled(TopBar)`
  .cogs-topbar--left,
  .cogs-topbar--right {
    align-items: center;
    padding: 0 10px;
  }
`;
