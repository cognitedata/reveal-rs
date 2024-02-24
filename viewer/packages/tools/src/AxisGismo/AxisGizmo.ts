/*
 * Copyright 2024 Cognite AS
 */

import { Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { AxisGizmoOptions } from './AxisGizmoOptions';
import { CDF_TO_VIEWER_TRANSFORMATION, Corner } from '@reveal/utilities';
import { Cognite3DViewer } from '@reveal/api';
import { OneGizmoAxis } from './OneGizmoAxis';
import { moveCameraTo } from './moveCameraTo';

/**
 * Class for axis gizmo like the one in Blender
 * @beta
 */
export class AxisGizmo {
  //================================================
  // INSTANCE FIELDS
  //================================================
  private readonly _options: AxisGizmoOptions;
  private readonly _axises: OneGizmoAxis[];
  private readonly _center: Vector3;
  private _mousePosition: Vector3 | undefined = undefined;
  private _selectedAxis: OneGizmoAxis | undefined = undefined;
  private _isMouseOver = false; // Keep track of this for highlighing the gizmo
  private _inDragging = false;

  private _viewer: Cognite3DViewer | null = null;
  private _element: HTMLElement | null = null;
  private _canvas: HTMLCanvasElement | null = null;
  private _context: CanvasRenderingContext2D | null = null;

  // binding of the event functions:
  private readonly _onPointerDown = this.onPointerDown.bind(this);
  private readonly _onPointerUp = this.onPointerUp.bind(this);
  private readonly _onPointerMove = this.onPointerMove.bind(this);
  private readonly _onPointerOut = this.onPointerOut.bind(this);
  private readonly _onMouseClick = this.onMouseClick.bind(this);
  private readonly _onMouseDoubleClick = this.onMouseDoubleClick.bind(this);

  //================================================
  // CONSTRUCTORS
  //================================================

  constructor() {
    this._options = new AxisGizmoOptions();
    const halfSize = this._options.size / 2;
    this._center = new Vector3(halfSize, halfSize, 0);
    this._axises = OneGizmoAxis.createAllAxises(this._options);
  }

  //================================================
  // INSTANCE METHODS: Public
  //================================================

  public connect(viewer: Cognite3DViewer): void {
    this._viewer = viewer;
    this._element = this.createElement();
    viewer.domElement.appendChild(this._element);
    this._canvas = this._element.querySelector('canvas');
    if (!this._canvas) {
      return;
    }
    this._context = this._canvas.getContext('2d');
    this.addEventListeners();
  }

  public dispose(): void {
    if (this._viewer && this._element) {
      this._viewer.domElement.removeChild(this._element);
    }
    this.removeEventListeners();
    this._viewer = null;
    this._canvas = null;
    this._context = null;
    this._element = null;
  }

  //================================================
  // INSTANCE METHODS: Events
  //================================================

  private onPointerDown(event: PointerEvent) {
    event.stopPropagation();
    this._inDragging = true;
  }

  private onPointerUp(event: PointerEvent) {
    event.stopPropagation();
    if (!this._inDragging) {
      return;
    }
    this._inDragging = false;
    if (this._viewer == null) {
      return;
    }
    this.updateSelectedAxis();
    const axis = this.getAxisToUse();
    if (!axis) {
      return;
    }
    const cameraManager = this._viewer.cameraManager;
    const { position, target } = cameraManager.getCameraState();
    const forward = axis.direction.clone().negate();
    const upAxis = axis.upAxis;

    forward.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    upAxis.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);

    // Position = Target - direction * distanceToTarget
    const distance = position.distanceTo(target);
    const direction = forward.clone();
    direction.multiplyScalar(distance);
    const newPosition = target.clone().add(direction);

    moveCameraTo(this._viewer.cameraManager, newPosition, forward, upAxis, this._options.animationDuration);
    this.updateAndRender(cameraManager.getCamera());
  }

  private onPointerMove(event: PointerEvent) {
    if (!this._canvas) {
      return;
    }
    const rectangle = this._canvas.getBoundingClientRect();
    this._mousePosition = new Vector3(event.clientX - rectangle.left, event.clientY - rectangle.top, 0);
    if (this.updateSelectedAxis()) {
      this.updateAndRender(null);
    }
  }

  private onPointerOut(_event: PointerEvent) {
    this._inDragging = false;
    this._isMouseOver = false;
    this._selectedAxis = undefined;
    this._mousePosition = undefined;
    this.updateAndRender(null);
  }

  private onMouseClick(event: MouseEvent) {
    event.stopPropagation();
  }

  private onMouseDoubleClick(event: MouseEvent) {
    event.stopPropagation();
  }

  private readonly onCameraChange = (_position: Vector3, _target: Vector3) => {
    if (this._viewer) {
      this.updateSelectedAxis();
      this.updateAndRender(this._viewer.cameraManager.getCamera());
    }
  };

  //================================================
  // INSTANCE METHODS: Getters
  //================================================

  private getTextColor(axis: OneGizmoAxis): string {
    if (this._selectedAxis === axis) {
      return this._options.selectedTextColor;
    } else {
      return this._options.normalTextColor;
    }
  }

  private isMouseOver(): boolean {
    if (!this._mousePosition) {
      return false;
    }
    return horizontalDistanceTo(this._mousePosition, this._center) < this._options.radius;
  }

  private getAxisToUse(): OneGizmoAxis | undefined {
    const selectedAxis = this._selectedAxis;
    if (!selectedAxis) {
      return undefined;
    }
    // This behavior is according to blender. If click on an axis in center,
    // use the opposite axis
    const distance = horizontalDistanceTo(this._center, selectedAxis.bobblePosition);
    if (distance > 1) {
      return selectedAxis;
    }
    for (const otherAxis of this._axises) {
      if (otherAxis.axis == selectedAxis.axis && otherAxis.isPrimary != selectedAxis.isPrimary) {
        return otherAxis; // Opposite axis found
      }
    }
    return selectedAxis;
  }

  private getSelectedAxis(): OneGizmoAxis | undefined {
    if (!this._mousePosition) {
      return undefined;
    }
    if (!this.isMouseOver()) {
      return undefined;
    }
    // If the mouse is over the gizmo, find the one witch is under the mouse
    // Go reverse sive the last is the most visible
    for (let i = this._axises.length - 1; i >= 0; i--) {
      const axis = this._axises[i];
      const distance = horizontalDistanceTo(this._mousePosition, axis.bobblePosition);
      if (distance <= this._options.bubbleRadius) {
        return axis;
      }
    }
  }

  //================================================
  // INSTANCE METHODS: Updating
  //================================================

  private updateSelectedAxis(): boolean {
    if (!this._canvas) {
      return false;
    }
    const selectedAxis = this.getSelectedAxis();
    const isMouseInside = this.isMouseOver();
    if (selectedAxis === this._selectedAxis && isMouseInside === this._isMouseOver) {
      return false;
    }
    this._isMouseOver = isMouseInside;
    this._selectedAxis = selectedAxis;
    return true; // Returns true if updated
  }

  private updateAndRender(camera: PerspectiveCamera | null): void {
    if (this._context == null || this._canvas == null) {
      return;
    }
    if (camera) {
      // Calculate the rotation matrix from the camera and move the axises to the correct position
      const matrix = new Matrix4().makeRotationFromEuler(camera.rotation).invert();
      const fromViewerMatrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
      for (const axis of this._axises) {
        const direction = axis.direction.clone();
        if (axis.axis === 0) {
          direction.negate();
        }
        direction.applyMatrix4(fromViewerMatrix);
        direction.applyMatrix4(matrix);
        this.updateAxisPosition(direction, axis.bobblePosition);
      }
      // Since the bobblePosition has changed, maybe the selectedAxis is changed
      this.updateSelectedAxis();
    }
    // Sort the axis by it's z position
    this._axises.sort((a, b) => (a.bobblePosition.z > b.bobblePosition.z ? 1 : -1));
    this.render();
  }

  private updateAxisPosition(position: Vector3, target: Vector3): void {
    const padding = this._options.bubbleRadius - 1;
    target.set(
      position.x * (this._center.x - this._options.bubbleRadius / 2 - padding) + this._center.x,
      this._center.y - position.y * (this._center.y - this._options.bubbleRadius / 2 - padding),
      position.z
    );
  }

  //================================================
  // INSTANCE METHODS: Listeners administration
  //================================================

  private addEventListeners(): void {
    if (this._viewer) {
      this._viewer.on('cameraChange', this.onCameraChange);
    }
    const canvas = this._canvas;
    if (!canvas) {
      return;
    }
    canvas.addEventListener('pointermove', this._onPointerMove, false);
    canvas.addEventListener('pointerout', this._onPointerOut, false);
    canvas.addEventListener('pointerdown', this._onPointerDown, false);
    canvas.addEventListener('pointerup', this._onPointerUp, false);
    canvas.addEventListener('click', this._onMouseClick, false);
    canvas.addEventListener('dblclick', this._onMouseDoubleClick, false);
  }

  private removeEventListeners(): void {
    if (this._viewer) {
      this._viewer.off('cameraChange', this.onCameraChange);
    }
    const canvas = this._canvas;
    if (!canvas) {
      return;
    }
    canvas.removeEventListener('pointermove', this._onPointerMove);
    canvas.removeEventListener('pointerout', this._onPointerOut);
    canvas.removeEventListener('pointerdown', this._onPointerDown);
    canvas.removeEventListener('pointerup', this._onPointerUp);
    canvas.removeEventListener('click', this._onMouseClick);
    canvas.removeEventListener('dblclick', this._onMouseDoubleClick);
  }

  //================================================
  // INSTANCE METHODS: Graphics
  //================================================

  private createElement(): HTMLElement {
    const element: HTMLElement = document.createElement('div');
    element.innerHTML = '<canvas ></canvas>';
    initializeStyle(element, this._options);
    return element;
  }

  private render() {
    if (this._context == null) {
      return;
    }
    if (this._canvas) {
      clear(this._context, this._canvas);
    }
    setFont(this._context, this._options);

    if (this._isMouseOver && this._options.focusCircleAlpha > 0) {
      this._context.globalAlpha = this._options.focusCircleAlpha;
      fillCircle(this._context, this._center, this._options.radius, this._options.focusCircleColor);
      this._context.globalAlpha = 1;
    }
    const { bubbleRadius, primaryLineWidth, secondaryLineWidth, bobbleLineWidth } = this._options;
    for (const axis of this._axises) {
      const lightColor = axis.getLightColorInHex();

      if (axis.isPrimary) {
        if (primaryLineWidth > 0) {
          drawAxisLine(this._context, this._center, axis.bobblePosition, primaryLineWidth, lightColor);
        }
        fillCircle(this._context, axis.bobblePosition, bubbleRadius, lightColor);
      } else {
        const darkColor = axis.getDarkColorInHex();
        if (secondaryLineWidth > 0) {
          drawAxisLine(this._context, this._center, axis.bobblePosition, secondaryLineWidth, lightColor);
        }
        fillCircle(this._context, axis.bobblePosition, bubbleRadius, darkColor);
        if (bobbleLineWidth > 0) {
          drawCircle(this._context, axis.bobblePosition, bubbleRadius - 1, bobbleLineWidth, lightColor);
        }
      }
      if (axis.isPrimary || this._selectedAxis === axis) {
        drawText(this._context, axis.label, axis.bobblePosition, this._options, this.getTextColor(axis));
      }
    }
  }
}

