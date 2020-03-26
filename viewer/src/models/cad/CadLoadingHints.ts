/*!
 * Copyright 2020 Cognite AS
 */

/**
 * Hints that modifies how CAD sectors are loaded.
 */
export type CadLoadingHints = {
  /**
   * The largest size low detail geometry (quads) can be before they are refined
   * relative to screen size.
   */
  maxQuadSize?: number;

  /**
   * Optionally disables loading of sectors.
   */
  suspendLoading?: boolean;
};

export const defaultLoadingHints: Required<CadLoadingHints> = {
  maxQuadSize: 0.0025,
  suspendLoading: false
};
