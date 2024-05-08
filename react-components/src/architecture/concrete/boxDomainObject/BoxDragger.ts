/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { type BoxDomainObject } from './BoxDomainObject';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type Ray, Vector3, Plane, Vector2 } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { BoxFace } from './BoxFace';
import { BoxFocusType } from './BoxFocusType';

const MIN_SIZE = 0.1;

export class BoxDragger {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly boxDomainObject: BoxDomainObject;
  public readonly _face = new BoxFace();
  private readonly _point: Vector3 = new Vector3();
  private readonly _normal: Vector3 = new Vector3();
  private readonly _planeOfBox: Plane = new Plane();
  private readonly _minPoint: Vector3 = new Vector3();
  private readonly _maxPoint: Vector3 = new Vector3();

  // Original values when the drag started
  private readonly _scaleOfBox: Vector3 = new Vector3();
  private readonly _centerOfBox: Vector3 = new Vector3();
  private readonly _zRotationOfBox: number = 0;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get face(): BoxFace {
    return this._face;
  }

  // ==================================================
  // CONTRUCTOR
  // ==================================================

  public constructor(event: PointerEvent, intersection: DomainObjectIntersection) {
    // Plase check the domainObject by instanceof before enter this constructor
    this.boxDomainObject = intersection.domainObject as BoxDomainObject;
    this._face.copy(intersection.userData as BoxFace);
    this._point.copy(intersection.point);
    this._normal.copy(this._face.getNormal());

    const rotationMatrix = this.boxDomainObject.getRotatationMatrix();
    this._normal.applyMatrix4(rotationMatrix);
    this._normal.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    this._normal.normalize();

    this._minPoint.copy(intersection.point);
    this._maxPoint.copy(intersection.point);

    this._minPoint.addScaledVector(this._normal, +intersection.distanceToCamera * 10);
    this._maxPoint.addScaledVector(this._normal, -intersection.distanceToCamera * 10);

    this._planeOfBox.setFromNormalAndCoplanarPoint(this._normal, intersection.point.clone());

    // Back up the original values
    this._scaleOfBox.copy(this.boxDomainObject.size);
    this._centerOfBox.copy(this.boxDomainObject.center);
    this._zRotationOfBox = this.boxDomainObject.zRotation;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public apply(type: BoxFocusType, ray: Ray): void {
    switch (type) {
      case BoxFocusType.Scale:
        this.scale(ray);
        break;
      case BoxFocusType.Translate:
        this.translate(ray);
        break;
      case BoxFocusType.Rotate:
        this.rotate(ray);
        break;
      default:
    }
  }

  private translate(ray: Ray): void {
    const planeIntersect = ray.intersectPlane(this._planeOfBox, new Vector3());
    if (planeIntersect === null) {
      return;
    }
    const deltaCenter = planeIntersect.sub(this._point);
    deltaCenter.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION.clone().invert());

    // First copy the original values
    const { center } = this.boxDomainObject;
    center.copy(this._centerOfBox);

    // Then translate the center
    center.add(deltaCenter);

    // Notify the changes
    this.boxDomainObject.notify(Changes.geometry);
  }

  private scale(ray: Ray): void {
    // Take find closest point between the ray and the line perpenducular to the face of in picked box.
    // The distance from this point to the face of in picked box is the change.
    const pointOnSegment = new Vector3();
    ray.distanceSqToSegment(this._minPoint, this._maxPoint, undefined, pointOnSegment);
    const deltaSize = this._planeOfBox.distanceToPoint(pointOnSegment);
    if (Math.abs(deltaSize) < 0.001) {
      return;
    }
    // First copy the original values
    const { size, center } = this.boxDomainObject;
    size.copy(this._scaleOfBox);
    center.copy(this._centerOfBox);

    // Restrict the size to be at least MIN_SIZE
    const index = this._face.index;
    const newSize = Math.max(MIN_SIZE, deltaSize + size.getComponent(index));
    const newDeltaSize = newSize - size.getComponent(index);
    if (newDeltaSize === 0) {
      return;
    }

    // Then change the values
    size.setComponent(index, newSize);

    // The center of the box should be moved by half of the delta size and take the rotation into accont.
    const deltaCenter = (this._face.sign * newDeltaSize) / 2;
    const deltaCenterVector = new Vector3();
    deltaCenterVector.setComponent(index, deltaCenter);
    const rotationMatrix = this.boxDomainObject.getRotatationMatrix();
    deltaCenterVector.applyMatrix4(rotationMatrix);
    center.add(deltaCenterVector);

    // Notify the changes
    this.boxDomainObject.notify(Changes.geometry);
  }

  private rotate(ray: Ray): void {
    // Use top face and create a plane on the top face
    const face = new BoxFace(2);
    const normal = face.getNormal();
    normal.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    normal.normalize();

    const plane = new Plane().setFromNormalAndCoplanarPoint(normal, this._point.clone());
    const endPoint = ray.intersectPlane(plane, new Vector3());
    if (endPoint === null) {
      return;
    }
    const centerOfBox = this._centerOfBox.clone();
    centerOfBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    const center = plane.projectPoint(centerOfBox, new Vector3());

    // Ignore Y-value (up) since we are only interested in the rotation around the Up-axis
    const centerToStartPoint = substractXZ(this._point, center);
    const centerToEndPoint = substractXZ(endPoint, center);

    const startAngle = centerToStartPoint.angle();
    const endAngle = centerToEndPoint.angle();
    const deltaAngle = startAngle - endAngle;

    // Rotate
    this.boxDomainObject.zRotation = deltaAngle + this._zRotationOfBox;

    // Notify the changes
    this.boxDomainObject.notify(Changes.geometry);

    function substractXZ(v1: Vector3, v2: Vector3): Vector2 {
      return new Vector2(v1.x - v2.x, v1.z - v2.z);
    }
  }
}
