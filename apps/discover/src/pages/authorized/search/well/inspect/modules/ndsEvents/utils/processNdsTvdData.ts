import { NdsInternal } from 'domain/wells/nds/internal/types';
import { getTvdForMd } from 'domain/wells/trajectory/internal/transformers/getTvdForMd';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/trajectory/internal/types';

import isUndefined from 'lodash/isUndefined';
import { Fixed } from 'utils/number';
import { adaptToConvertedDistance } from 'utils/units/adaptToConvertedDistance';

import { NdsView } from '../types';

export const processNdsTvdData = (
  nds: NdsInternal,
  trueVerticalDepths?: TrueVerticalDepthsDataLayer
) => {
  const tvdData: Partial<NdsView> = {};

  if (!trueVerticalDepths) {
    return tvdData;
  }

  const { holeStart, holeEnd } = nds.original;

  const { unit } = trueVerticalDepths.trueVerticalDepthUnit;

  if (holeStart) {
    const holeStartTvdValue = getTvdForMd(
      holeStart,
      trueVerticalDepths,
      Fixed.NoDecimals
    );

    if (!isUndefined(holeStartTvdValue)) {
      tvdData.holeStartTvd = adaptToConvertedDistance(holeStartTvdValue, unit);
    }
  }

  if (holeEnd) {
    const holeEndTvdValue = getTvdForMd(
      holeEnd,
      trueVerticalDepths,
      Fixed.NoDecimals
    );

    if (!isUndefined(holeEndTvdValue)) {
      tvdData.holeEndTvd = adaptToConvertedDistance(holeEndTvdValue, unit);
    }
  }

  return tvdData;
};
