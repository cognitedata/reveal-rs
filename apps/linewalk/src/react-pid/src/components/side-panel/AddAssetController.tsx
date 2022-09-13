import React, { useCallback, useState, useEffect } from 'react';
import { useAuthContext } from '@cognite/react-container';
import debounce from 'lodash/debounce';
import { DiagramSymbolInstance, DocumentMetadata } from '@cognite/pid-tools';
import {
  AutoComplete as CogsAutoComplete,
  Button as CogsButton,
  Icon,
  Row,
  Title,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { Asset } from '@cognite/sdk-v5/dist/src/types';

import { CollapseSeperator } from './CollapsableInstanceList';

const multiColName = 'col-2';

const SelectedSymbolInstanceInfo = styled.div`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  .${multiColName} {
    grid-template-columns: 3fr 2fr !important;
    margin-top: 0.5rem;
  }
  .cogs-row {
    gap: 2px !important;
    justify-items: start;
  }
`;

const AutoComplete = styled(CogsAutoComplete)`
  width: 100%;
  height: 28px;
  .cogs-select__control {
    border-radius: 6px 0px 0px 6px;
  }
  .cogs-select__single-value {
    font-size: 13px; // FIX some sort of auto resize
  }
  .cogs-select__option {
    font-size: 11px;
  }
  .cogs-select__menu {
    min-width: 100%;
    width: fit-content;
  }
`;

const AutoCompleteButton = styled(CogsButton)`
  border-radius: 0px 6px 6px 0px;
`;

const AutoCompleteButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const RemovableRow = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

interface Option {
  value: Asset;
  label: string;
}

interface AddAssetControllerProps {
  documentMetadata: DocumentMetadata;
  updateSymbolInstance: (diagramInstance: DiagramSymbolInstance) => void;
  selectedSymbolInstance: DiagramSymbolInstance;
}

export const AddAssetController: React.FC<AddAssetControllerProps> = ({
  documentMetadata,
  updateSymbolInstance,
  selectedSymbolInstance,
}) => {
  const [labelNames, setLabelNames] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clickedAssetOption, setClickedAssetOption] = useState<Asset>();

  const { client } = useAuthContext();

  useEffect(() => {
    const labels = selectedSymbolInstance.labelIds.map(
      (labelId) => document.getElementById(labelId)!.textContent!
    );
    const formattedAssetName = [documentMetadata.unit, ...labels].join('-');

    onSearchInputChange(formattedAssetName);
    setLabelNames(labels);
  }, [selectedSymbolInstance]);

  const searchInputChangedHandler = useCallback(
    debounce((newValue: string): void => {
      if (newValue === '' && search.length > 1) return;

      setSearch(newValue);
      client?.assets
        .search({
          search: {
            query: newValue,
          },
          limit: 20,
        })
        .then((assets) => setAssets(assets));
    }, 300),
    []
  );

  const onSearchInputChange = (newValue: string) => {
    if (newValue) {
      setSearch(newValue);
      searchInputChangedHandler(newValue);
    }
  };

  const handleClickedOption = (result: Option): void => {
    onSearchInputChange(result.label);
    setClickedAssetOption(result.value);
  };

  const assignAsset = (): void => {
    updateSymbolInstance({
      ...selectedSymbolInstance,
      assetId: clickedAssetOption!.id,
      assetName: clickedAssetOption!.name,
    });
  };

  const unassignAsset = () => {
    updateSymbolInstance({
      ...selectedSymbolInstance,
      assetId: undefined,
      assetName: undefined,
    });
  };

  const isDisabled = (): boolean => {
    return (
      !assets.some((asset) => asset.name === search) ||
      clickedAssetOption?.id === selectedSymbolInstance.assetId
    );
  };

  return (
    <div>
      <CollapseSeperator>Selected Symbol Instance</CollapseSeperator>
      {selectedSymbolInstance && (
        <SelectedSymbolInstanceInfo>
          <Row cols={1}>
            <Title level={6}>Symbol Id</Title>
            <span>{selectedSymbolInstance.id}</span>
          </Row>
          <Row cols={2} className={multiColName}>
            <Row cols={1}>
              <Title level={6}>Asset id</Title>
              {selectedSymbolInstance.assetId}
            </Row>
            <Row cols={1}>
              <Title level={6}>Label name</Title>
              {labelNames.join(' ')}
            </Row>
          </Row>
          <Row cols={1}>
            <Title level={6}>Asset name</Title>
            {selectedSymbolInstance.assetName ? (
              <RemovableRow>
                {selectedSymbolInstance.assetName}
                <Icon
                  onClick={unassignAsset}
                  type="Close"
                  size={12}
                  style={{ cursor: 'pointer' }}
                />
              </RemovableRow>
            ) : (
              'undefined'
            )}
          </Row>
        </SelectedSymbolInstanceInfo>
      )}
      <AutoCompleteButtonContainer>
        <AutoComplete
          placeholder="Search for Assets"
          value={selectedSymbolInstance ? { value: search, label: search } : ''}
          options={
            selectedSymbolInstance &&
            assets.map((asset: Asset) => ({
              value: asset,
              label: asset.name,
            }))
          }
          handleInputChange={onSearchInputChange}
          onChange={handleClickedOption}
          menuPlacement="top"
          maxMenuHeight={500}
        />
        <AutoCompleteButton
          type="primary"
          onClick={assignAsset}
          disabled={isDisabled()}
        >
          Add
        </AutoCompleteButton>
      </AutoCompleteButtonContainer>
    </div>
  );
};
