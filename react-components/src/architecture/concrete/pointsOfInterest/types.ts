/*!
 * Copyright 2024 Cognite AS
 */
import {
  type AnyIntersection,
  CDF_TO_VIEWER_TRANSFORMATION,
  type ICustomObject
} from '@cognite/reveal';
import { type PointsOfInterestProperties } from './models';
import { type Vector3 } from 'three';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { type PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import { type InstanceReference } from '../../../utilities/instanceIds';

export enum PointsOfInterestStatus {
  Default,
  PendingDeletion,
  PendingCreation
}

export type PointOfInterest<IdType> = {
  properties: PointsOfInterestProperties;
  id: IdType;
  status: PointsOfInterestStatus;
};

export function createPointsOfInterestPropertiesFromPointAndTitle(
  point: Vector3,
  scene: DmsUniqueIdentifier,
  name: string,
  description: string,
  associatedInstance: InstanceReference | undefined
): PointsOfInterestProperties {
  const cdfPosition = point.clone().applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());
  return {
    positionX: cdfPosition.x,
    positionY: cdfPosition.y,
    positionZ: cdfPosition.z,
    scene,
    sceneState: {},
    name,
    description,
    instanceRef: associatedInstance
  };
}

const poiMarker = Symbol('poiMarker');

export type PointsOfInterestIntersection<PoiIdType> = Omit<
  DomainObjectIntersection,
  'userData' | 'domainObject'
> & {
  marker: typeof poiMarker;
  domainObject: PointsOfInterestDomainObject<PoiIdType>;
  userData: PointOfInterest<PoiIdType>;
};

export function createPointsOfInterestIntersection<PoiIdType>(
  point: Vector3,
  distanceToCamera: number,
  customObject: ICustomObject,
  domainObject: PointsOfInterestDomainObject<PoiIdType>,
  overlay: PointOfInterest<PoiIdType>
): PointsOfInterestIntersection<PoiIdType> {
  return {
    type: 'customObject',
    marker: poiMarker,
    point,
    distanceToCamera,
    customObject,
    domainObject,
    userData: overlay
  };
}

export function isPointsOfInterestIntersection<PoiIdType>(
  objectIntersection: AnyIntersection
): objectIntersection is PointsOfInterestIntersection<PoiIdType> {
  return (objectIntersection as PointsOfInterestIntersection<PoiIdType>).marker === poiMarker;
}
