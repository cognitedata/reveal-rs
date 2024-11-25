/*!
 * Copyright 2024 Cognite AS
 */

import {
  AngleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Axis3DIcon,
  BorderHorizontalIcon,
  BorderVerticalIcon,
  BugIcon,
  CircleIcon,
  ClearAllIcon,
  CloseLargeIcon,
  CoordinatesIcon,
  CopyIcon,
  CropIcon,
  CubeFrontLeftIcon,
  CubeFrontRightIcon,
  CubeIcon,
  CubeTopIcon,
  CursorIcon,
  CylinderArbitraryIcon,
  CylinderHorizontalIcon,
  CylinderVerticalIcon,
  DeleteIcon,
  ExpandAlternativeIcon,
  EyeShowIcon,
  FilterIcon,
  FlagIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  FolderIcon,
  GrabIcon,
  LeafIcon,
  InfoIcon,
  LocationIcon,
  PerspectiveAltIcon,
  PerspectiveIcon,
  PlaneIcon,
  PlusIcon,
  PointCloudIcon,
  PolygonIcon,
  RefreshIcon,
  RestoreIcon,
  RulerAlternativeIcon,
  RulerIcon,
  SaveIcon,
  SettingsIcon,
  ShapesIcon,
  SnowIcon,
  SunIcon,
  SyncIcon,
  VectorLineIcon,
  VectorZigzagIcon,
  View360Icon,
  WaypointIcon
} from '@cognite/cogs.js';

import { type IconName } from '../../../architecture/base/utilities/IconName';
import { type IconType } from './IconFactory';

export const DefaultIcons: Array<[IconName, IconType]> = [
  ['Angle', AngleIcon],
  ['ArrowLeft', ArrowLeftIcon],
  ['ArrowRight', ArrowRightIcon],
  ['Axis3D', Axis3DIcon],
  ['Bug', BugIcon],
  ['BorderHorizontal', BorderHorizontalIcon],
  ['BorderVertical', BorderVerticalIcon],
  ['Circle', CircleIcon],
  ['ClearAll', ClearAllIcon],
  ['CloseLarge', CloseLargeIcon],
  ['Coordinates', CoordinatesIcon],
  ['Copy', CopyIcon],
  ['Crop', CropIcon],
  ['Cube', CubeIcon],
  ['CubeFrontLeft', CubeFrontLeftIcon],
  ['CubeFrontRight', CubeFrontRightIcon],
  ['CubeTop', CubeTopIcon],
  ['Cursor', CursorIcon],
  ['CylinderHorizontal', CylinderHorizontalIcon],
  ['CylinderVertical', CylinderVerticalIcon],
  ['CylinderArbitrary', CylinderArbitraryIcon],
  ['Delete', DeleteIcon],
  ['ExpandAlternative', ExpandAlternativeIcon],
  ['EyeShow', EyeShowIcon],
  ['Filter', FilterIcon],
  ['Flag', FlagIcon],
  ['FlipHorizontal', FlipHorizontalIcon],
  ['FlipVertical', FlipVerticalIcon],
  ['Folder', FolderIcon],
  ['Grab', GrabIcon],
  ['Info', InfoIcon],
  ['Leaf', LeafIcon],
  ['Location', LocationIcon],
  ['Perspective', PerspectiveIcon],
  ['PerspectiveAlt', PerspectiveAltIcon],
  ['Plane', PlaneIcon],
  ['Plus', PlusIcon],
  ['PointCloud', PointCloudIcon],
  ['Polygon', PolygonIcon],
  ['Refresh', RefreshIcon],
  ['Restore', RestoreIcon],
  ['Ruler', RulerIcon],
  ['RulerAlternative', RulerAlternativeIcon],
  ['Save', SaveIcon],
  ['Shapes', ShapesIcon],
  ['Settings', SettingsIcon],
  ['Snow', SnowIcon],
  ['Sun', SunIcon],
  ['Sync', SyncIcon],
  ['VectorLine', VectorLineIcon],
  ['VectorZigzag', VectorZigzagIcon],
  ['View360', View360Icon],
  ['Waypoint', WaypointIcon]
];
