import styled from 'styled-components/macro';

import { AxisLabel } from 'components/Charts/elements';
import { sizes } from 'styles/layout';

export const AxisTitleContainer = styled.div`
  position: sticky;
  left: 0;
  margin: auto;
`;

export const AxisTitle = styled(AxisLabel)`
  transform: rotate(270deg) translateX(50%);
  white-space: nowrap;
  margin: -${sizes.small};
`;
