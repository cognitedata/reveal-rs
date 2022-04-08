import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { sizes } from 'styles/layout';

export const Row = styled.div`
  display: flex;
  padding-bottom: 5px;
`;

export const Seperator = styled.div`
  padding: 4px;
`;

export const Panel = styled.div`
  display: grid;
  justify-content: space-around;
  width: 300px;
  max-height: 400px;
  overflow: auto;
  padding: 6px 10px !important;
  position: absolute;
  margin-top: 5px;
  zindex: ${layers.MANAGE_COLUMNS};
  border: 1px solid var(--cogs-greyscale-grey5);
  border-radius: ${sizes.small};
  background-color: var(--cogs-white);
  box-shadow: var(--cogs-z-8);
`;
