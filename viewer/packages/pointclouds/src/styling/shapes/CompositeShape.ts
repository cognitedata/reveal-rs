/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './IShape';
import { IRawShape, ShapeType } from './IRawShape';

import { Vec3, AABB, b3Union, emptyBox3 } from './linalg';

export type RawCompositeShape = {
  type: ShapeType.Composite;
  shapes: IRawShape[];
};

export class CompositeShape implements IShape {
  private readonly _innerShapes: IShape[];

  constructor(shapes: IShape[]) {
    this._innerShapes = shapes.slice();
  }

  computeBoundingBox(): AABB {
    let newBox = emptyBox3();
    for (const shape of this._innerShapes) {
      newBox = b3Union(newBox, shape.computeBoundingBox());
    }
    return newBox;
  }

  containsPoint(point: Vec3): boolean {
    for (const shape of this._innerShapes) {
      if (shape.containsPoint(point)) {
        return true;
      }
    }

    return false;
  }

  toRawShape(): RawCompositeShape {
    return {
      type: ShapeType.Composite,
      shapes: this._innerShapes.map(shape => shape.toRawShape())
    };
  }
}
