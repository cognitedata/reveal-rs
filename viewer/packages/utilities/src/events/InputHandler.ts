/*!
 * Copyright 2021 Cognite AS
 */
import { clickOrTouchEventOffset } from './clickOrTouchEventOffset';
import { EventTrigger } from './EventTrigger';
import debounce from 'lodash/debounce';
import { assertNever } from '@reveal/utilities';
import { Vector2 } from 'three';

type PointerEventDelegate = (event: { offsetX: number; offsetY: number }) => void;

export class InputHandler {
  private readonly domElement: HTMLElement;

  private readonly _events = {
    click: new EventTrigger<PointerEventDelegate>(),
    hover: new EventTrigger<PointerEventDelegate>()
  };

  private setupEventListeners() {
    const { domElement } = this;

    const maxMoveDistance = 4;
    const maxClickDuration = 250;

    let pointerDown = false;
    let pointerDownTimestamp = 0;
    let validClick = false;

    const startOffset = new Vector2();

    const onHoverCallback = debounce((e: MouseEvent) => {
      this._events.hover.fire(clickOrTouchEventOffset(e, domElement));
    }, 100);

    const onUp = (e: MouseEvent | TouchEvent) => {
      const { offsetX, offsetY } = clickOrTouchEventOffset(e, domElement);
      const hasMovedDuringClick =
        Math.abs(offsetX - startOffset.x) + Math.abs(offsetY - startOffset.y) > maxMoveDistance;

      const clickDuration = e.timeStamp - pointerDownTimestamp;
      if (pointerDown && validClick && clickDuration < maxClickDuration && !hasMovedDuringClick) {
        // trigger events
        this._events.click.fire(clickOrTouchEventOffset(e, domElement));
      }
      pointerDown = false;
      validClick = false;

      // up
      domElement.removeEventListener('mouseup', onUp);
      domElement.removeEventListener('touchend', onUp);

      // add back onHover
      domElement.addEventListener('mousemove', onHoverCallback);
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      pointerDown = true;
      validClick = true;
      pointerDownTimestamp = e.timeStamp;

      const { offsetX, offsetY } = clickOrTouchEventOffset(e, domElement);
      startOffset.set(offsetX, offsetY);

      // up
      domElement.addEventListener('mouseup', onUp);
      domElement.addEventListener('touchend', onUp);

      // no more onHover
      domElement.removeEventListener('mousemove', onHoverCallback);
    };

    // down
    domElement.addEventListener('mousedown', onDown);
    domElement.addEventListener('touchstart', onDown);

    // on hover callback
    domElement.addEventListener('mousemove', onHoverCallback);
  }

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;

    this.setupEventListeners();
  }
  /**
   * @example
   * ```js
   * const onClick = (event) => { console.log(event.offsetX, event.offsetY) };
   * viewer.on('click', onClick);
   * ```
   */
  on(event: 'click' | 'hover', callback: PointerEventDelegate): void {
    switch (event) {
      case 'click':
        this._events.click.subscribe(callback as PointerEventDelegate);
        break;

      case 'hover':
        this._events.hover.subscribe(callback as PointerEventDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  off(event: 'click' | 'hover', callback: PointerEventDelegate): void {
    switch (event) {
      case 'click':
        this._events.click.unsubscribe(callback as PointerEventDelegate);
        break;

      case 'hover':
        this._events.hover.unsubscribe(callback as PointerEventDelegate);
        break;
      default:
        assertNever(event);
    }
  }
}
