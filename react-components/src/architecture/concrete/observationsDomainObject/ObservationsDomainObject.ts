/*!
 * Copyright 2024 Cognite AS
 */
import { CDF_TO_VIEWER_TRANSFORMATION, Overlay3DCollection } from '@cognite/reveal';
import { OBSERVATION_SOURCE, ObservationProperties, type Observation } from './models';
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type ThreeView } from '../../base/views/ThreeView';
import { ObservationsView } from './ObservationsView';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { FdmSDK, InstanceFilter } from '../../../utilities/FdmSDK';
import { Vector3 } from 'three';
import { DEFAULT_OVERLAY_COLOR } from './constants';
import { Changes } from '../../base/domainObjectsHelpers/Changes';

export class ObservationsDomainObject extends VisualDomainObject {
  private readonly _collection: Overlay3DCollection<Observation> = new Overlay3DCollection(
    undefined,
    {
      defaultOverlayColor: DEFAULT_OVERLAY_COLOR
    }
  );

  public override get typeName(): TranslateKey {
    return { fallback: ObservationsDomainObject.name };
  }

  constructor(fdmSdk: FdmSDK) {
    super();
    fetchObservations(fdmSdk).then((observations) => {
      this.initializeCollection(observations);
      this.notify(Changes.geometry);
    });
  }

  private initializeCollection(observations: Observation[]): void {
    const observationOverlays = observations.map((observation) => {
      const position = new Vector3(
        observation.properties.positionX,
        observation.properties.positionY,
        observation.properties.positionZ
      ).applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

      return {
        position,
        content: observation
      };
    });

    console.log('Observations: ', observationOverlays);
    this._collection.addOverlays(observationOverlays);
  }

  public get overlayCollection(): Overlay3DCollection<Observation> {
    return this._collection;
  }

  protected override createThreeView(): ThreeView<ObservationsDomainObject> | undefined {
    return new ObservationsView();
  }
}

const observationsFilter: InstanceFilter = {};

async function fetchObservations(fdmSdk: FdmSDK): Promise<Observation[]> {
  const observationResult = await fdmSdk.filterAllInstances<ObservationProperties>(
    observationsFilter,
    'node',
    OBSERVATION_SOURCE
  );

  return observationResult.instances;
}
