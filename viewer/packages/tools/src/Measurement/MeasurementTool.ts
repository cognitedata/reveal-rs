/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/api';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import * as THREE from 'three';
import { MeasurementOptions } from './types';
import { MeasurementControls, Measurement } from './MeasurementControls';
import { HtmlOverlayTool, HtmlOverlayToolOptions } from '../HtmlOverlay/HtmlOverlayTool';
import rulerSvg from './styles/ruler.svg';
import { MeasurementLabels } from './MeasurementLabels';
import assert from 'assert';

/**
 * Enables {@see Cognite3DViewer} to perform a point to point measurement.
 * This can be achieved by selecting a point on the 3D Object and drag the pointer to
 * required point to get measurement of the distance.
 * The tools default measurement is in "Meters" as supported in Reveal, but it also provides
 * user to customise the measuring units based on their convinience with the callback.
 *
 * @example
 * ```js
 * const measurementTool = new MeasurementTool(viewer);
 * measurementTool.enterMeasurementMode();
 * // ...
 * measurementTool.exitMeasurementMode();
 *
 * // detach the tool from the viewer
 * measurementTool.dispose();
 * ```
 * @example
 * ```jsx runnable
 * const measurementTool = new MeasurementTool(viewer, {changeMeasurementLabelMetrics: (distance) => {
 *    // 1 meters = 3.281 feet
 *    const distanceInFeet = distance * 3.281;
 *    return { distance: distanceInFeet, units: 'ft'};
 *  }});
 *  measurementTool.enterMeasurementMode();
```
 */
export class MeasurementTool extends Cognite3DViewerToolBase {
  private _options: Required<MeasurementOptions>;

  private readonly _viewer: Cognite3DViewer;
  private readonly _geometryGroup = new THREE.Group();
  private readonly _measurements: MeasurementControls[];
  private _currentMeasurementIndex: number;
  private readonly _htmlOverlay: HtmlOverlayTool;

  private readonly _handleLabelClustering = this.createCombineClusterElement.bind(this);
  private readonly _handlePointerClick = this.onPointerClick.bind(this);
  private readonly _handlePointerMove = this.onPointerMove.bind(this);

