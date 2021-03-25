import { AssetSelect } from '@cognite/data-exploration';
import styled from 'styled-components';
import { Body } from '@cognite/cogs.js';
import React from 'react';

export const AssetSelector = (props: {
  assets: number[] | undefined;
  onSelectAssets: (assets: number[] | undefined) => void;
}) => {
  return (
    <AssetSelectContainer>
      <AssetSelectTitle level={2}>Search for asset</AssetSelectTitle>
      <AssetSelectWrapper>
        <AssetSelect
          isMulti
          selectedAssetIds={props.assets}
          onAssetSelected={(assetIds) => {
            props.onSelectAssets(assetIds);
          }}
        />
      </AssetSelectWrapper>
    </AssetSelectContainer>
  );
};

const AssetSelectContainer = styled.div`
  margin-bottom: 18px;
`;

const AssetSelectTitle = styled(Body)``;
const AssetSelectWrapper = styled.div`
  padding: 5px 3px;
`;
