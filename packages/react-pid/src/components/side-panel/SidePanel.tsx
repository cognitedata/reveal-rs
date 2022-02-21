import styled from 'styled-components';
import { Button, ToolBarButton } from '@cognite/cogs.js';
import {
  DiagramConnection,
  DiagramEquipmentTagInstance,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
  DocumentMetadata,
  DocumentType,
  GraphDocument,
  PidDocumentWithDom,
  ToolType,
  SaveSymbolData,
} from '@cognite/pid-tools';

import { CollapsableInstanceList } from './CollapsableInstanceList';
import { FileController } from './FileController';
import { AddSymbolController } from './AddSymbolController';
import { DocumentTypeSelector } from './DocumentTypeSelector';
import { AddLineNumberController } from './AddLineNumberController';
import { DocumentInfo } from './DocumentInfo';

const SidePanelWrapper = styled.div`
  display: grid;
  grid-template-rows: max-content max-content auto max-content;
  height: 100%;
  position: relative;
`;

const FileControllerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > span {
    margin: 0 auto;
  }
`;

interface SidePanelProps {
  getPidDocument: () => PidDocumentWithDom | undefined;
  activeTool: ToolType;
  setActiveTool: (arg0: ToolType) => void;
  symbols: DiagramSymbol[];
  lines: DiagramLineInstance[];
  symbolInstances: DiagramSymbolInstance[];
  symbolSelection: string[];
  loadSymbolsAsJson: (json: GraphDocument) => void;
  saveSymbol: (options: SaveSymbolData) => void;
  deleteSymbol: (symbol: DiagramSymbol) => void;
  deleteConnection: (connection: DiagramConnection) => void;
  connections: DiagramConnection[];
  fileUrl: string;
  autoAnalysis: () => void;
  saveGraphAsJson: () => void;
  documentMetadata: DocumentMetadata;
  setDocumentType: (type: DocumentType) => void;
  lineNumbers: number[];
  setLineNumbers: (arg: number[]) => void;
  activeLineNumber: number | null;
  setActiveLineNumber: (arg: number | null) => void;
  equipmentTags: DiagramEquipmentTagInstance[];
  setEquipmentTags: (arg: DiagramEquipmentTagInstance[]) => void;
  activeTagId: string | null;
  setActiveTagId: (arg: string | null) => void;
  splitLines: () => void;
  hideSelection: boolean;
  toggleHideSelection: () => void;
  clearSymbolSelection: () => void;
  jsonInputRef: (node: HTMLInputElement | null) => void;
  onUploadJsonClick: () => void;
}

export const SidePanel = ({
  getPidDocument,
  activeTool,
  setActiveTool,
  symbols,
  lines,
  symbolInstances,
  symbolSelection,
  loadSymbolsAsJson,
  saveSymbol,
  deleteSymbol,
  deleteConnection,
  connections,
  fileUrl,
  autoAnalysis,
  saveGraphAsJson,
  documentMetadata,
  setDocumentType,
  lineNumbers,
  setLineNumbers,
  activeLineNumber,
  setActiveLineNumber,
  equipmentTags,
  setEquipmentTags,
  activeTagId,
  setActiveTagId,
  splitLines,
  hideSelection,
  toggleHideSelection,
  clearSymbolSelection,
  jsonInputRef,
  onUploadJsonClick,
}: SidePanelProps) => {
  const toolBarButtonGroups: ToolBarButton[][] = [
    [
      {
        icon: 'Add',
        onClick: () => setActiveTool('addSymbol'),
        className: `${activeTool === 'addSymbol' && 'active'}`,
        description: 'Add symbol',
      },
      {
        icon: 'VectorLine',
        onClick: () => setActiveTool('addLine'),
        className: `${activeTool === 'addLine' && 'active'}`,
        description: 'Add line',
      },
      {
        icon: 'Split',
        onClick: () => setActiveTool('connectInstances'),
        className: `${activeTool === 'connectInstances' && 'active'}`,
        description: 'Connect instances',
      },
      {
        icon: 'Flag',
        onClick: () => setActiveTool('connectLabels'),
        className: `${activeTool === 'connectLabels' && 'active'}`,
        description: 'Connect labels',
      },
      {
        icon: 'Number',
        onClick: () => setActiveTool('setLineNumber'),
        className: `${activeTool === 'setLineNumber' && 'active'}`,
        description: 'Set line number',
      },
      {
        icon: 'String',
        onClick: () => setActiveTool('addEquipmentTag'),
        className: `${activeTool === 'addEquipmentTag' && 'active'}`,
        description: 'Add equipment tag',
      },
    ],
  ];

  if (documentMetadata.type === DocumentType.pid) {
    toolBarButtonGroups[0].push({
      icon: 'Slice',
      onClick: () => setActiveTool('splitLine'),
      className: `${activeTool === 'splitLine' && 'active'}`,
      description: 'Split line',
    });
  }

  const setActiveTagWrapper = (arg: string | null) => {
    setActiveTool('addEquipmentTag');
    setActiveTagId(arg);
  };

  return (
    <SidePanelWrapper>
      <FileControllerWrapper>
        <FileController
          disabled={fileUrl === ''}
          symbols={symbols}
          symbolInstances={symbolInstances}
          lineInstances={lines}
          loadSymbolsAsJson={loadSymbolsAsJson}
          saveGraphAsJson={saveGraphAsJson}
          getPidDocument={getPidDocument}
          jsonInputRef={jsonInputRef}
          onUploadJsonClick={onUploadJsonClick}
        />
      </FileControllerWrapper>
      <DocumentInfo documentMetadata={documentMetadata} />
      <CollapsableInstanceList
        symbols={symbols}
        symbolInstances={symbolInstances}
        lineInstances={lines}
        deleteSymbol={deleteSymbol}
        deleteConnection={deleteConnection}
        connections={connections}
        equipmentTags={equipmentTags}
        setEquipmentTags={setEquipmentTags}
        activeTagId={activeTagId}
        setActiveTagId={setActiveTagWrapper}
        documentType={documentMetadata.type}
      />

      {documentMetadata.type === DocumentType.pid && (
        <Button onClick={splitLines}>Split Lines</Button>
      )}

      <Button onClick={autoAnalysis}>Auto Analysis</Button>

      <div>
        {activeTool === 'addSymbol' && (
          <AddSymbolController
            symbolSelection={symbolSelection}
            clearSymbolSelection={clearSymbolSelection}
            saveSymbol={saveSymbol}
            hideSelection={hideSelection}
            toggleHideSelection={toggleHideSelection}
            documentType={documentMetadata.type}
          />
        )}
        {activeTool === 'setLineNumber' && (
          <AddLineNumberController
            lineNumbers={lineNumbers}
            setLineNumbers={setLineNumbers}
            activeLineNumber={activeLineNumber}
            setActiveLineNumber={setActiveLineNumber}
          />
        )}
      </div>
      {activeTool === 'selectDocumentType' && fileUrl !== '' && (
        <DocumentTypeSelector setDocumentType={setDocumentType} />
      )}
    </SidePanelWrapper>
  );
};
