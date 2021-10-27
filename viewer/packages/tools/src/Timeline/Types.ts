/*!
 * Copyright 2021 Cognite AS
 */
import { Keyframe } from './Keyframe';
/**
 * Delegate for Timeline Date update
 */
export type TimelineDateUpdateDelegate = (event: {
  currentDate: Date;
  activeKeyframe: Keyframe;
  startDate: Date;
  endDate: Date;
}) => void;