  private readonly _overlayOptions: HtmlOverlayToolOptions = {
    clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback: this._handleLabelClustering }
  };

  private static readonly defaultLineOptions: Required<MeasurementOptions> = {
    distanceToLabelCallback: d => MeasurementTool.metersLabelCallback(d),
    lineWidth: 2.0,
    color: new THREE.Color(0x00ffff)
  };

  constructor(viewer: Cognite3DViewer, options?: MeasurementOptions) {
    super();
    this._viewer = viewer;
    this._options = {
      ...MeasurementTool.defaultLineOptions,
      ...options
    };
    this._measurements = [];
    this._htmlOverlay = new HtmlOverlayTool(this._viewer, this._overlayOptions);
    this._currentMeasurementIndex = -1;

    this._geometryGroup.name = MeasurementTool.name;
    this._viewer.addObject3D(this._geometryGroup);
  }

  /**
   * Enter into point to point measurement mode.
   */
  enterMeasurementMode(): void {
    this.setupEventHandling();
  }

  /**
   * Exit measurement mode.
   */
  exitMeasurementMode(): void {
    //clear all mesh, geometry & event handling.
    this._measurements.forEach(measurement => {
      measurement.dispose();
    });
    this.removeEventHandling();
  }

  /**
   * Removes a measurement from the Cognite3DViewer.
   * @param measurement Measurement to be removed from @Cognite3DViewer.
   */
  removeMeasurement(measurement: Measurement): void {
    const index = this._measurements.findIndex(
      measurementControl => measurementControl.getMeasurement() === measurement
    );
    if (index > -1) {
      this._measurements[index].removeMeasurement();
      this._measurements.splice(index, 1);
      this._currentMeasurementIndex--;
    }
  }

  /**
   * Removes all measurements from the Cognite3DViewer.
   */
  removeAllMeasurements(): void {
    this._measurements.forEach(measurement => {
      measurement.removeMeasurement();
    });
    this._measurements.splice(0);
    this._currentMeasurementIndex = -1;
  }

  /**
   * Sets the visiblity of labels in the Measurement.
   * @param enable
   */
  showMeasurementLabels(enable: boolean): void {
    if (this._htmlOverlay) {
      this._htmlOverlay.visible(enable);
    }
  }

  /**
   * Sets Measurement line width and color with @options value for the next measurment.
   * @param options MeasurementOptions to set line width and/or color.
   */
  setLineOptions(options: MeasurementOptions): void {
    //Line width & color value will be used for the next measuring line
    this._options = {
      ...this._options,
      ...options
    };
  }

  /**
   * Update selected line width.
   * @param measurement Measurement.
   * @param lineWidth Width of the measuring line mesh.
   */
  updateLineWidth(measurement: Measurement, lineWidth: number): void {
    const index = this._measurements.findIndex(
      measurementControl => measurementControl.getMeasurement() === measurement
    );
    if (index > -1) {
      this._measurements[index].updateLineWidth(lineWidth);
    }
  }

  /**
   * Update selected line color.
   * @param measurement Measurement.
   * @param color Color of the measuring line mesh.
   */
  updateLineColor(measurement: Measurement, color: THREE.Color): void {
    const index = this._measurements.findIndex(
      measurementControl => measurementControl.getMeasurement() === measurement
    );
    if (index > -1) {
      this._measurements[index].updateLineColor(color);
    }
  }

  /**
   * Get all measurements from {@link Cognite3DViewer}.
   * @returns Array of Measurement containing Id, start point, end point & measured distance.
   */
  getAllMeasurements(): Measurement[] {
    return this._measurements.map(measurement => measurement.getMeasurement());
  }

  /**
   * Dispose Measurement Tool.
   */
  dispose(): void {
    this.removeAllMeasurements();
    this._htmlOverlay.dispose();
    super.dispose();
  }

  /**
   * Set input handling.
   */
  private setupEventHandling() {
    this._viewer.on('click', this._handlePointerClick);
  }

  /**
   * Remove input handling.
   */
  private removeEventHandling() {
    this._viewer.off('click', this._handlePointerClick);
  }

  private async onPointerClick(event: any): Promise<void> {
    const { offsetX, offsetY } = event;

    const intersection = await this._viewer.getIntersectionFromPixel(offsetX, offsetY);

    if (!intersection) {
      return;
    }

    const measurementActive = this._currentMeasurementIndex !== -1;

    if (!measurementActive) {
      const camera = this._viewer.getCamera();
      const domElement = this._viewer.domElement;
      this._measurements.push(
        new MeasurementControls(
          domElement,
          camera,
          this._geometryGroup,
          this._options!,
          this._htmlOverlay,
          intersection.point
        )
      );
      this._currentMeasurementIndex = this._measurements.length - 1;
      this._viewer.domElement.addEventListener('mousemove', this._handlePointerMove);
    } else {
      this._measurements[this._currentMeasurementIndex].endMeasurement(intersection.point);
      this._currentMeasurementIndex = -1;
      this._viewer.domElement.removeEventListener('mousemove', this._handlePointerMove);
    }
    this._viewer.requestRedraw();
  }

  private onPointerMove(event: { offsetX: number; offsetY: number }) {
    assert(this._currentMeasurementIndex !== -1);
    this._measurements[this._currentMeasurementIndex].update(event);
    this._viewer.requestRedraw();
  }

  /**
   * Create and return combine ruler icon as HTMLDivElement.
   * @returns HTMLDivElement.
   */
  private createCombineClusterElement() {
    // TODO 2022-07-05 larsmoa: Move all ownership of labels here - currently responsibility is split
    // between several classes which is *bad*
    // pramodcog: as clustering is related to tool, it would be ideal to have it here.
    const combineElement = document.createElement('div');
    combineElement.className = MeasurementLabels.stylesId;
    combineElement.innerHTML = rulerSvg;

    return combineElement;
  }

  private static metersLabelCallback(distanceInMeters: number): string {
    return `${distanceInMeters.toFixed(2)} m`;
  }
}
