/*!
 * Copyright 2022 Cognite AS
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(min, value), max);
}
