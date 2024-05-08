/*!
 * Copyright 2024 Cognite AS
 */

import { type Vector3 } from 'three';
import { type BoxFace } from './BoxFace';
import { type BoxFocusType } from './BoxFocusType';

export type IBox = {
  get size(): Vector3;
  get center(): Vector3;
  get zRotation(): number;
  set zRotation(value: number);

  // For focus when edit in 3D
  get focusFace(): BoxFace | undefined;
  set focusFace(value: BoxFace | undefined);
  get focusType(): BoxFocusType;
  set focusType(value: BoxFocusType);
};
