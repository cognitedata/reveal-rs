/*!
 * Copyright 2023 Cognite AS
 */

import { type AssetMapping } from '../../components';
import { type CadModelOptions } from '../../components/Reveal3DResources/types';

export type ModelWithAssetMappings = {
  model: CadModelOptions;
  assetMappings: AssetMapping[];
};
