import styled from 'styled-components/macro';
import { Icon, Tabs } from '@cognite/cogs.js';
import { MainPanel } from 'pages/elements';

export const Main = styled(MainPanel)`
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
`;

export const GraphContainer = styled.div`
  position: relative;
  background: #fafafa;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid var(--cogs-bg-control--disabled);
  width: 100%;
  height: fit-content;
  padding: 24px 16px 0 16px;
`;

export const StyledTabs = styled(Tabs)`
  background: none;
`;

export const StyledIcon = styled(Icon)`
  color: ${(props) => props.color};
`;

const calcColWidth = 140;
const shopColWidth = 105;

export const StyledTable = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  overflow: hidden;
  &:hover {
    overflow: auto;
  }
  width: 100%;
  padding-top: 20px;

  font-family: 'Inter';
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;

  thead {
    border-bottom: 1px solid #dcdcdc;
    tr {
      align-items: center;
      th {
        padding-left: 16px;
        font-weight: 500;

        // First column
        &:first-child {
          max-width: 65px;
          height: 22px;
          background: var(--cogs-bg-default);
        }
      }
      // Main columns
      &:first-child {
        th {
          color: var(--cogs-text-primary);
          &:not(:first-child) {
            max-width: 245px;
          }
        }
      }
      // Sub columns
      &:last-child {
        th {
          &:not(:first-child) {
            color: rgba(0, 0, 0, 0.7);
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
          }

          // Auction matrix columns
          &:nth-child(even) {
            max-width: ${calcColWidth}px;
          }

          // Shop columns
          &:nth-child(odd):not(:first-child) {
            max-width: ${shopColWidth}px;
          }
        }
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid var(--cogs-bg-control--disabled);
      td {
        display: flex;
        align-items: center;
        height: 44px;
        padding-left: 16px;

        // First column
        &:first-child {
          max-width: 65px;
          background: var(--cogs-bg-default);
          box-shadow: 1px 0px 0px var(--cogs-bg-control--disabled);
        }

        // Auction matrix columns
        &:nth-child(even) {
          max-width: ${calcColWidth}px;
          border-left: 1px solid var(--cogs-bg-control--disabled);
        }

        // Shop columns
        &:nth-child(odd):not(:first-child) {
          max-width: ${shopColWidth}px;
        }
      }
    }
  }
`;
