/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement, useMemo } from 'react';
import { useAssetsByIdsQuery } from '../../query';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { useDmInstancesByIds } from '../../query/useDmsInstanceByIdsQuery';
import { COGNITE_DESCRIBABLE_SOURCE } from '../../data-providers/core-dm-provider/dataModels';
import { HexagonIcon, Input, Tooltip } from '@cognite/cogs.js';
import { type InstanceReference, isDmsInstance, isIdEither } from '../../utilities/instanceIds';

const nameableSources = [COGNITE_DESCRIBABLE_SOURCE];

const MAX_LABEL_LENGTH = 20;

export type InstanceLabelProps = { instance: InstanceReference };

export const InstanceLabel = ({ instance }: { instance: InstanceReference }): ReactElement => {
  const [assetIds, fdmIds] = useMemo(
    () => [
      isIdEither(instance) ? [instance] : EMPTY_ARRAY,
      isDmsInstance(instance) ? [instance] : EMPTY_ARRAY
    ],
    [instance]
  );

  const { data: assets } = useAssetsByIdsQuery(assetIds);
  const { data: fdmNodes } = useDmInstancesByIds(fdmIds, nameableSources);

  const labelText = useMemo(() => {
    if (assets === undefined && fdmNodes === undefined) {
      return undefined;
    }

    if (assets !== undefined && assets.length > 0) {
      return assets[0].name;
    }

    if (fdmNodes !== undefined && fdmNodes.length > 0) {
      return (
        fdmNodes[0].properties.cdf_cdm?.[
          `${COGNITE_DESCRIBABLE_SOURCE.externalId}/${COGNITE_DESCRIBABLE_SOURCE.version}`
        ]?.name ?? fdmNodes[0].externalId
      );
    }

    return 'Unknown';
  }, [assets, fdmNodes]);

  const labelTextString = labelText?.toString();
  const isLargeLabel =
    labelTextString?.length !== undefined && labelTextString.length > MAX_LABEL_LENGTH;
  const label = isLargeLabel
    ? `${labelTextString?.slice(0, MAX_LABEL_LENGTH)}...`
    : labelTextString;

  return (
    <Tooltip disabled={!isLargeLabel} key={labelTextString} content={labelTextString}>
      <Input icon={<HexagonIcon />} value={label} disabled />
    </Tooltip>
  );
};
