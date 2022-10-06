import { AssetSelect } from 'app/containers/Asset/AssetSelect';
import React from 'react';
import { FilterFacetTitle } from '../FilterFacetTitle';

export const ByAssetFilter = ({
  value,
  setValue,
  title = 'Asset',
}: {
  value: number[] | undefined;
  setValue: (newValue: number[] | undefined) => void;
  title?: string;
}) => {
  const setFilterByAsset = (assetIds?: number[]) => {
    setValue(assetIds);
  };

  return (
    <>
      <FilterFacetTitle>{title}</FilterFacetTitle>
      <AssetSelect
        isMulti
        selectedAssetIds={value}
        onAssetSelected={setFilterByAsset}
      />
    </>
  );
};
