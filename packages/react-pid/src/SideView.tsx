import * as React from 'react';
import styled from 'styled-components';
import { saveAs } from 'file-saver';
import {
  Input,
  Button,
  ToolBar,
  ToolBarButton,
  Collapse,
} from '@cognite/cogs.js';
import {
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
} from '@cognite/pid-tools';

const saveSymbolsAsJson = (symbols: DiagramSymbol[]) => {
  const jsonData = {
    symbols,
  };
  const fileToSave = new Blob([JSON.stringify(jsonData, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'DiagramSymbols.json');
};

const SidePanelWrapper = styled.div`
  display: grid;
  grid-template-rows: max-content auto max-content;
  height: 100%;
`;

const ScrollWrapper = styled.div`
  height: 100%;
  overflow-y: scroll;
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

const CollapseHeader = styled.div`
  display: grid;
  grid-template-columns: auto 3rem max-content;
  align-items: center;
  width: 100%;
`;

const CollapseSeperator = styled.div`
  padding: 0.5rem 1rem;
`;

interface SideViewProps {
  active: string;
  symbols: DiagramSymbol[];
  lines: DiagramLineInstance[];
  symbolInstances: DiagramSymbolInstance[];
  selection: SVGElement[];
  setActive: (arg0: string) => void;
  loadSymbolsAsJson: (args0: string) => void;
  saveSymbol: (symbolName: string, selection: SVGElement[]) => void;
}

export const SideView = ({
  active,
  symbols,
  lines,
  symbolInstances,
  selection,
  setActive,
  loadSymbolsAsJson,
  saveSymbol,
}: SideViewProps) => {
  const [symbolText, setSymbolText] = React.useState<string>('');

  const handleSymbolFileChange = ({ target }: any) => {
    if (target && target.files.length > 0) {
      fetch(URL.createObjectURL(target.files[0]))
        .then((response) => {
          return response.json();
        })
        .then((json) => loadSymbolsAsJson(json));
    }
  };

  const ActionWithCustomStyling: ToolBarButton[][] = [
    [
      {
        icon: 'PlusCompact',
        onClick: () =>
          active === 'AddSymbol' ? setActive('') : setActive('AddSymbol'),
        className: `${active === 'AddSymbol' && 'active'}`,
        description: 'Add symbol',
      },
      {
        icon: 'VectorLine',
        onClick: () =>
          active === 'AddLine' ? setActive('') : setActive('AddLine'),
        className: `${active === 'AddLine' && 'active'}`,
        description: 'Add line',
      },
    ],
  ];

  const symbolHeaderRenderer = (symbol: DiagramSymbol) => {
    const { boundingBox } = symbol.svgRepresentations[0];
    const viewboxPadding = 10;

    return (
      <CollapseHeader>
        <span>
          {`${symbol.symbolName} (${
            symbolInstances.filter(
              (instance) => instance.symbolName === symbol.symbolName
            ).length
          })`}
        </span>
        <svg
          viewBox={`${boundingBox.x - viewboxPadding} ${
            boundingBox.y - viewboxPadding
          } ${boundingBox.width + viewboxPadding * 2} ${
            boundingBox.height + viewboxPadding * 2
          }`}
          style={{ aspectRatio: '1 / 1', height: '2rem' }}
        >
          {symbol.svgRepresentations[0].svgPaths.map((path) => {
            return (
              <path
                key={path.svgCommands}
                d={path.svgCommands}
                style={{
                  strokeWidth: '12',
                  stroke: 'black',
                  fill: 'none',
                }}
              />
            );
          })}
        </svg>
        <span>({symbol.svgRepresentations.length})</span>
      </CollapseHeader>
    );
  };

  const renderSymbolInstances = (symbol: DiagramSymbol) => {
    return (
      <div>
        {symbolInstances
          .filter((instance) => {
            return instance.symbolName === symbol.symbolName;
          })
          .map((instance) => (
            <p key={instance.pathIds.join('')}>
              {instance.symbolName}&nbsp;-&nbsp;
              {instance.pathIds.join(' ')}
            </p>
          ))}
      </div>
    );
  };

  return (
    <SidePanelWrapper>
      <div>
        <input
          type="file"
          accept="application/JSON"
          onChange={handleSymbolFileChange}
        />
      </div>
      <ScrollWrapper>
        <Collapse accordion ghost>
          <CollapseSeperator>Lines</CollapseSeperator>
          <Collapse.Panel header={`Flowlines (${lines?.length || 0})`}>
            {lines?.map((line) => (
              <p key={line.pathIds.join('')}>
                {line.symbolName}&nbsp;-&nbsp;
                {line.pathIds.join(' . ')}
              </p>
            ))}
          </Collapse.Panel>
          <CollapseSeperator>Symbols</CollapseSeperator>
          {symbols.map((symbol) => {
            return (
              <Collapse.Panel
                header={symbolHeaderRenderer(symbol)}
                key={symbol.svgRepresentations[0].svgPaths
                  .map((svgPath) => svgPath.svgCommands)
                  .join()}
              >
                {renderSymbolInstances(symbol)}
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </ScrollWrapper>
      <div>
        {active === 'AddSymbol' && (
          <Input
            value={symbolText}
            onChange={(e) => setSymbolText(e.target.value)}
            title="Symbol name"
            postfix={
              <Button
                type="primary"
                onClick={() => {
                  setSymbolText('');
                  saveSymbol(symbolText, selection);
                }}
                disabled={selection.length === 0 || symbolText === ''}
              >
                Add
              </Button>
            }
          />
        )}
        <Button
          onClick={() => saveSymbolsAsJson(symbols)}
          disabled={symbols.length === 0}
        >
          Download symbols as JSON
        </Button>

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
