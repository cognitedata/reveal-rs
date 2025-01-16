/*!
 * Copyright 2024 Cognite AS
 */

import { type Ray, type Vector3 } from 'three';
import { Image360AnnotationDomainObject } from './Image360AnnotationDomainObject';
import { type BaseTool } from '../../base/commands/BaseTool';
import { LineCreator } from '../primitives/line/LineCreator';
import assert from 'assert';
import { EDIT_WITHOUT_IMAGE } from './constants';
import { type DmsUniqueIdentifier } from '../../../data-providers';

export class Image360AnnotationCreator extends LineCreator {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(tool: BaseTool) {
    const imageId: DmsUniqueIdentifier | string | undefined = EDIT_WITHOUT_IMAGE
      ? 'Dummy'
      : tool.renderTarget.active360ImageId;
    assert(imageId !== undefined, 'Image360AnnotationCreator: image360Id is undefined');

    // Get the camera position in CDF coordinates
    const { position } = tool.renderTarget.cameraManager.getCameraState();
    assert(position !== undefined, 'Camera position unknown');

    const center = position.clone();
    center.applyMatrix4(tool.renderTarget.fromViewerMatrix);

    const domainObject = new Image360AnnotationDomainObject(imageId);
    domainObject.center.copy(center);

    super(tool, domainObject);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get preferIntersection(): boolean {
    return false;
  }

  public override get minimumPointCount(): number {
    return 3;
  }

  public override get maximumPointCount(): number {
    return Number.MAX_SAFE_INTEGER;
  }

  protected override transformInputPoint(
    ray: Ray,
    _point: Vector3 | undefined,
    _isPending: boolean
  ): Vector3 | undefined {
    return ray.direction.clone();
  }
}
