/*!
 * Copyright 2024 Cognite AS
 */
import { type DmsUniqueIdentifier } from '../../../../data-providers';
import { type ExternalId } from '../../../../data-providers/FdmSDK';
import {
  type InstanceReference,
  isDmsInstance,
  isHybridAssetCoreDmsInstance,
  isInternalId
} from '../../../../utilities/instanceIds';
import { type PointsOfInterestInstance, type PoiVisibility, type SceneState } from '../models';
import { type PoiExternalInstanceRef } from './types';

type PoiUpsertObject = {
  externalId: ExternalId;
  name: string;
  description: string;
  position: [number, number, number];
  sceneState: SceneState;
  scene: DmsUniqueIdentifier;
  visibility: PoiVisibility;
  assetRef?: PoiExternalInstanceRef;
};

type PoiUpsertRequest = {
  items: PoiUpsertObject[];
};

export function createUpsertRequestFromPois(
  pois: Array<PointsOfInterestInstance<ExternalId>>
): PoiUpsertRequest {
  return {
    items: pois.map(({ id, properties: poi }) => ({
      externalId: id,
      name: poi.name ?? '',
      description: poi.description ?? '',
      position: [poi.positionX, poi.positionY, poi.positionZ],
      sceneState: {},
      scene: poi.scene,
      visibility: poi.visibility ?? 'PRIVATE',
      assetRef: instanceReferenceToPoiExternalInstanceReference(poi.instanceRef)
    }))
  };
}

function instanceReferenceToPoiExternalInstanceReference(
  instanceRef: InstanceReference | undefined
): PoiExternalInstanceRef | undefined {
  if (instanceRef === undefined) {
    return undefined;
  }

  if (isInternalId(instanceRef)) {
    return instanceRef;
  } else if (isDmsInstance(instanceRef)) {
    return { externalId: instanceRef.externalId, instanceSpace: instanceRef.space };
  } else if (isHybridAssetCoreDmsInstance(instanceRef)) {
    return {
      externalId: instanceRef.assetInstanceId.externalId,
      instanceSpace: instanceRef.assetInstanceId.space
    };
  }

  return undefined;
}
