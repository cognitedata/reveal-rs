/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { MapConfig } from './MapConfig';
import { Geomap } from './Geomap';

export class GeomapTool extends Cognite3DViewerToolBase {

  private readonly _viewer: Cognite3DViewer;
  private readonly _maps: Geomap;

  constructor(viewer: Cognite3DViewer, config: MapConfig) {
    super();

    this._viewer = viewer;
    this._maps = new Geomap(this._viewer, config);
    this._maps.setLatLong(config.latlong.latitude, config.latlong.longitude);
  }

  public setLatLong(lat: number, long : number) {
    this._maps.setLatLong(lat, long);
  }

  public setMapProvider(provider: string) {
    this._maps.setMapProvider(provider);
  }

  public dispose(): void {
    super.dispose();
  }
}