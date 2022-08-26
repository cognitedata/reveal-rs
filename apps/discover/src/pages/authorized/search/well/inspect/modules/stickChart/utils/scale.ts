import { ScaleLinear, scaleLinear } from 'd3-scale';
import head from 'lodash/head';
import last from 'lodash/last';
import times from 'lodash/times';

import { EMPTY_ARRAY } from 'constants/empty';

import {
  SCALE_BLOCK_HEIGHT,
  SCALE_PADDING,
} from '../../common/Events/constants';

export const getScaleBlocks = (scaleHeight: number, maxDepth: number) => {
  /**
   * If scaleHeight or maxDepth value is 0,
   * no point of calculating scale blocks.
   * Hence, return an empty array.
   */
  if (!scaleHeight || !maxDepth) {
    return EMPTY_ARRAY;
  }

  const blocksCountWithoutZero = Math.floor(
    (scaleHeight - SCALE_PADDING) / SCALE_BLOCK_HEIGHT
  );
  const blocksCount = blocksCountWithoutZero
    ? /**
       * Reduce 1 for `0` depth.
       * Reduce another zero as the padding at the bottom
       */
      blocksCountWithoutZero - 1 - 1
    : blocksCountWithoutZero;
  const intervalValue = Math.round(maxDepth / blocksCount);
  const interval = Math.round(intervalValue / 100) * 100;

  return [
    0, // Scale min depth
    ...times(blocksCount)
      .map((blockIndex) => Number(((blockIndex + 1) * interval).toFixed(2)))
      .filter((row) => !Number.isNaN(row)),
    interval * (blocksCount + 1), // Scale max depth
  ];
};

export const getScale = (
  scaleBlocks: number[]
): ScaleLinear<number, number> => {
  return scaleLinear()
    .domain([head(scaleBlocks) || 0, last(scaleBlocks) || 0])
    .range([0, scaleBlocks.length - 1]);
};
