/*!
 * Copyright 2021 Cognite AS
 */

import { vec3 } from 'gl-matrix';

import { SectorMetadata, SectorMetadataFacesFileSection, SectorScene } from '../sector/types';
import { SectorSceneImpl } from '../sector/SectorScene';
import { Box3 } from '../../../utilities';

export interface CadSectorMetadataV8 {
  readonly id: number;
  readonly parentId: number;
  readonly path: string;
  readonly depth: number;
  readonly estimatedDrawCallCount: number;

  readonly boundingBox: {
    readonly min: {
      x: number;
      y: number;
      z: number;
    };
    readonly max: {
      x: number;
      y: number;
      z: number;
    };
  };
  readonly indexFile: {
    readonly fileName: string;
    readonly peripheralFiles: string[];
    readonly downloadSize: number;
  };
  readonly facesFile: {
    readonly quadSize: number;
    readonly coverageFactors: {
      xy: number;
      yz: number;
      xz: number;
    };
    readonly recursiveCoverageFactors:
      | {
          xy: number;
          yz: number;
          xz: number;
        }
      | undefined;
    readonly fileName: string | null;
    readonly downloadSize: number;
  } | null;
}

export interface CadMetadataV8 {
  readonly version: 8;
  readonly maxTreeIndex: number;
  readonly sectors: CadSectorMetadataV8[];
  readonly unit: string | null;

  // Available, but unused:
  // readonly projectId: number;
  // readonly modelId: number;
  // readonly revisionId: number;
  // readonly subRevisionId: number;
}

export function parseCadMetadataV8(metadata: CadMetadataV8): SectorScene {
  // Create list of sectors and a map of child -> parent
  const sectorsById = new Map<number, SectorMetadata>();
  const parentIds: number[] = [];
  metadata.sectors.forEach(s => {
    const sector = createSectorMetadata(s);
    sectorsById.set(s.id, sector);
    parentIds[s.id] = s.parentId;
  });

  // Establish relationships between sectors
  for (const sector of sectorsById.values()) {
    const parentId = parentIds[sector.id];
    if (parentId === -1) {
      continue;
    }
    const parent = sectorsById.get(parentId)!;
    parent.children.push(sector);
  }

  const rootSector = sectorsById.get(0);
  if (!rootSector) {
    throw new Error('Root sector not found, must have ID 0');
  }
  // Check for missing facesFile-sections and provide coverage factors from parents when necessary
  populateCoverageFactorsFromAnchestors(rootSector, rootSector.facesFile);

  const unit = metadata.unit !== null ? metadata.unit : 'Meters';

  return new SectorSceneImpl(metadata.version, metadata.maxTreeIndex, unit, rootSector, sectorsById);
}

function createSectorMetadata(metadata: CadSectorMetadataV8): SectorMetadata {
  const facesFile = determineFacesFile(metadata);

  // TODO This is a workaround for broken scene.json files with NaN bounding boxes
  const bb = metadata.boundingBox;
  const min_x = isNaN(bb.min.x) ? 0 : bb.min.x;
  const min_y = isNaN(bb.min.y) ? 0 : bb.min.y;
  const min_z = isNaN(bb.min.z) ? 0 : bb.min.z;
  const max_x = isNaN(bb.max.x) ? 0 : bb.max.x;
  const max_y = isNaN(bb.max.y) ? 0 : bb.max.y;
  const max_z = isNaN(bb.max.z) ? 0 : bb.max.z;
  return {
    id: metadata.id,
    path: metadata.path,
    depth: metadata.depth,
    bounds: new Box3([vec3.fromValues(min_x, min_y, min_z), vec3.fromValues(max_x, max_y, max_z)]),
    estimatedDrawCallCount: metadata.estimatedDrawCallCount,

    // I3D
    indexFile: { ...metadata.indexFile },
    // F3D
    facesFile,

    // Populated later
    children: []
  };
}

function determineFacesFile(metadata: CadSectorMetadataV8): SectorMetadataFacesFileSection {
  if (!metadata.facesFile) {
    return {
      quadSize: -1.0,
      coverageFactors: {
        xy: -1.0,
        yz: -1.0,
        xz: -1.0
      },
      recursiveCoverageFactors: {
        xy: -1.0,
        yz: -1.0,
        xz: -1.0
      },
      fileName: null,
      downloadSize: metadata.indexFile.downloadSize
    };
  }
  const facesFile = {
    ...metadata.facesFile,
    recursiveCoverageFactors: metadata.facesFile.recursiveCoverageFactors || metadata.facesFile.coverageFactors
  };
  return facesFile;
}

function hasDummyFacesFileSection(metadata: SectorMetadata): boolean {
  return metadata.facesFile.coverageFactors.xy === -1.0;
}

function populateCoverageFactorsFromAnchestors(
  sector: SectorMetadata,
  validFacesFileSection: SectorMetadataFacesFileSection
) {
  if (hasDummyFacesFileSection(sector)) {
    sector.facesFile.coverageFactors.xy = validFacesFileSection.recursiveCoverageFactors.xy;
    sector.facesFile.coverageFactors.yz = validFacesFileSection.recursiveCoverageFactors.yz;
    sector.facesFile.coverageFactors.xz = validFacesFileSection.recursiveCoverageFactors.xz;
    sector.facesFile.recursiveCoverageFactors.xy = validFacesFileSection.recursiveCoverageFactors.xy;
    sector.facesFile.recursiveCoverageFactors.yz = validFacesFileSection.recursiveCoverageFactors.yz;
    sector.facesFile.recursiveCoverageFactors.xz = validFacesFileSection.recursiveCoverageFactors.xz;
    sector.children.forEach(child => populateCoverageFactorsFromAnchestors(child, validFacesFileSection));
  } else {
    sector.children.forEach(child => populateCoverageFactorsFromAnchestors(child, sector.facesFile));
  }
}
