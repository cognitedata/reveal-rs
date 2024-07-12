/*!
 * Copyright 2024 Cognite AS
 */
import { Box3, Vector3 } from 'three';
import { type ObservationsDomainObject } from './ObservationsDomainObject';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  Overlay3DCollection,
  OverlayInfo,
  type CustomObjectIntersectInput,
  type CustomObjectIntersection
} from '@cognite/reveal';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Observation, ObservationIntersection, observationMarker } from './types';
import { ClosestGeometryFinder } from '../../base/utilities/geometry/ClosestGeometryFinder';
import { getColorFromStatus } from './color';

type ObservationCollection = Overlay3DCollection<Observation>;

export class ObservationsView extends GroupThreeView<ObservationsDomainObject> {
  private _overlayCollection: ObservationCollection = new Overlay3DCollection([]);

  protected override calculateBoundingBox(): Box3 {
    return this._overlayCollection
      .getOverlays()
      .reduce((box, overlay) => box.expandByPoint(overlay.getPosition()), new Box3());
  }

  protected override addChildren(): void {
    const observations = this.domainObject.getObservations();

    const selectedObservation = this.domainObject.getSelectedObservation();
    const overlayInfos = createObservationOverlays(observations, selectedObservation);
    this._overlayCollection.removeAllOverlays();
    this._overlayCollection.addOverlays(overlayInfos);

    this.addChild(this._overlayCollection);
  }

  public override update(change: DomainObjectChange): void {
    super.update(change);

    if (change.isChanged(Changes.geometry)) {
      this.clearMemory();
      this.invalidateRenderTarget();
      this.invalidateBoundingBox();
    } else if (change.isChanged(Changes.selected)) {
      this.resetColors();
      this.invalidateRenderTarget();
    }
  }

  private resetColors() {
    const selectedObservation = this.domainObject.getSelectedObservation();
    this._overlayCollection.getOverlays().forEach((overlay) => {
      const oldColor = overlay.getColor();
      const newColor = getColorFromStatus(
        overlay.getContent().status,
        overlay.getContent() === selectedObservation
      );

      if (oldColor.equals(newColor)) {
        return;
      }

      overlay.setColor(newColor);
    });
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const { domainObject } = this;

    const closestFinder = new ClosestGeometryFinder<DomainObjectIntersection>(
      intersectInput.raycaster.ray.origin
    );

    if (closestDistance !== undefined) {
      closestFinder.minDistance = closestDistance;
    }

    const intersectedOverlay = this._overlayCollection.intersectOverlays(
      intersectInput.normalizedCoords,
      intersectInput.camera
    );

    if (intersectedOverlay === undefined || !intersectedOverlay.getVisible()) {
      return undefined;
    }

    const point = intersectedOverlay.getPosition();

    if (domainObject.useClippingInIntersection && !intersectInput.isVisible(point)) {
      return undefined;
    }

    if (!closestFinder.isClosest(point)) {
      return undefined;
    }

    const customObjectIntersection: ObservationIntersection = {
      type: 'customObject',
      marker: observationMarker,
      point,
      distanceToCamera: closestFinder.minDistance,
      customObject: this,
      domainObject,
      userData: intersectedOverlay
    };

    closestFinder.setClosestGeometry(customObjectIntersection);
    return closestFinder.getClosestGeometry();
  }

  public getOverlays(): ObservationCollection {
    return this._overlayCollection;
  }
}

function createObservationOverlays(
  observations: Observation[],
  selectedObservation: Observation | undefined
): OverlayInfo<Observation>[] {
  return observations.map((observation) => ({
    position: extractObservationPosition(observation),
    content: observation,
    color: getColorFromStatus(observation.status, observation === selectedObservation)
  }));
}

function extractObservationPosition(observation: Observation): Vector3 {
  return new Vector3(
    observation.properties.positionX,
    observation.properties.positionY,
    observation.properties.positionZ
  ).applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
}
