import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { useAvailableOps } from 'components/NodeEditor/AvailableOps';
import ToolboxFunctionDropdown from 'components/ToolboxFunctionDropdown/ToolboxFunctionDropdown';
import { SourceCircle, SourceSquare } from 'pages/ChartView/elements';
import { useState } from 'react';
import { getCategoriesFromToolFunctions } from 'components/Nodes/utils';
import { ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import styled from 'styled-components/macro';
import Layers from 'utils/z-index';
import { Operation } from '@cognite/calculation-backend';

interface AddButtonProps {
  sources: (ChartTimeSeries | ChartWorkflow)[];
  addSourceNode: (
    event: React.MouseEvent,
    source: ChartTimeSeries | ChartWorkflow
  ) => void;
  addFunctionNode: (event: React.MouseEvent, func: Operation) => void;
  addConstantNode: (event: React.MouseEvent) => void;
}

interface AddMenuProps extends AddButtonProps {
  onFunctionSelected?: (func: Operation) => void;
}

export const SourceListDropdown = ({
  sources,
  addSourceNode,
}: Omit<AddButtonProps, 'addFunctionNode' | 'addConstantNode'>) => {
  return (
    <SourceDropdownMenu>
      <Menu.Header>Select wanted sources</Menu.Header>
      {sources.map((source) => (
        <SourceMenuItem
          key={source.id}
          onClick={(event) => addSourceNode(event, source)}
        >
          {source.type === 'timeseries' ? (
            <SourceCircle color={source?.color} fade={false} />
          ) : (
            <SourceSquare color={source?.color} fade={false} />
          )}
          {source.name}
        </SourceMenuItem>
      ))}
    </SourceDropdownMenu>
  );
};

export const AddMenu = ({
  sources,
  addSourceNode,
  addFunctionNode,
  addConstantNode,
  onFunctionSelected = () => {},
}: AddMenuProps) => {
  const [isLoading, _, operations = []] = useAvailableOps();

  return (
    <AddDropdownMenu>
      <Menu.Submenu
        content={
          <SourceListDropdown sources={sources} addSourceNode={addSourceNode} />
        }
      >
        <span>Source</span>
      </Menu.Submenu>
      {isLoading && <Icon type="Loading" />}
      {!!operations.length && (
        <ToolboxFunctionDropdown
          categories={{
            Recent: [],
            ...getCategoriesFromToolFunctions(operations),
          }}
          onFunctionSelected={(func: Operation, event: React.MouseEvent) => {
            onFunctionSelected(func);
            addFunctionNode(event, func);
          }}
        >
          <Menu.Item appendIcon="ChevronRightCompact">Function</Menu.Item>
        </ToolboxFunctionDropdown>
      )}
      <Menu.Item onClick={addConstantNode}>Constant</Menu.Item>
    </AddDropdownMenu>
  );
};

const AddButton = ({
  sources,
  addSourceNode,
  addFunctionNode,
  addConstantNode,
}: AddButtonProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  return (
    <AddDropdownContainer>
      <Dropdown
        visible={isMenuVisible}
        onClickOutside={() => setIsMenuVisible(false)}
        content={
          <AddMenu
            sources={sources}
            addSourceNode={addSourceNode}
            addFunctionNode={addFunctionNode}
            addConstantNode={addConstantNode}
            onFunctionSelected={() => setIsMenuVisible(false)}
          />
        }
      >
        <Button
          icon="PlusCompact"
          iconPlacement="right"
          type="primary"
          size="small"
          onClick={() => setIsMenuVisible(!isMenuVisible)}
        >
          Add
        </Button>
      </Dropdown>
    </AddDropdownContainer>
  );
};

const AddDropdownContainer = styled.div`
  position: absolute;
  min-width: 200px;
  top: 5px;
  left: 5px;
  z-index: ${Layers.MINIMUM};
`;

const AddDropdownMenu = styled(Menu)`
  width: 180px;
  padding: 5px 0;
`;

const SourceDropdownMenu = styled(Menu)`
  width: 250px;
  padding: 5px 0;
`;

const SourceMenuItem = styled(Menu.Item)`
  height: 40px;
  text-align: left;
  word-break: break-all;
`;

export default AddButton;
