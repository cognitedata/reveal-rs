/*!
 * Copyright 2024 Cognite AS
 */
import { useEffect, type ReactElement, useState } from 'react';

import { CogniteCadModel } from '@cognite/reveal';
import { useAllMappedEquipmentAssetMappings } from '../..';
import { type AssetStylingGroupAndStyleIndex } from './types';
import { generateRuleBasedOutputs } from './utils';
import { use3dModels } from '../../hooks/use3dModels';
import { filterUndefined } from '../../utilities/filterUndefined';
import { type FdmPropertyType } from '../Reveal3DResources/types';
import { EMPTY_ARRAY } from '../../utilities/constants';

export type ColorOverlayProps = {
  ruleSet: Record<string, any> | FdmPropertyType<Record<string, any>> | undefined;
  onRuleSetChanged?: (currentStylings: AssetStylingGroupAndStyleIndex[] | undefined) => void;
};

export function RuleBasedOutputsSelector({
  ruleSet,
  onRuleSetChanged
}: ColorOverlayProps): ReactElement | undefined {
  const models = use3dModels();

  const [stylingGroups, setStylingsGroups] = useState<AssetStylingGroupAndStyleIndex[]>();

  const {
    data: assetMappings,
    isFetching,
    hasNextPage,
    fetchNextPage
  } = useAllMappedEquipmentAssetMappings(models);

  useEffect(() => {
    if (!isFetching && hasNextPage === true) {
      void fetchNextPage();
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (onRuleSetChanged !== undefined) onRuleSetChanged(stylingGroups);
  }, [stylingGroups]);

  useEffect(() => {
    if (assetMappings === undefined || models === undefined || isFetching) return;

    setStylingsGroups(EMPTY_ARRAY);

    if (ruleSet === undefined) return;

    const initializeRuleBasedOutputs = async (model: CogniteCadModel): Promise<void> => {
      // parse assets and mappings
      // TODO: refactor to be sure to filter only the mappings/assets for the current model within the pages
      const flatAssetsMappingsList =
        assetMappings?.pages
          .flat()
          .map((item) => item.mappings)
          .flat() ?? [];
      const flatMappings = flatAssetsMappingsList.map((node) => node.items).flat();
      const contextualizedAssetNodes =
        assetMappings?.pages
          .flat()
          .map((item) => item.assets)
          .flat() ?? [];

      const collectionStylings = await generateRuleBasedOutputs(
        model,
        contextualizedAssetNodes,
        flatMappings,
        ruleSet
      );

      setStylingsGroups(collectionStylings);
    };

    models.forEach(async (model) => {
      if (!(model instanceof CogniteCadModel)) {
        return;
      }
      await initializeRuleBasedOutputs(model);
    });
  }, [assetMappings, ruleSet]);

  return <></>;
}
