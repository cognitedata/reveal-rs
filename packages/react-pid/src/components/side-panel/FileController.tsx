import * as React from 'react';
import styled from 'styled-components';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import {
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
  GraphDocument,
  PidDocumentWithDom,
  saveSymbolsAsJson,
  isValidSymbolFileSchema,
} from '@cognite/pid-tools';

const DropDownWrapper = styled.div`
  text-align: left;
`;

interface FileControllerProps {
  symbols: DiagramSymbol[];
  symbolInstances: DiagramSymbolInstance[];
  lineInstances: DiagramLineInstance[];
  disabled: boolean;
  loadSymbolsAsJson: (json: GraphDocument) => void;
  saveGraphAsJson: () => void;
  getPidDocument: () => PidDocumentWithDom | undefined;
  jsonInputRef: (node: HTMLInputElement | null) => void;
  onUploadJsonClick: () => void;
}

export const FileController: React.FC<FileControllerProps> = ({
  symbols,
  symbolInstances,
  disabled,
  loadSymbolsAsJson,
  saveGraphAsJson,
  lineInstances,
  getPidDocument,
  jsonInputRef,
  onUploadJsonClick,
}) => {
  const handleSymbolFileChange = ({ target }: any) => {
    if (target && target.files.length > 0) {
      fetch(URL.createObjectURL(target.files[0]))
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          const pidDocument = getPidDocument();
          if (pidDocument && isValidSymbolFileSchema(json, pidDocument.svg)) {
            loadSymbolsAsJson(json);
          }
        });
    }
  };

  return (
    <div>
      <DropDownWrapper>
        <Dropdown
          content={
            <Menu>
              <Menu.Item onClick={onUploadJsonClick}>Upload</Menu.Item>
              <Menu.Item
                onClick={saveGraphAsJson}
                disabled={
                  symbolInstances.length === 0 && lineInstances.length === 0
                }
              >
                Download Graph
              </Menu.Item>
              <Menu.Item
                onClick={() => saveSymbolsAsJson(symbols)}
                disabled={symbols.length === 0}
              >
                Download Legend
              </Menu.Item>
            </Menu>
          }
        >
          <Button disabled={disabled} icon="ChevronDown" iconPlacement="right">
            File
          </Button>
        </Dropdown>
      </DropDownWrapper>

      <input
        type="file"
        ref={jsonInputRef}
        style={{ display: 'none' }}
        accept="application/JSON"
        onChange={handleSymbolFileChange}
      />
    </div>
  );
};
