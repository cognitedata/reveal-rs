/*!
 * Copyright 2024 Cognite AS
 */

import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { MeasureLineView } from './MeasureLineView';
import { Vector3 } from 'three';
import { MeasureType } from './MeasureType';
import { MeasureLineRenderStyle } from './MeasureLineRenderStyle';
import { MeasureDomainObject } from './MeasureDomainObject';
import {
  getHorizontalCrossProduct,
  horizontalDistanceTo,
  verticalDistanceTo
} from '../../base/utilities/extensions/vectorExtensions';
import { NumberType, PanelInfo } from '../../base/domainObjectsHelpers/PanelInfo';
import { Changes } from '../../base/domainObjectsHelpers/Changes';

export class MeasureLineDomainObject extends MeasureDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly points: Vector3[] = [];
  public hasFocus: boolean = false;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public override get renderStyle(): MeasureLineRenderStyle {
    return this.getRenderStyle() as MeasureLineRenderStyle;
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
    return new MeasureLineRenderStyle();
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    switch (this.measureType) {
      case MeasureType.Line:
        info.setHeader('MEASUREMENTS_LINE', 'Line');
        add('MEASUREMENTS_LENGTH', 'Length', this.getTotalLength());
        add('MEASUREMENTS_HORIZONTAL_LENGTH', 'Horizontal length', this.getHorizontalLength());
        add('MEASUREMENTS_VERTICAL_LENGTH', 'Vertical length', this.getVerticalLength());
        break;

      case MeasureType.Polyline:
        info.setHeader('MEASUREMENTS_POLYLINE', 'Polyline');
        add('MEASUREMENTS_TOTAL_LENGTH', 'Total length', this.getTotalLength());
        break;
      case MeasureType.Polygon:
        info.setHeader('MEASUREMENTS_POLYGON', 'Polygon');
        add('MEASUREMENTS_TOTAL_LENGTH', 'Total length', this.getTotalLength());
        if (this.points.length > 2) {
          add('MEASUREMENTS_HORIZONTAL_AREA', 'Horizontal area', this.getHorizontalArea());
        }
        break;

      default:
        throw new Error('Unknown MeasureType type');
    }
    function add(key: string, fallback: string, value: number): void {
      info.add(key, fallback, value, NumberType.Length);
    }

    return info;
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new MeasureLineView();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public getTotalLength(): number {
    let prevPoint: Vector3 | undefined;
    let sum = 0.0;
    for (const point of this.points) {
      if (prevPoint !== undefined) {
        sum += point.distanceTo(prevPoint);
        continue;
      }
      prevPoint = point;
    }
    return sum;
  }

  public getAverageLength(): number {
    const length = this.points.length;
    if (length === 0) {
      return 0;
    }
    return this.getTotalLength() / length;
  }

  public getHorizontalLength(): number {
    let prevPoint: Vector3 | undefined;
    let sum = 0.0;
    for (const point of this.points) {
      if (prevPoint !== undefined) {
        sum += horizontalDistanceTo(point, prevPoint);
        continue;
      }
      prevPoint = point;
    }
    return sum;
  }

  public getVerticalLength(): number {
    let prevPoint: Vector3 | undefined;
    let sum = 0.0;
    for (const point of this.points) {
      if (prevPoint !== undefined) {
        sum += verticalDistanceTo(point, prevPoint);
        continue;
      }
      prevPoint = point;
    }
    return sum;
  }

  public getHorizontalArea(): number {
    const { points } = this;
    const length = points.length;

    if (length <= 2) {
      return 0;
    }
    let sum = 0.0;
    const first = points[0];
    const p0 = new Vector3();
    const p1 = new Vector3();

    for (let index = 1; index <= length; index++) {
      p1.copy(points[index % length]);
      p1.sub(first); // Translate down to first point, to increase acceracy
      sum += getHorizontalCrossProduct(p0, p1);
      p0.copy(p1);
    }
    return Math.abs(sum) / 2;
  }

  public setFocusInteractive(hasFocus: boolean): boolean {
    this.hasFocus = hasFocus;
    this.notify(Changes.focus);
    return true;
  }
}
