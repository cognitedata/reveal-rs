import styled from 'styled-components';

import { Icon, Title } from '@cognite/cogs.js';

import { BaseCommand } from '../../../Core/Commands/BaseCommand';
import { ToolBar } from '../../../UserInterface/Components/ToolBar/ToolBar';

interface ExpansionViewProps {
  id: string;
  title: string;
  isExpanded?: boolean;
  onSectionExpand: (id: string, expandStatus: boolean) => void;
  toolBar?: BaseCommand[];
  children: any;
}

export const ExpansionView = (props: ExpansionViewProps) => {
  const { id, title, isExpanded, onSectionExpand, toolBar, children } = props;

  return (
    <Collapse>
      <CollapseHeader
        onClick={() => onSectionExpand(id, !isExpanded)}
        role="button"
        tabIndex={0}
      >
        <Title level={6} as="h6">
          {title}
        </Title>
        {isExpanded ? (
          <Icon type="ChevronDownLarge" />
        ) : (
          <Icon type="ChevronUpLarge" />
        )}
      </CollapseHeader>
      {isExpanded && (
        <CollapsePanel>
          <ToolBar toolBar={toolBar} sectionId={id} />
          {children}
        </CollapsePanel>
      )}
    </Collapse>
  );
};

const Collapse = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  margin-bottom: 5px;

  :last-child {
    margin-bottom: 0;
  }
`;
const CollapseHeader = styled.div`
  padding: 14px;
  background: #fafafa;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Inter', sans-serif;
`;
const CollapsePanel = styled.div`
  padding: 10px;
`;
