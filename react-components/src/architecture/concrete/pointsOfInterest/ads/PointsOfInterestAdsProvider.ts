/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { type ExternalId } from '../../../../data-providers/FdmSDK';
import { type PointsOfInterestInstance, type PointsOfInterestProperties } from '../models';
import { type PointsOfInterestProvider } from '../PointsOfInterestProvider';

import { v4 as uuid } from 'uuid';
import { type PoIItem } from './types';

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

  constructor(private readonly _sdk: CogniteClient) {}

  async createPointsOfInterest(
    pois: PointsOfInterestProperties[]
  ): Promise<Array<PointsOfInterestInstance<ExternalId>>> {
    const result = await this._sdk.put<{ items: PoIItem[] }>(
      `${this._sdk.getBaseUrl()}/${this._createUrl(this._sdk.project)}`,
      {
        data: {
          items: pois.map((poi) => {
            const externalId = uuid();

            return {
              externalId,
              name: externalId,
              position: [poi.positionX, poi.positionY, poi.positionZ],
              sceneState: {},
              visibility: 'PRIVATE'
            };
          })
        }
      }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured while creating points of interest: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }

    return result.data.items.map(poiItemToInstance);
  }

  async fetchAllPointsOfInterest(): Promise<Array<PointsOfInterestInstance<ExternalId>>> {
    const result = await this._sdk.post<{ items: PoIItem[] }>(
      `${this._sdk.getBaseUrl()}/${this._listUrl(this._sdk.project)}`,
      { data: { filter: {} } }
    );

    if (result.status !== 200) {
      throw Error(
        `An error occured while fetching points of interest: ${JSON.stringify(result.data)}, status code: ${result.status}`
      );
    }

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
}

function poiItemToInstance(item: PoIItem): PointsOfInterestInstance<ExternalId> {
  return {
    id: item.externalId,
    properties: {
      positionX: item.position[0],
      positionY: item.position[1],
      positionZ: item.position[2]
    }
  };
}
