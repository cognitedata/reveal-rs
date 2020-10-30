/*!
 * Copyright 2020 Cognite AS
 */

import { isMobileOrTablet } from '@/utilities';

/**
 * Represents a measurement of how much geometry can be loaded.
 */
export type CadModelSectorBudget = {
  /**
   * Sectors within this distance from the camera will always be loaded in high details.
   */
  readonly highDetailProximityThreshold: number;

  /**
   * Number of bytes of the geometry that must be downloaded.
   */
  readonly geometryDownloadSizeBytes: number;

  /**
   * Maximum number of estimated drawcalls of geometry to load.
   */
  readonly maximumNumberOfDrawCalls: number;
};

export const defaultCadModelSectorBudget = isMobileOrTablet()
  ? // Mobile/tablet
    {
      highDetailProximityThreshold: 5 * 1000,
      geometryDownloadSizeBytes: 20 * 1024 * 1024,
      maximumNumberOfDrawCalls: 1000
    }
  : // Desktop
    {
      highDetailProximityThreshold: 10 * 1000,
      geometryDownloadSizeBytes: 35 * 1024 * 1024,
      maximumNumberOfDrawCalls: 2000
    };