//================================================
// FUNCTIONS: Helpers used internaly in this file
//================================================

function horizontalDistanceTo(a: Vector3, b: Vector3) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function clear(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function fillCircle(context: CanvasRenderingContext2D, p: Vector3, radius: number, color: string) {
  context.beginPath();
  context.arc(p.x, p.y, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
}

function drawCircle(context: CanvasRenderingContext2D, p: Vector3, radius: number, width: number, color: string) {
  context.beginPath();
  context.arc(p.x, p.y, radius, 0, 2 * Math.PI, false);
  context.lineWidth = width;
  context.strokeStyle = color;
  context.stroke();
}

function drawAxisLine(context: CanvasRenderingContext2D, p1: Vector3, p2: Vector3, width: number, color: string) {
  context.beginPath();
  context.moveTo(p1.x, p1.y);
  context.lineTo(p2.x, p2.y);
  context.lineWidth = width;
  context.strokeStyle = color;
  context.stroke();
}

function setFont(context: CanvasRenderingContext2D, options: AxisGizmoOptions) {
  context.font = options.getFont();
  context.textBaseline = 'middle';
  context.textAlign = 'center';
}

function drawText(
  context: CanvasRenderingContext2D,
  label: string,
  position: Vector3,
  options: AxisGizmoOptions,
  color: string
) {
  context.fillStyle = color;
  context.fillText(label, position.x, position.y + options.fontYAdjust);
}

function initializeStyle(element: HTMLElement, options: AxisGizmoOptions) {
  const style = element.style;
  if (!style) {
    return;
  }
  style.position = 'absolute';
  style.zIndex = '1000';
  style.height = style.width = options.size + 'px';
  const margin = options.edgeMargin + 'px';
  switch (options.corner) {
    case Corner.TopRight:
      style.top = style.right = margin;
      break;
    case Corner.BottomLeft:
      style.bottom = style.left = margin;
      break;
    case Corner.BottomRight:
      style.bottom = style.right = margin;
      break;
    default:
      style.top = style.left = margin;
  }
}
