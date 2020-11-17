import React from 'react';
import { Row } from 'react-table';
import { Badge, Button, Colors, Icon, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';
import StatusMarker from 'components/integrations/cols/StatusMarker';
import { StyledDropdown } from 'styles/StyledDropdown';
import { Status } from '../../model/Status';

const StyledButton = styled((props) => (
  <Button {...props}>{props.children}</Button>
))`
  display: flex;
  &:hover {
    display: flex;
  }
`;
const StyledMenu = styled((props) => <Menu {...props}>{props.children}</Menu>)`
  .cogs-menu-item {
    .cogs-icon-Checkmark {
      svg {
        path {
          fill: ${Colors.primary.hex()};
        }
      }
    }
  }
`;
interface StatusFilterDropdownProps<D extends object> {
  column: {
    id: string;
    filterValue: string;
    setFilter: (filter: string | undefined) => void;
    preFilteredRows: Array<Row<D>>;
  };
}

function StatusFilterDropdown<D extends object>({
  column: { filterValue, setFilter },
}: StatusFilterDropdownProps<D>) {
  const onClickFail = () => {
    setFilter(Status.FAIL);
  };
  const onClickOK = () => {
    setFilter(Status.OK);
  };
  const onClickAll = () => {
    setFilter(undefined);
  };
  const MenuContent = (
    <StyledMenu>
      <Menu.Item
        onClick={onClickFail}
        selected={filterValue === Status.FAIL}
        appendIcon={filterValue === Status.FAIL ? 'Checkmark' : undefined}
        aria-selected={filterValue === Status.FAIL}
        data-testid="status-menu-fail"
      >
        <StatusMarker status={Status.FAIL} dataTestId="status-menu-fail" />
      </Menu.Item>
      <Menu.Item
        onClick={onClickOK}
        selected={filterValue === Status.OK}
        appendIcon={filterValue === Status.OK ? 'Checkmark' : undefined}
        aria-selected={filterValue === Status.OK}
        data-testid="status-menu-ok"
      >
        <StatusMarker status={Status.OK} dataTestId="status-menu-ok" />
      </Menu.Item>
      <Menu.Item
        onClick={onClickAll}
        selected={!filterValue}
        appendIcon={!filterValue ? 'Checkmark' : undefined}
        aria-selected={!filterValue}
        data-testid="status-menu-all"
      >
        <Badge
          text="ALL"
          background="white"
          aria-label="All"
          data-testid="status-menu-all"
        />
      </Menu.Item>
    </StyledMenu>
  );

  return (
    <>
      <StyledDropdown content={MenuContent}>
        <StyledButton unstyled>
          Status
          <Icon type="CaretDown" />
        </StyledButton>
      </StyledDropdown>
    </>
  );
}
export default StatusFilterDropdown;
