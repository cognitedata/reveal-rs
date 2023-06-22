import { pickBy } from 'lodash';

import { ContainerReference, ContainerReferenceType } from '../types';
import assertNever from '../utils/assertNever';

import { FDMContainerReference } from './types';

export const fdmContainerReferenceToContainerReference = (
  fdmContainerRef: FDMContainerReference
): ContainerReference => {
  const {
    containerReferenceType,
    resourceId,
    resourceSubId,
    properties,
    ...commonProps
  } = fdmContainerRef;
  // Filter out null values from commonProps
  const filteredCommonProps = pickBy(commonProps, (val) => val !== null);

  if (resourceId === undefined) {
    throw new Error('resourceId cannot be undefined');
  }

  if (containerReferenceType === ContainerReferenceType.FILE) {
    return {
      ...filteredCommonProps,
      type: ContainerReferenceType.FILE,
      resourceId,
      page: properties.page,
    };
  }

  if (containerReferenceType === ContainerReferenceType.TIMESERIES) {
    return {
      ...filteredCommonProps,
      type: ContainerReferenceType.TIMESERIES,
      resourceId,
      startDate: properties.startDate,
      endDate: properties.endDate,
    };
  }

  if (containerReferenceType === ContainerReferenceType.THREE_D) {
    if (resourceSubId === undefined || resourceSubId === null) {
      throw new Error(
        'resourceSubId cannot be undefined for threeD containers'
      );
    }
    return {
      ...filteredCommonProps,
      type: ContainerReferenceType.THREE_D,
      modelId: resourceId,
      revisionId: resourceSubId,
      initialAssetId: properties.initialAssetId,
      camera: properties.camera,
    };
  }

  if (
    containerReferenceType === ContainerReferenceType.EVENT ||
    containerReferenceType === ContainerReferenceType.ASSET
  ) {
    return { ...filteredCommonProps, type: containerReferenceType, resourceId };
  }

  assertNever(
    containerReferenceType,
    `Unknown container reference type '${containerReferenceType}' was provided`
  );
};
