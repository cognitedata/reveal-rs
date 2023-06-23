import { getValidMimeTypesByMediaType } from '@vision/api/file/fetchFiles/mimeTypeUtils';
import { getValidFilters } from '@vision/api/utils/getValidFilters';
import { VisionFileFilterProps } from '@vision/modules/FilterSidePanel/types';

import sdk from '@cognite/cdf-sdk-singleton';

export const totalFileCount = async (visionFilter: VisionFileFilterProps) => {
  const fileCounts: number[] = [];

  // Todo: aggregate result should consider additional vision filters to get correct result
  const validFilters = getValidFilters(visionFilter);
  const { mimeType, mediaType } = visionFilter;

  const mimeTypes = mimeType
    ? [mimeType]
    : getValidMimeTypesByMediaType(mediaType);

  await Promise.all(
    mimeTypes.map(async (m) => {
      const aggregates = await sdk.files.aggregate({
        filter: { ...validFilters, mimeType: m },
      });
      fileCounts.push(aggregates[0].count);
    })
  );

  return fileCounts.reduce((a, b) => a + b, 0);
};
