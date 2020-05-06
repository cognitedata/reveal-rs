/*!
 * Copyright 2020 Cognite AS
 */

import { WantedSector } from '../data/model/WantedSector';
import { LevelOfDetail } from '../data/model/LevelOfDetail';
import { SectorMetadata } from '../models/cad/types';

export type PrioritizedWantedSector = WantedSector & { priority: number };

/**
 * Delegates that computes 'cost' of loading/visualizing a given sector.
 */
export type DetermineSectorCostDelegate = (sector: SectorMetadata, levelOfDetail: LevelOfDetail) => number;
