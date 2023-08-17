import styled from 'styled-components';

import { Body } from '@cognite/cogs.js';

export const StyledEndpoint = styled.div`
  background-color: var(--cogs-greyscale-grey2);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 20px;
  width: 500px;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: rtl;
  text-align: left;
`;

export const StyledWrapper = styled(Body)`
  margin-bottom: 16px;
`;
