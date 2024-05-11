/*!
 * Copyright 2024 Cognite AS
 */

/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
  Mesh,
  MeshPhongMaterial,
  Object3D,
  BoxGeometry,
  DoubleSide,
  LineSegments,
  LineBasicMaterial,
  Vector3,
  Matrix4,
  RingGeometry,
  Color,
  Sprite,
  Camera,
  CircleGeometry,
  Material,
  Plane,
  FrontSide
} from 'three';
import { BoxDomainObject, MIN_BOX_SIZE } from './BoxDomainObject';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { BoxRenderStyle } from './BoxRenderStyle';
import { GroupThreeView } from '../../base/views/GroupThreeView';
import {
  CDF_TO_VIEWER_TRANSFORMATION,
  CustomObjectIntersectInput,
  CustomObjectIntersection
} from '@cognite/reveal';
import { DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxFocusType } from '../../base/utilities/box/BoxFocusType';
import { clear } from '../../base/utilities/extensions/arrayExtensions';
import { Vector3Pool } from '../../base/utilities/geometry/Vector3Pool';
import { WHITE_COLOR } from '../../base/utilities/colors/colorExtensions';
import { createSpriteWithText } from '../../base/utilities/sprites/createSprite';
import {
  createLineSegmentsBufferGeometryForBox,
  createOrientedBox
} from '../../base/utilities/box/createLineSegmentsBufferGeometryForBox';
import { BoxPickInfo } from '../../base/utilities/box/BoxPickInfo';
import { radToDeg } from 'three/src/math/MathUtils.js';
import { Range1 } from '../../base/utilities/geometry/Range1';

const RELATIVE_RESIZE_RADIUS = 0.15;
const RELATIVE_ROTATION_RADIUS = new Range1(0.6, 0.75);

const ARROW_AND_RING_COLOR = new Color(1, 1, 1);
const LABEL_BG_COLOR = new Color().setScalar(0.05);
export class BoxThreeView extends GroupThreeView {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _labels: Array<Sprite | undefined> = [];

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get boxDomainObject(): BoxDomainObject {
    return super.domainObject as BoxDomainObject;
  }

  protected get style(): BoxRenderStyle {
    return super.style as BoxRenderStyle;
  }

  private getLabelHeight(relativeFontSize: number): number {
    return relativeFontSize * this.boxDomainObject.diagonal;
  }

  private getFaceRadius(boxFace: BoxFace): number {
    const { size } = this.boxDomainObject;
    const size1 = size.getComponent(boxFace.tangentIndex1);
    const size2 = size.getComponent(boxFace.tangentIndex2);
    return (size1 + size2) / 4;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (this.isEmpty) {
      return;
    }
    if (change.isChanged(Changes.renderStyle) || change.isChanged(Changes.color)) {
      const mesh = this.object as Mesh;
      if (mesh !== undefined) {
        updateSolidMaterial(mesh.material as MeshPhongMaterial, this.boxDomainObject, this.style);
        this.invalidateRenderTarget();
      }
    }
    if (change.isChanged(Changes.focus)) {
      this.removeChildren();
      this.invalidateBoundingBox();
      this.invalidateRenderTarget();
    }
  }

  // ==================================================
  // OVERRIDES of GroupThreeView
  // ==================================================

  protected override addChildren(): void {
    const { boxDomainObject } = this;
    const matrix = this.getMatrix();

    const { focusType } = boxDomainObject;
    if (focusType !== BoxFocusType.None) {
      this.addChild(this.createSolid(matrix));
    }
    this.addChild(this.createLines(matrix));

    if (focusType !== BoxFocusType.Pending && focusType !== BoxFocusType.None) {
      this.addChild(this.createRotationCircle(matrix));
      this.addResizeCircles(matrix);
    }
    this.addLabels(matrix);
  }

