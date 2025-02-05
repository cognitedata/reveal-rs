/*!
 * Copyright 2025 Cognite AS
 */
import { HasExistingDataFilterV3, TableExpressionDataModelsBoolFilter, TableExpressionLeafFilter } from '@cognite/sdk';
import { CORE_DM_3D_REVISION_VIEW_REFERENCE, CORE_DM_IMAGE_360_VIEW_REFERENCE } from './sources';
import { CORE_DM_3D_CONTAINER_SPACE } from '../../utilities/constants';

export const isCoreDmImage360CollectionFilter = {
  and: [
    {
      hasData: [CORE_DM_3D_REVISION_VIEW_REFERENCE]
    } satisfies HasExistingDataFilterV3,
    {
      equals: {
        property: [CORE_DM_3D_CONTAINER_SPACE, 'Cognite3DRevision', 'type'],
        value: 'Image360'
      }
    }
  ]
} as const satisfies TableExpressionDataModelsBoolFilter;

export const isCoreDmImage360Filter = {
  hasData: [CORE_DM_IMAGE_360_VIEW_REFERENCE]
} as const satisfies HasExistingDataFilterV3;
