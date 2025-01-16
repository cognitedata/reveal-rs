/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { type DmsUniqueIdentifier, type ExternalId } from '../../../../data-providers/FdmSDK';
import { type CommentProperties, type PointsOfInterestInstance } from '../models';
import { type PointsOfInterestProvider } from '../PointsOfInterestProvider';

import { v4 as uuid } from 'uuid';
import {
  type PoiExternalAssetRef,
  type PoiExternalDMRef,
  type PoiExternalInstanceRef,
  type PoiItem
} from './types';
import { createUpsertRequestFromPois } from './createUpsertRequestFromPois';
import { createUserMap } from './createUserMap';
import { type InstanceReference } from '../../../../utilities/instanceIds';

/**
 * A PoI provider using the Cognite Application Data Storage service as backing storage
 */
export class PointsOfInterestAdsProvider implements PointsOfInterestProvider<ExternalId> {
  private readonly _createUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi`;

  private readonly _listUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi/list`;

  private readonly _deleteUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi/delete`;

  private readonly _getCommentsUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi/comment/list`;

  private readonly _postCommentUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi/comment`;

  private readonly _byidsUrl = (project: string): string =>
    `apps/v1/projects/${project}/storage/3d/poi/byids`;

  constructor(private readonly _sdk: CogniteClient) {}

  async upsertPointsOfInterest(
    pois: Array<PointsOfInterestInstance<ExternalId>>
  ): Promise<Array<PointsOfInterestInstance<ExternalId>>> {
    const upsertRequestData = createUpsertRequestFromPois(pois);

    const result = await this._sdk.put<{ items: PoiItem[] }>(
      `${this._sdk.getBaseUrl()}/${this._createUrl(this._sdk.project)}`,
      {
        data: upsertRequestData
      }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured while creating points of interest: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }

    const userIds = result.data.items.map((item) => item.ownerId);
    const userIdNameMap = await createUserMap(this._sdk, userIds);

    result.data.items.forEach((item) => {
      const name = userIdNameMap.get(item.ownerId) ?? 'Unknown';
      item.ownerId = name;
    });

    return result.data.items.map(poiItemToInstance);
  }

  async fetchPointsOfInterest(
    scene?: DmsUniqueIdentifier
  ): Promise<Array<PointsOfInterestInstance<ExternalId>>> {
    const result = await this._sdk.post<{ items: PoiItem[] }>(
      `${this._sdk.getBaseUrl()}/${this._listUrl(this._sdk.project)}`,
      { data: { filter: { scene } } }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured while fetching points of interest: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }
    const userIds = result.data.items.map((item) => item.ownerId);
    const userIdNameMap = await createUserMap(this._sdk, userIds);

    result.data.items.forEach((item) => {
      const name = userIdNameMap.get(item.ownerId) ?? 'Unknown';
      item.ownerId = name;
    });

    return result.data.items.map(poiItemToInstance);
  }

  async deletePointsOfInterest(poiIds: ExternalId[]): Promise<void> {
    const result = await this._sdk.post<Record<never, never>>(
      `${this._sdk.getBaseUrl()}/${this._deleteUrl(this._sdk.project)}`,
      {
        data: { items: poiIds.map((id) => ({ externalId: id })) }
      }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured while deleting points of interest: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }
  }

  async getPointsOfInterestComments(poiId: ExternalId): Promise<CommentProperties[]> {
    const result = await this._sdk.post<CommentProperties[]>(
      `${this._sdk.getBaseUrl()}/${this._getCommentsUrl(this._sdk.project)}`,
      { data: { externalId: poiId } }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured while fetching points of interest comments: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }

    const userIdNameMap = await createUserMap(
      this._sdk,
      result.data.map((comment) => comment.ownerId)
    );

    result.data.forEach((comment) => {
      const name = userIdNameMap.get(comment.ownerId) ?? 'Unknown';
      comment.ownerId = name;
    });

    return result.data;
  }

  async postPointsOfInterestComment(
    poiId: ExternalId,
    content: string
  ): Promise<CommentProperties> {
    const result = await this._sdk.post<{ content: string; ownerId: string }>(
      `${this._sdk.getBaseUrl()}/${this._postCommentUrl(this._sdk.project)}`,
      { data: { poi3dExternalId: poiId, content } }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured occured while posting points of interest comment: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }

    const userIdNameMap = await createUserMap(this._sdk, [result.data.ownerId]);

    const name = userIdNameMap.get(result.data.ownerId) ?? 'Unknown';
    result.data.ownerId = name;

    return result.data;
  }

  public createNewId(): ExternalId {
    return uuid();
  }
}

function poiItemToInstance(item: PoiItem): PointsOfInterestInstance<ExternalId> {
  return {
    id: item.externalId,
    properties: {
      name: item.name,
      description: item.description,
      ownerId: item.ownerId,
      createdTime: item.createdTime,
      positionX: item.position[0],
      positionY: item.position[1],
      positionZ: item.position[2],
      visibility: item.visibility,
      scene: {
        externalId: item.scene?.externalId ?? 'dummy-scene-external-id',
        space: item.scene?.space ?? 'dummy-scene-space'
      },
      instanceRef: poiExternalInstanceRefToInstanceReference(item?.assetRef),
      sceneState: item.sceneState
    }
  };
}

function poiExternalInstanceRefToInstanceReference(
  instance: PoiExternalInstanceRef | undefined
): InstanceReference | undefined {
  if (instance === undefined) {
    return undefined;
  }

  if (isPoiAssetRef(instance)) {
    return { id: instance.id };
  } else if (isPoiDMRef(instance)) {
    return { externalId: instance.externalId, space: instance.instanceSpace };
  }
  throw Error('Unrecognized PoI external reference type');
}

function isPoiAssetRef(instance: PoiExternalInstanceRef): instance is PoiExternalAssetRef {
  return (instance as PoiExternalAssetRef).id !== undefined;
}

function isPoiDMRef(instance: PoiExternalInstanceRef): instance is PoiExternalDMRef {
  return (
    (instance as PoiExternalDMRef).externalId !== undefined &&
    (instance as PoiExternalDMRef).instanceSpace !== undefined
  );
}
