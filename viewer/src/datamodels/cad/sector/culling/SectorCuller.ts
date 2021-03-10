/*!
 * Copyright 2021 Cognite AS
 */

import { DetermineSectorsInput, SectorLoadingSpendage } from './types';
import { WantedSector } from '../types';
/**
 * Interface for implementations that are responsible for determining
 * what sectors should be loaded (i.e. "culls" sectors).
 */
export interface SectorCuller {
  determineSectors(input: DetermineSectorsInput): { wantedSectors: WantedSector[]; spendage: SectorLoadingSpendage };

  /**
   * Dispose all non-GCed resoures held.
   */
  dispose(): void;
}
