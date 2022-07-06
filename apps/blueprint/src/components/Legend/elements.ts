import styled from 'styled-components';
import z from 'utils/z';

export const LegendWrapper = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: ${z.MAXIMUM}};
  background: white;
  padding: 16px;
  box-shadow: var(--cogs-z-8);
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .rule-set--details {
    display: flex;
    align-items: center;
    margin: 4px;
  }
`;
