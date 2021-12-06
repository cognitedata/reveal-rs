import styled from 'styled-components';
import { ToolBar, ToolBarButton } from '@cognite/cogs.js';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
} from '@cognite/pid-tools';
import { ToolType } from 'types';

import { CollapsableInstanceList } from './CollapsableInstanceList';
import { FileController } from './FileController';
import { AddSymbolController } from './AddSymbolController';

const SidePanelWrapper = styled.div`
  display: grid;
  grid-template-rows: max-content auto max-content;
  height: 100%;
`;

const ToolBarWrapper = styled.div`
  padding: 40px;
  .active {
    background-color: var(--cogs-btn-color-primary);
    color: white;
    &:hover {
      background-color: var(--cogs-btn-color-primary);
      color: white;
    }
  }
`;

interface SidePanelProps {
  active: ToolType;
  symbols: DiagramSymbol[];
  lines: DiagramLineInstance[];
  symbolInstances: DiagramSymbolInstance[];
  selection: SVGElement[];
  setActive: (arg0: ToolType) => void;
  loadSymbolsAsJson: (args0: string) => void;
  saveSymbol: (symbolName: string, selection: SVGElement[]) => void;
  deleteSymbol: (symbol: DiagramSymbol) => void;
  connections: DiagramConnection[];
  fileUrl?: string;
  saveGraphAsJson: () => void;
}

export const SidePanel = ({
  active,
  symbols,
  lines,
  symbolInstances,
  selection,
  setActive,
  loadSymbolsAsJson,
  saveSymbol,
  deleteSymbol,
  connections,
  fileUrl,
  saveGraphAsJson,
}: SidePanelProps) => {
  const ActionWithCustomStyling: ToolBarButton[][] = [
    [
      {
        icon: 'PlusCompact',
        onClick: () => setActive('addSymbol'),
        className: `${active === 'addSymbol' && 'active'}`,
        description: 'Add symbol',
      },
      {
        icon: 'VectorLine',
        onClick: () => setActive('addLine'),
        className: `${active === 'addLine' && 'active'}`,
        description: 'Add line',
      },
      {
        icon: 'Split',
        onClick: () => setActive('connectInstances'),
        className: `${active === 'connectInstances' && 'active'}`,
        description: 'Connect instances',
      },
    ],
  ];

  return (
    <SidePanelWrapper>
      <FileController
        disabled={fileUrl === ''}
        symbols={symbols}
        symbolInstances={symbolInstances}
        lineInstances={lines}
        loadSymbolsAsJson={loadSymbolsAsJson}
        saveGraphAsJson={saveGraphAsJson}
      />
      <CollapsableInstanceList
        symbols={symbols}
        symbolInstances={symbolInstances}
        lineInstances={lines}
        deleteSymbol={deleteSymbol}
        connections={connections}
      />
      <div>
        {active === 'addSymbol' &&
          AddSymbolController({ selection, saveSymbol })}

        <ToolBarWrapper>
          <ToolBar
            direction="horizontal"
            buttonGroups={ActionWithCustomStyling}
          />
        </ToolBarWrapper>
      </div>
    </SidePanelWrapper>
  );
};
