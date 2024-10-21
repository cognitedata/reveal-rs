/*!
 * Copyright 2021 Cognite AS
 */

import { Object3D, Vector3 } from 'three';
import { PointCloudNode } from './PointCloudNode';
import { DMInstanceRef } from '@reveal/data-providers';
import { AnnotationsAssetRef } from '@cognite/sdk';

/**
 * ASPRS well known point class types.
 * @see {@link http://www.asprs.org/wp-content/uploads/2019/03/LAS_1_4_r14.pdf} (page 30)
 */
export enum WellKnownAsprsPointClassCodes {
  /**
   * Special value for all other classes. Some point in Potree might be in this class
   *
   */
  Default = -1,
  /**
   * Created, never classified.
   */
  Created = 0,
  Unclassified = 1,
  Ground = 2,
  LowVegetation = 3,
  MedVegetation = 4,
  HighVegetation = 5,
  Building = 6,
  /**
   * Low point, typically "low noise".
   */
  LowPoint = 7,
  /**
   * In previous revisions of LAS this was High point ("high noise"), in more recent
   * revisions this value is reserved.
   */
  ReservedOrHighPoint = 8,
  Water = 9,
  Rail = 10,
  RoadSurface = 11,
  /**
   * In previous revisions of LAS this was "Bridge deck", but in more recent
   * revisions this value is reserved.
   */
  ReservedOrBridgeDeck = 12,
  /**
   * Wire guard shield.
   */
  WireGuard = 13,
  /**
   * Wire conductor (phase).
   */
  WireConductor = 14,
  TransmissionTower = 15,
  /**
   * Wire-structure connector (e.g. insulator).
   */
  WireStructureConnector = 16,
  /**
   * Note that {@link WellKnownAsprsPointClassCodes.ReservedOrBridgeDeck} has been used
   * historically.
   */
  BridgeDeck = 17,
  /**
   * High point, or "high noise".
   * Note that {@link WellKnownAsprsPointClassCodes.ReservedOrHighPoint} has been used
   * historically.
   */
  HighNoise = 18,
  /**
   * E.g. conveyors, mining equipment, traffic lights.
   */
  OverheadStructure = 19,
  /**
   * E.g. breakline proximity.
   */
  IgnoredGround = 20,
  Snow = 21,
  /**
   * Features excluded due to changes over time between data sources – e.g., water
   * levels, landslides, permafrost
   */
  TemporalExclusion = 22
  /*
   * Values up to and including 63 are reserved
   */
}

/**
 * @public
 * CDF Data model instance reference for point cloud volume object with asset.
 */
export type PointCloudVolumeReference = {
  annotationId: number;
  volumeInstanceRef: DMInstanceRef;
  assetRef?: AnnotationsAssetRef;
};

export interface IntersectPointCloudNodeResult {
  /**
   * Distance from camera to intersected point.
   */
  distance: number;
  /**
   * Coordinate of the intersected point.
   */
  point: Vector3;
  /**
   * Point index in the point cloud of the intersected point.
   */
  pointIndex: number;
  /**
   * Point cloud node defining what model the point is a part of.
   */
  pointCloudNode: PointCloudNode;
  /**
   * The geometry object that was intersected.
   */
  object: Object3D;
  /**
   * @deprecated
   * annotationId of the clicked object within a pointcloud.
   */
  annotationId: number;
  /**
   * pointcloud volume reference.
   */
  volumeRef?: PointCloudVolumeReference;
  /**
   * @deprecated
   * asset reference of the clicked object in the pointcloud, if any.
   */
  assetRef?: AnnotationsAssetRef;
}
