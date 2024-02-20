/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, type ReactElement } from 'react';

import { type CogniteCadModel } from '@cognite/reveal';
import { useAllMappedEquipmentAssetMappings, useReveal } from '../..';
import { Color } from 'three';
import { type RuleOutputSet } from './types';
import { generateRuleBasedOutputs } from './utils';
import { type FdmPropertyType } from '../Reveal3DResources/types';

export type ColorOverlayProps = {
  ruleSet: RuleOutputSet | Record<string, any> | FdmPropertyType<Record<string, any>> | undefined;
};

export function RuleBasedOutputsSelector({ ruleSet }: ColorOverlayProps): ReactElement | undefined {
  const viewer = useReveal();

  const models = viewer.models;

  const {
    data: assetMappings,
    isFetching,
    hasNextPage,
    fetchNextPage
  } = useAllMappedEquipmentAssetMappings(models);

  // clean up the appearance
  models.forEach((model) => {
    const currentModel = model as CogniteCadModel;
    currentModel.removeAllStyledNodeCollections();

    currentModel.setDefaultNodeAppearance({
      color: new Color('#efefef')
    });
  });

  useEffect(() => {
    if (!isFetching && hasNextPage !== undefined) {
      void fetchNextPage();
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (assetMappings === undefined || isFetching) return;
    if (ruleSet === undefined) return;

    const initializeRuleBasedOutputs = async (model: CogniteCadModel): Promise<void> => {
      // parse assets and mappings
      const flatAssetsMappingsList =
        assetMappings?.pages[0]
          .flat()
          .map((item) => item.mappings)
          .flat() ?? [];
      const flatMappings = flatAssetsMappingsList.map((node) => node.items).flat();
      const contextualizedAssetNodes =
        assetMappings?.pages[0]
          .flat()
          .map((item) => item.assets)
          .flat() ?? [];

      // ========= Generate Rule Based Outputs
      generateRuleBasedOutputs(model, contextualizedAssetNodes, flatMappings, ruleSet);
    };

    models.forEach((model) => {
      void initializeRuleBasedOutputs(model as CogniteCadModel);
    });
  }, [assetMappings, ruleSet, models]);

  return <></>;
}
