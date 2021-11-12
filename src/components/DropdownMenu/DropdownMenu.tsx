import styled from 'styled-components';
import { Colors, Flex } from '@cognite/cogs.js';

const DropdownMenu = styled(Flex)`
  flex-direction: column;
  align-items: flex-start;
  border-radius: 8px;
  padding: 8px 4px;
  background-color: white;
  box-shadow: 0 0 10px ${Colors['greyscale-grey3'].hex()};
  width: auto;
  & > * {
    flex: 1 1 0px;
    width: 100%;
    justify-content: flex-start;
  }
`;

export default DropdownMenu;