  public override intersectIfCloser(
    intersectInput: CustomObjectIntersectInput,
    closestDistance: number | undefined
  ): undefined | CustomObjectIntersection {
    const { boxDomainObject } = this;
    if (boxDomainObject.focusType === BoxFocusType.Pending) {
      return undefined; // Should never be picked
    }
    const orientedBox = createOrientedBox();
    const matrix = this.getMatrix();
    orientedBox.applyMatrix4(matrix);

    const ray = intersectInput.raycaster.ray;
    const point = orientedBox.intersectRay(ray, newVector3());
    if (point === null) {
      return undefined;
    }
    const distanceToCamera = point.distanceTo(ray.origin);
    if (closestDistance !== undefined && closestDistance < distanceToCamera) {
      return undefined;
    }
    if (!intersectInput.isVisible(point)) {
      return undefined;
    }
    const positionAtFace = newVector3(point).applyMatrix4(matrix.invert());
    const realPosition = newVector3(point).applyMatrix4(
      CDF_TO_VIEWER_TRANSFORMATION.clone().invert()
    );
    const boxFace = new BoxFace().fromPositionAtFace(positionAtFace);
    const cornerSign = new Vector3();
    const focusType = this.getPickedFocusType(realPosition, boxFace, cornerSign);
    const customObjectIntersection: DomainObjectIntersection = {
      type: 'customObject',
      point,
      distanceToCamera,
      userData: new BoxPickInfo(boxFace, focusType, cornerSign),
      customObject: this,
      domainObject: boxDomainObject
    };
    if (this.shouldPickBoundingBox) {
      customObjectIntersection.boundingBox = this.boundingBox;
    }
    return customObjectIntersection;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private createSolid(matrix: Matrix4): Object3D | undefined {
    const { boxDomainObject } = this;
    const { style } = this;

    const material = new MeshPhongMaterial();
    updateSolidMaterial(material, boxDomainObject, style);
    const geometry = new BoxGeometry(1, 1, 1);
    const result = new Mesh(geometry, material);
    result.applyMatrix4(matrix);
    return result;
  }

  private createLines(matrix: Matrix4): Object3D | undefined {
    const { boxDomainObject } = this;
    const { style } = this;

    const material = new LineBasicMaterial();
    updateLineSegmentsMaterial(material, boxDomainObject, style);
    const geometry = createLineSegmentsBufferGeometryForBox();
    const result = new LineSegments(geometry, material);

    result.applyMatrix4(matrix);
    result.onBeforeRender = this.onBeforeRender;
    return result;
  }

  private addLabels(matrix: Matrix4): void {
    const { boxDomainObject, style } = this;
    const labelHeight = this.getLabelHeight(style.relativeFontSize);
    clear(this._labels);
    for (let index = 0; index < 3; index++) {
      const size = boxDomainObject.size.getComponent(index);
      if (size <= MIN_BOX_SIZE) {
        this._labels.push(undefined);
        continue;
      }
      const sprite = createSprite(size.toFixed(2), labelHeight);
      if (sprite === undefined) {
        this._labels.push(undefined);
        continue;
      }
      this._labels.push(sprite);
      this.addChild(sprite);
    }
    this.updateLabels(this.renderTarget.camera);
    if (
      boxDomainObject.focusType !== BoxFocusType.Pending &&
      boxDomainObject.focusType !== BoxFocusType.ScaleByEdge &&
      boxDomainObject.focusType !== BoxFocusType.Translate
    ) {
      this.addChild(this.createDegreesLabel(matrix, labelHeight));
    }
  }

  private createDegreesLabel(matrix: Matrix4, labelHeight: number): Sprite | undefined {
    const { boxDomainObject } = this;
    const degrees = radToDeg(boxDomainObject.zRotation);
    const text = degrees.toFixed(1);
    if (text === '0.0') {
      return undefined; // Not show when about 0
    }
    const sprite = createSprite(text + '°', labelHeight);
    if (sprite === undefined) {
      return undefined;
    }
    const faceCenter = new BoxFace(2).getCenter(newVector3());
    faceCenter.applyMatrix4(matrix);
    sprite.position.copy(faceCenter);
    return sprite;
  }

  private readonly onBeforeRender = (_1: any, _2: any, camera: Camera): void => {
    this.updateLabels(camera);
  };

  private updateLabels(camera: Camera): void {
    const { boxDomainObject } = this;
    const matrix = this.getMatrix();

    const rotationMatrix = this.getRotationMatrix();
    const centerOfBox = newVector3(boxDomainObject.center);
    centerOfBox.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    const cameraPosition = camera.getWorldPosition(newVector3());
    const cameraDirection = centerOfBox.sub(cameraPosition).normalize();

    // Calculate which face of the box are visible
    const visibleFaces: boolean[] = new Array(6).fill(false);
    const boxFace = new BoxFace();
    for (boxFace.face = 0; boxFace.face < visibleFaces.length; boxFace.face++) {
      const normal = boxFace.getNormal(newVector3());
      normal.applyMatrix4(rotationMatrix);
      visibleFaces[boxFace.face] = normal.dot(cameraDirection) < 0;
    }
    const labelHeight = this.getLabelHeight(this.style.relativeFontSize);

    // If the 2 adjecent faces are visible, show the label along the edge
    for (let index = 0; index < this._labels.length; index++) {
      const label = this._labels[index];
      if (label === undefined) {
        continue;
      }
      label.visible = false;
      for (let i = 0; i < 2; i++) {
        const face1 = (index + (i === 0 ? 1 : 4)) % 6;
        if (!visibleFaces[face1]) {
          continue;
        }
        boxFace.face = face1;
        const faceCenter1 = boxFace.getCenter(newVector3());
        for (let j = 0; j < 2; j++) {
          const face2 = (index + (j === 0 ? 2 : 5)) % 6;
          if (!visibleFaces[face2]) {
            continue;
          }
          boxFace.face = face2;
          const faceCenter2 = boxFace.getCenter(newVector3());
          const edgeCenter = faceCenter2.add(faceCenter1);
          edgeCenter.applyMatrix4(matrix);

          // Move the label slightly away from the box to avoid z-fighting
          edgeCenter.addScaledVector(cameraDirection, -labelHeight / 4);
          label.position.copy(edgeCenter);
          label.visible = true;
          break;
        }
        if (label.visible) {
          break;
        }
      }
    }
  }

  protected addResizeCircles(matrix: Matrix4): void {
    let selectedFace = this.boxDomainObject.focusFace;
    if (this.boxDomainObject.focusType !== BoxFocusType.ScaleByEdge) {
      selectedFace = undefined;
    }
    const material = new MeshPhongMaterial();
    updateMarkerMaterial(material, this.boxDomainObject, false);
    const boxFace = new BoxFace();
    for (boxFace.face = 0; boxFace.face < 6; boxFace.face++) {
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (selectedFace === undefined || !selectedFace.equals(boxFace)) {
        this.addChild(this.createResizeCircle(matrix, material, boxFace));
      }
    }
    if (selectedFace !== undefined) {
      const material = new MeshPhongMaterial();
      updateMarkerMaterial(material, this.boxDomainObject, true);
      this.addChild(this.createResizeCircle(matrix, material, selectedFace));
    }
  }

  private createRotationCircle(matrix: Matrix4): Mesh {
    const { boxDomainObject } = this;
    const { focusType } = boxDomainObject;
    const face = new BoxFace(2);
    const radius = this.getFaceRadius(face);

    const outerRadius = RELATIVE_ROTATION_RADIUS.max * radius;
    const innerRadius = RELATIVE_ROTATION_RADIUS.min * radius;
    const geometry = new RingGeometry(innerRadius, outerRadius, 32);

    const material = new MeshPhongMaterial();
    updateMarkerMaterial(material, boxDomainObject, focusType === BoxFocusType.Rotate);
    material.clippingPlanes = this.createClippingPlanes(matrix, 2);
    const mesh = new Mesh(geometry, material);

    const center = face.getCenter(newVector3());
    center.applyMatrix4(matrix);
    mesh.position.copy(center);
    mesh.rotateX(-Math.PI / 2);
    return mesh;
  }

  private createResizeCircle(matrix: Matrix4, material: Material, face: BoxFace): Mesh | undefined {
    const { boxDomainObject } = this;
    const adjecentSize1 = boxDomainObject.size.getComponent(face.tangentIndex1);
    if (adjecentSize1 <= MIN_BOX_SIZE) {
      return undefined;
    }
    const adjecentSize2 = boxDomainObject.size.getComponent(face.tangentIndex2);
    if (adjecentSize2 <= MIN_BOX_SIZE) {
      return undefined;
    }
    const radius = RELATIVE_RESIZE_RADIUS * this.getFaceRadius(face);
    const geometry = new CircleGeometry(radius, 32);
    material.transparent = true;
    material.depthWrite = false;
    const mesh = new Mesh(geometry, material);

    const center = face.getCenter(newVector3());
    center.applyMatrix4(matrix);
    mesh.position.copy(center);

    // Must be roteted correctly because of sideness
    if (face.face === 2) {
      mesh.rotateX(-Math.PI / 2);
    } else if (face.face === 5) {
      mesh.rotateX(Math.PI / 2);
    } else if (face.face === 0) {
      mesh.rotateY(Math.PI / 2 + boxDomainObject.zRotation);
    } else if (face.face === 3) {
      mesh.rotateY(-Math.PI / 2 + boxDomainObject.zRotation);
    } else if (face.face === 1) {
      mesh.rotateY(Math.PI + boxDomainObject.zRotation);
    } else if (face.face === 4) {
      mesh.rotateY(boxDomainObject.zRotation);
    }
    return mesh;
  }

  private getMatrix(): Matrix4 {
    const { boxDomainObject } = this;
    const matrix = boxDomainObject.getMatrix();
    matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    return matrix;
  }

  private getRotationMatrix(): Matrix4 {
    const { boxDomainObject } = this;
    const matrix = boxDomainObject.getRotationMatrix();
    matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
    return matrix;
  }

  private createClippingPlanes(matrix: Matrix4, faceIndex: number): Plane[] {
    const planes: Plane[] = [];
    const boxFace = new BoxFace();
    for (boxFace.face = 0; boxFace.face < 6; boxFace.face++) {
      if (boxFace.index === faceIndex) {
        continue;
      }
      const center = boxFace.getCenter(newVector3());
      const normal = boxFace.getNormal(newVector3()).negate();
      const plane = new Plane().setFromNormalAndCoplanarPoint(normal, center);
      plane.applyMatrix4(matrix);
      planes.push(plane);
    }
    return planes;
  }

  private getPickedFocusType(
    realPosition: Vector3,
    boxFace: BoxFace,
    outputCornerSign: Vector3
  ): BoxFocusType {
    const { boxDomainObject } = this;
    const scale = newVector3().setScalar(this.getFaceRadius(boxFace));
    const scaledMatrix = boxDomainObject.getScaledMatrix(scale);
    scaledMatrix.invert();
    const scaledPositionAtFace = newVector3(realPosition).applyMatrix4(scaledMatrix);
    const planePoint = boxFace.getPlanePoint(scaledPositionAtFace);
    const relativeDistance = planePoint.length();

    outputCornerSign.copy(this.getCornerSign(realPosition, boxFace));
    const corner = this.getCorner(outputCornerSign, boxFace);

    if (relativeDistance < RELATIVE_RESIZE_RADIUS) {
      return BoxFocusType.ScaleByEdge;
    }
    if (realPosition.distanceTo(corner) < 0.2 * this.getFaceRadius(boxFace)) {
      return BoxFocusType.ScaleByCorner;
    }
    if (boxFace.face === 2) {
      if (RELATIVE_ROTATION_RADIUS.isInside(relativeDistance)) {
        return BoxFocusType.Rotate;
      }
    }
    return BoxFocusType.Translate;
  }

  private getCornerSign(realPosition: Vector3, boxFace: BoxFace): Vector3 {
    const { boxDomainObject } = this;
    const scale = newVector3().setScalar(this.getFaceRadius(boxFace));
    const scaledMatrix = boxDomainObject.getScaledMatrix(scale);
    scaledMatrix.invert();
    const scaledPositionAtFace = realPosition.clone().applyMatrix4(scaledMatrix);
    scaledPositionAtFace.setComponent(boxFace.index, 0);
    scaledPositionAtFace.setComponent(
      boxFace.tangentIndex1,
      Math.sign(scaledPositionAtFace.getComponent(boxFace.tangentIndex1))
    );
    scaledPositionAtFace.setComponent(
      boxFace.tangentIndex2,
      Math.sign(scaledPositionAtFace.getComponent(boxFace.tangentIndex2))
    );
    return scaledPositionAtFace;
  }

  private getCorner(cornerSign: Vector3, boxFace: BoxFace): Vector3 {
    const { boxDomainObject } = this;
    const center = boxFace.getCenter(new Vector3()); // In range (-0.5, 0.5)
    const corner = center.addScaledVector(cornerSign, 0.5);
    const matrix = boxDomainObject.getMatrix();
    corner.applyMatrix4(matrix);
    return corner;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Update materials
// ==================================================

function updateSolidMaterial(
  material: MeshPhongMaterial,
  boxDomainObject: BoxDomainObject,
  style: BoxRenderStyle
): void {
  const color = boxDomainObject.getColorByColorType(style.colorType);
  material.polygonOffset = boxDomainObject.hasFocus;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 4.0;
  material.color = color;
  material.opacity = style.opacityUse ? style.opacity : 1;
  material.transparent = true;
  material.emissive = color;
  material.emissiveIntensity = 0.2;
  material.side = DoubleSide;
  material.flatShading = true;
  material.depthWrite = false;
}

function updateLineSegmentsMaterial(
  material: LineBasicMaterial,
  boxDomainObject: BoxDomainObject,
  style: BoxRenderStyle
): void {
  const color = boxDomainObject.getColorByColorType(style.colorType);
  material.color = color;
  material.transparent = true;
  material.depthWrite = false;
}

function updateMarkerMaterial(
  material: MeshPhongMaterial,
  boxDomainObject: BoxDomainObject,
  selected: boolean
): void {
  material.color = ARROW_AND_RING_COLOR;
  material.polygonOffset = boxDomainObject.hasFocus;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 4.0;
  material.transparent = true;
  material.emissive = ARROW_AND_RING_COLOR;
  material.emissiveIntensity = selected ? 0.8 : 0.3;
  material.side = FrontSide;
  material.flatShading = true;
  material.depthWrite = false;
}

function createSprite(text: string, labelHeight: number): Sprite | undefined {
  const result = createSpriteWithText(text, labelHeight, WHITE_COLOR, LABEL_BG_COLOR);
  if (result === undefined) {
    return undefined;
  }
  result.material.depthTest = true;
  result.material.transparent = true;
  result.material.opacity = 0.75;
  return result;
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
