import * as React from 'react';
import { Button, Select, OptionType } from '@cognite/cogs.js';
import {
  SymbolType,
  Orientation,
  orientations,
  DocumentType,
  bothSymbolTypes,
  pidSymbolTypes,
  isoSymbolTypes,
  SaveSymbolData,
} from '@cognite/pid-tools';
import styled from 'styled-components';

import { StyledInput } from './elements';

const SelectionWrapper = styled.div`
  padding: 1em 0;
`;

const directionOptions: OptionType<Orientation>[] = orientations.map(
  (direction) => ({
    label: direction,
    value: direction,
  })
);

interface AddSymbolControllerProps {
  symbolSelection: string[];
  saveSymbol: (options: SaveSymbolData) => void;
  hideSelection: boolean;
  toggleHideSelection: () => void;
  clearSymbolSelection: () => void;
  documentType: DocumentType;
}

export const AddSymbolController: React.FC<AddSymbolControllerProps> = ({
  symbolSelection,
  saveSymbol,
  hideSelection,
  toggleHideSelection,
  clearSymbolSelection,
  documentType,
}) => {
  let symbolTypeOptions: OptionType<SymbolType>[];

  if (documentType === DocumentType.pid) {
    symbolTypeOptions = [...bothSymbolTypes, ...pidSymbolTypes]
      .sort()
      .map((symbolType) => ({
        label: symbolType,
        value: symbolType,
      }));
  } else if (documentType === DocumentType.isometric) {
    symbolTypeOptions = [...bothSymbolTypes, ...isoSymbolTypes]
      .sort()
      .map((symbolType) => ({
        label: symbolType,
        value: symbolType,
      }));
  } else {
    symbolTypeOptions = [...bothSymbolTypes].sort().map((symbolType) => ({
      label: symbolType,
      value: symbolType,
    }));
  }

  const [description, setDescription] = React.useState<string>('');

  const [selectedSymbolTypeOption, setSelectedSymbolTypeOption] =
    React.useState<OptionType<SymbolType>>(symbolTypeOptions[0]);

  const [direction, setDirection] = React.useState<OptionType<Orientation>>(
    directionOptions[1]
  );

  const saveSymbolWrapper = () => {
    setDescription('');
    if (selectedSymbolTypeOption.value === 'File connection') {
      saveSymbol({
        symbolType: selectedSymbolTypeOption.value!,
        description,
        direction: direction.value,
      });
    } else {
      saveSymbol({ symbolType: selectedSymbolTypeOption.value!, description });
    }
  };

  const isDisabled = () => {
    return symbolSelection.length === 0 || description === '';
  };

  return (
    <>
      <SelectionWrapper>
        <span>{`${symbolSelection.length} selected`}</span>
        <div>
          <Button
            type={hideSelection ? 'danger' : 'secondary'}
            onClick={toggleHideSelection}
          >
            {hideSelection ? 'Show Selection' : 'Hide Selection'}
          </Button>
          <Button
            disabled={symbolSelection.length === 0}
            onClick={clearSymbolSelection}
          >
            Clear Selection
          </Button>
        </div>
      </SelectionWrapper>

      <Select
        closeMenuOnSelect
        title="Symbol type"
        value={selectedSymbolTypeOption}
        onChange={setSelectedSymbolTypeOption}
        options={symbolTypeOptions}
        menuPlacement="top"
        maxMenuHeight={500}
      />
      {selectedSymbolTypeOption.value === 'File connection' && (
        <Select
          closeMenuOnSelect
          title="Direction"
          value={direction}
          onChange={setDirection}
          options={directionOptions}
          menuPlacement="top"
          maxMenuHeight={500}
        />
      )}
      <div>
        <StyledInput
          width={100}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (isDisabled()) {
                return true;
              }
              saveSymbolWrapper();
              event.preventDefault();
              return false;
            }
            return true;
          }}
          postfix={
            <Button
              type="primary"
              onClick={saveSymbolWrapper}
              disabled={isDisabled()}
            >
              Add
            </Button>
          }
        />
      </div>
    </>
  );
};
