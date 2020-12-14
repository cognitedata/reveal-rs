import styled from 'styled-components';
import { Colors, Icon } from '@cognite/cogs.js';
import React from 'react';

export const InputWarningIcon = styled((props) => (
  <Icon {...props} type="Warning" />
))`
  margin-left: 0.5rem;
  width: 1.2rem;
  svg {
    g {
      g:first-child {
        path {
          fill: ${(props) => props.$color};
        }
      }
      #Vector {
        path {
          fill: ${Colors.black.hex()};
        }
      }
    }
  }
`;
