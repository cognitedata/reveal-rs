/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { NavigationTool } from '../../../architecture/base/concreteCommands/NavigationTool';
import { SetTerrainVisibleCommand } from '../../../architecture/concrete/terrainDomainObject/SetTerrainVisibleCommand';
import { CommandButton } from './CommandButton';
import { UpdateTerrainCommand } from '../../../architecture/concrete/terrainDomainObject/UpdateTerrainCommand';
import { BoxEditTool } from '../../../architecture/concrete/boxDomainObject/BoxEditTool';
import { FitViewCommand } from '../../../architecture/base/concreteCommands/FitViewCommand';
import { FlexibleControlsType } from '@cognite/reveal';
import { SetFlexibleControlsTypeCommand } from '../../../architecture/base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetAxisVisibleCommand } from '../../../architecture/concrete/axis/SetAxisVisibleCommand';
import { GeometryType } from '../../../architecture/base/utilities/box/GeometryType';

/* eslint-disable @typescript-eslint/no-extraneous-class */

export class RevealButtons {
  static FitView = (): ReactElement => CommandButton(new FitViewCommand());
  static NavigationTool = (): ReactElement => CommandButton(new NavigationTool());
  static SetAxisVisible = (): ReactElement => CommandButton(new SetAxisVisibleCommand());
  static SetTerrainVisible = (): ReactElement => CommandButton(new SetTerrainVisibleCommand());
  static UpdateTerrain = (): ReactElement => CommandButton(new UpdateTerrainCommand());
  static MeasureLine = (): ReactElement => CommandButton(new BoxEditTool(GeometryType.Line));
  static MeasureLines = (): ReactElement => CommandButton(new BoxEditTool(GeometryType.Polyline));

  static MeasureHorizontalArea = (): ReactElement =>
    CommandButton(new BoxEditTool(GeometryType.HorizontalArea));

  static MeasureVerticalArea = (): ReactElement =>
    CommandButton(new BoxEditTool(GeometryType.VerticalArea));

  static MeasureVolume = (): ReactElement => CommandButton(new BoxEditTool(GeometryType.Volume));

  static SetFlexibleControlsTypeOrbit = (): ReactElement =>
    CommandButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit));

  static SetFlexibleControlsTypeFirstPerson = (): ReactElement =>
    CommandButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson));
}
