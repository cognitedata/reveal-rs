/*!
 * Copyright 2024 Cognite AS
 */

import { Matrix4, type Ray, Vector3, Plane } from 'three';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type BoxFace } from '../common/BoxFace';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type PrimitivePickInfo } from '../common/PrimitivePickInfo';
import {
  forceBetween0AndPi,
  forceBetween0AndTwoPi,
  round
} from '../../../base/utilities/extensions/mathExtensions';
import { getAbsMaxComponentIndex } from '../../../base/utilities/extensions/vectorExtensions';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { getClosestPointOnLine } from '../../../base/utilities/extensions/rayExtensions';
import { type BoxDomainObject } from './BoxDomainObject';
import { BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import {
  type VisualDomainObject,
  type CreateDraggerProps
} from '../../../base/domainObjects/VisualDomainObject';
import { Vector3Pool } from '@cognite/reveal';
import { degToRad, radToDeg } from 'three/src/math/MathUtils.js';
import { Box } from '../../../base/utilities/primitives/Box';

const CONSTRAINED_ANGLE_INCREMENT = 15;
/**
 * The `BoxDragger` class represents a utility for dragging and manipulating a box in a 3D space.
 * It provides methods for scaling, translating, and rotating the box based on user interactions.
 * All geometry in this class assume Z-axis is up
 */

export class BoxDragger extends BaseDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _domainObject: BoxDomainObject;

  private readonly _face;
  private readonly _focusType: FocusType;
  private readonly _normal = new Vector3(); // Intersection normal
  private readonly _planeOfFace = new Plane(); // Plane of the intersection/normal
  private readonly _centerOfFace = new Vector3(); // Plane of the intersection/normal
  private readonly _cornerSign = new Vector3(); // Indicate the corner of the face
  private readonly _rotationMatrix: Matrix4;

  // Original box when the drag started
  private readonly _originalBox = new Box();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get face(): BoxFace {
    return this._face;
  }

  public get focusType(): FocusType {
    return this._focusType;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(props: CreateDraggerProps, domainObject: BoxDomainObject) {
    super(props, domainObject);

    const pickInfo = props.intersection.userData as PrimitivePickInfo;
    this._domainObject = domainObject;
    this._face = pickInfo.face;
    this._focusType = pickInfo.focusType;
    this._cornerSign.copy(pickInfo.cornerSign);
    this._face.getNormal(this._normal);
    this._face.getCenter(this._centerOfFace);

    this._rotationMatrix = domainObject.box.getRotationMatrix();
    this._normal.applyMatrix4(this._rotationMatrix);
    this._normal.normalize();

    this._planeOfFace.setFromNormalAndCoplanarPoint(this._normal, this.point);

    const matrix = domainObject.box.getMatrix();
    this._centerOfFace.applyMatrix4(matrix);

    // Back up the original box
    this._originalBox.copy(domainObject.box);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get domainObject(): VisualDomainObject {
    return this._domainObject;
  }

  public override onPointerDown(_event: PointerEvent): void {
    this._domainObject.setFocusInteractive(this.focusType, this.face);
  }

  public override onPointerDrag(event: PointerEvent, ray: Ray): boolean {
    if (this.transaction === undefined) {
      this.transaction = this._domainObject.createTransaction(Changes.geometry);
    }
    if (!this.applyByFocusType(this.focusType, ray, event.shiftKey)) {
      return false;
    }
    this.domainObject.notify(Changes.dragging);
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private applyByFocusType(focusType: FocusType, ray: Ray, shift: boolean): boolean {
    switch (focusType) {
      case FocusType.Face:
        return this.moveFace(ray, shift);
      case FocusType.Corner:
        return this.resize(ray);
      case FocusType.Body:
        return this.translate(ray, shift);
      case FocusType.Rotation:
        return this.rotate(ray, shift);
      default:
        return false;
    }
  }

  private translate(ray: Ray, shift: boolean): boolean {
    // This translation can only be done in one plane, so we need to find the intersection point
    const planeIntersect = ray.intersectPlane(this._planeOfFace, newVector3());
    if (planeIntersect === null) {
      return false;
    }
    const deltaCenter = planeIntersect.sub(this.point);
    if (deltaCenter.lengthSq() === 0) {
      return false;
    }
    if (shift) {
      const invRotationMatrix = this._rotationMatrix.clone().invert();
      deltaCenter.applyMatrix4(invRotationMatrix);
      const maxIndex = getAbsMaxComponentIndex(deltaCenter);
      for (let index = 0; index < 3; index++) {
        if (index === maxIndex) {
          continue;
        }
        deltaCenter.setComponent(index, 0);
      }
      deltaCenter.applyMatrix4(this._rotationMatrix);
    }
    // First copy the original values
    const originalBox = this._originalBox;
    const { box } = this._domainObject;
    box.copy(originalBox);

    // Then translate the center
    box.center.add(deltaCenter);
    return true;
  }

  private moveFace(ray: Ray, shift: boolean): boolean {
    // Take find closest point between the ray and the line perpendicular to the face of in picked box.
    // The distance from this point to the face of in picked box is the change.
    const pointOnSegment = newVector3();

    getClosestPointOnLine(ray, this._normal, this.point, pointOnSegment);
    const deltaSize = this._planeOfFace.distanceToPoint(pointOnSegment);
    if (deltaSize === 0) {
      return false; // Nothing has changed
    }
    // First copy the original values
    const originalBox = this._originalBox;
    const { box } = this._domainObject;
    box.copy(originalBox);
    const { size, center } = box;

    const index = this._face.index;
    let deltaCenter: number;
    if (this._domainObject.primitiveType !== PrimitiveType.Box) {
      deltaCenter = this._face.sign * deltaSize;
    } else {
      // Set new size
      const value = deltaSize + size.getComponent(index);
      const newValue = this.getBestValue(value, shift, Box.MinSize);
      if (newValue === originalBox.size.getComponent(index)) {
        return false; // Nothing has changed
      }
      size.setComponent(index, newValue);
      // The center of the box should be moved by half of the delta size and take the rotation into account.
      const newDeltaSize = size.getComponent(index) - originalBox.size.getComponent(index);
      deltaCenter = (this._face.sign * newDeltaSize) / 2;
    }
    // Set new center
    const deltaCenterVector = newVector3();
    deltaCenterVector.setComponent(index, deltaCenter);
    deltaCenterVector.applyMatrix4(this._rotationMatrix);
    center.add(deltaCenterVector);
    return true;
  }

  private resize(ray: Ray): boolean {
    const endPoint = ray.intersectPlane(this._planeOfFace, newVector3());
    if (endPoint === null) {
      return false;
    }
    const startPoint = this._planeOfFace.projectPoint(this.point, newVector3());

    const invRotationMatrix = this._rotationMatrix.clone().invert();
    const deltaSize = endPoint.sub(startPoint);
    deltaSize.applyMatrix4(invRotationMatrix);

    deltaSize.multiply(this._cornerSign);
    if (deltaSize.lengthSq() === 0) {
      return false; // Nothing has changed
    }
    // First copy the original values
    const originalBox = this._originalBox;
    const { box } = this._domainObject;
    box.copy(originalBox);
    const { size, center } = box;

    // Apply the change
    size.add(deltaSize);
    box.forceMinSize();

    if (size.lengthSq() === originalBox.size.lengthSq()) {
      return false; // Nothing has changed
    }
    // The center of the box should be moved by half of the delta size and take the rotation into account.
    const newDeltaSize = newVector3().subVectors(size, originalBox.size);
    const deltaCenter = newDeltaSize.divideScalar(2);
    deltaCenter.multiply(this._cornerSign);
    deltaCenter.applyMatrix4(this._rotationMatrix);
    center.add(deltaCenter);
    return true;
  }

  private rotate(ray: Ray, shift: boolean): boolean {
    const domainObject = this._domainObject;
    if (!domainObject.canRotateComponent(this._face.index)) {
      return false;
    }
    const endPoint = ray.intersectPlane(this._planeOfFace, newVector3());
    if (endPoint === null) {
      return false;
    }
    const centerToStartPoint = newVector3().subVectors(this.point, this._centerOfFace).normalize();
    const centerToEndPoint = newVector3().subVectors(endPoint, this._centerOfFace).normalize();
    const cross = newVector3().crossVectors(centerToEndPoint, centerToStartPoint).normalize();

    let deltaAngle = centerToEndPoint.angleTo(centerToStartPoint);
    if (this._normal.dot(cross) > 0) {
      deltaAngle = -deltaAngle;
    }
    const originalBox = this._originalBox;
    const { box } = domainObject;
    box.copy(originalBox);

    if (shift) {
      let oldAngle;
      if (this._face.index === 0) {
        oldAngle = originalBox.rotation.x;
      } else if (this._face.index === 1) {
        oldAngle = originalBox.rotation.y;
      } else if (this._face.index === 2) {
        oldAngle = originalBox.rotation.z;
      } else {
        return false;
      }
      let newAngle;
      if (this._face.index === 2) {
        newAngle = box.hasXYRotation
          ? forceBetween0AndTwoPi(deltaAngle + oldAngle)
          : forceBetween0AndPi(deltaAngle + oldAngle);
      } else {
        newAngle = forceBetween0AndTwoPi(deltaAngle + oldAngle);
      }
      newAngle = roundByConstrained(newAngle, shift);
      deltaAngle = newAngle - oldAngle;
    }
    // Rotate
    const matrix = this._rotationMatrix.clone();
    const rotationMatrix = new Matrix4().makeRotationAxis(this._normal, deltaAngle);
    matrix.premultiply(rotationMatrix);
    box.rotation.setFromRotationMatrix(matrix);
    return true;

    function roundByConstrained(rotation: number, shift: boolean): number {
      if (!shift) {
        return rotation;
      }
      let degrees = radToDeg(rotation);
      degrees = round(degrees, CONSTRAINED_ANGLE_INCREMENT);
      return degToRad(degrees);
    }
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
