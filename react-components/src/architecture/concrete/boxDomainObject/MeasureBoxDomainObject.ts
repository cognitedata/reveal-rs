/*!
 * Copyright 2024 Cognite AS
 */

import { MeasureBoxRenderStyle } from './MeasureBoxRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { MeasureBoxView } from './MeasureBoxView';
import { Matrix4, Vector3 } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { BoxFace } from '../../base/utilities/box/BoxFace';
import { BoxFocusType } from '../../base/utilities/box/BoxFocusType';
import { MeasureType } from './MeasureType';
import { type DomainObjectIntersection } from '../../base/domainObjectsHelpers/DomainObjectIntersection';
import { type BoxPickInfo } from '../../base/utilities/box/BoxPickInfo';
import { type BaseDragger } from '../../base/domainObjectsHelpers/BaseDragger';
import { MeasureBoxDragger } from './MeasureBoxDragger';
import { MeasureDomainObject } from './MeasureDomainObject';
import { NumberType, PanelInfo } from '../../base/domainObjectsHelpers/PanelInfo';
import { radToDeg } from 'three/src/math/MathUtils.js';

export const MIN_BOX_SIZE = 0.01;

export class MeasureBoxDomainObject extends MeasureDomainObject {
  // ==================================================
  // INSTANCE FIELDS (This implements the IBox interface)
  // ==================================================

  public readonly size = new Vector3().setScalar(MIN_BOX_SIZE);
  public readonly center = new Vector3();
  public zRotation = 0; // Angle in radians in interval [0, 2*Pi>

  // For focus when edit in 3D (Used when isSelected is true only)
  public focusFace: BoxFace | undefined = undefined;
  public focusType: BoxFocusType = BoxFocusType.JustCreated;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get diagonal(): number {
    return this.size.length();
  }

  public get hasArea(): boolean {
    let count = 0;
    if (isValid(this.size.x)) count++;
    if (isValid(this.size.y)) count++;
    if (isValid(this.size.z)) count++;
    return count >= 2;
  }

  public get area(): number {
    switch (this.measureType) {
      case MeasureType.HorizontalArea:
        return this.size.x * this.size.y;
      case MeasureType.VerticalArea:
        return this.size.x * this.size.z;
      case MeasureType.Volume: {
        const a = this.size.x * this.size.y + this.size.y * this.size.z + this.size.z * this.size.x;
        return a * 2;
      }
      default:
        throw new Error('Unknown MeasureType type');
    }
  }

  public get hasHorizontalArea(): boolean {
    return isValid(this.size.x) && isValid(this.size.y);
  }

  public get horizontalArea(): number {
    return this.size.x * this.size.y;
  }

  public get hasVolume(): boolean {
    return isValid(this.size.x) && isValid(this.size.y) && isValid(this.size.z);
  }

  public get volume(): number {
    return this.size.x * this.size.y * this.size.z;
  }

  public override get renderStyle(): MeasureBoxRenderStyle {
    return this.getRenderStyle() as MeasureBoxRenderStyle;
  }

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(measureType: MeasureType) {
    super(measureType);
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override createRenderStyle(): RenderStyle | undefined {
    return new MeasureBoxRenderStyle();
  }

  public override createDragger(intersection: DomainObjectIntersection): BaseDragger | undefined {
    const pickInfo = intersection.userData as BoxPickInfo;
    if (pickInfo === undefined) {
      return undefined;
    }
    return new MeasureBoxDragger(this, intersection.point, pickInfo);
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    const { measureType } = this;
    const isFinished = this.focusType !== BoxFocusType.Pending;

    switch (measureType) {
      case MeasureType.HorizontalArea:
        info.setHeader('MEASUREMENTS_HORIZONTAL_AREA', 'Horizontal area');
        break;
      case MeasureType.VerticalArea:
        info.setHeader('MEASUREMENTS_VERTICAL_AREA', 'Vertical area');
        break;
      case MeasureType.Volume:
        info.setHeader('MEASUREMENTS_VOLUME', 'Volume');
        break;
    }
    if (isFinished || isValid(this.size.x)) {
      info.add('MEASUREMENTS_LENGTH', 'Length', this.size.x, NumberType.Length);
    }
    if (measureType !== MeasureType.VerticalArea && (isFinished || isValid(this.size.y))) {
      info.add('MEASUREMENTS_DEPTH', 'Depth', this.size.y, NumberType.Length);
    }
    if (measureType !== MeasureType.HorizontalArea && (isFinished || isValid(this.size.z))) {
      info.add('MEASUREMENTS_HEIGHT', 'Height', this.size.z, NumberType.Length);
    }
    if (measureType !== MeasureType.Volume && (isFinished || this.hasArea)) {
      info.add('MEASUREMENTS_AREA', 'Area', this.area, NumberType.Area);
    }
    if (measureType === MeasureType.Volume && (isFinished || this.hasHorizontalArea)) {
      info.add(
        'MEASUREMENTS_HORIZONTAL_AREA',
        'Horizontal area',
        this.horizontalArea,
        NumberType.Area
      );
    }
    if (measureType === MeasureType.Volume && (isFinished || this.hasVolume)) {
      info.add('MEASUREMENTS_VOLUME', 'Volume', this.volume, NumberType.Volume);
    }
    // I forgot to add text for rotation angle before the deadline, so I used a icon instead.
    if (this.zRotation !== 0 && isFinished) {
      info.addIcon('Angle', radToDeg(this.zRotation), NumberType.Degrees);
    }
    return info;
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new MeasureBoxView();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public forceMinSize(): void {
    const { size } = this;
    size.x = Math.max(MIN_BOX_SIZE, size.x);
    size.y = Math.max(MIN_BOX_SIZE, size.y);
    size.z = Math.max(MIN_BOX_SIZE, size.z);
  }

  public getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.makeRotationZ(this.zRotation);
    return matrix;
  }

  public getMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    return this.getScaledMatrix(this.size, matrix);
  }

  public getScaledMatrix(scale: Vector3, matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix = this.getRotationMatrix(matrix);
    matrix.setPosition(this.center);
    matrix.scale(scale);
    return matrix;
  }

  public setFocusInteractive(focusType: BoxFocusType, focusFace?: BoxFace): boolean {
    if (focusType === BoxFocusType.None) {
      if (this.focusType === BoxFocusType.None) {
        return false; // No change
      }
      this.focusType = BoxFocusType.None;
      this.focusFace = undefined; // Ignore input face
    } else {
      if (focusType === this.focusType && BoxFace.equals(this.focusFace, focusFace)) {
        return false; // No change
      }
      this.focusType = focusType;
      this.focusFace = focusFace;
    }
    this.notify(Changes.focus);
    return true;
  }
}

function isValid(value: number): boolean {
  return value > MIN_BOX_SIZE;
}
