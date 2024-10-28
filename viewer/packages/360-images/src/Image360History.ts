/*!
 * Copyright 2022 Cognite AS
 */

import { Image360 } from './entity/Image360';
import { Image360Action } from './Image360Action';

export class Image360History {
  private readonly _history: Image360[] = [];
  private _currentIndex: number = -1; // Negative mean no current index (avoid empty because of harder logic)

  public start(history: Image360): void {
    if (this.isLegalIndex(this._currentIndex + 1)) {
      this._history.slice(this._currentIndex + 1);
    }
    this._history.push(history);
    this._currentIndex = this._history.length - 1;
  }

  private current(): Image360 | undefined {
    if (!this.isLegalIndex(this._currentIndex)) {
      return undefined;
    }
    return this._history[this._currentIndex];
  }

  public clear(): void {
    this._history.splice(0, this._history.length);
    this._currentIndex = -1;
  }

  private isLegalIndex(index: number): boolean {
    return index >= 0 && index < this._history.length;
  }

  public canDoAction(action: Image360Action): boolean {
    switch (action) {
      case Image360Action.Forward:
        return this.isLegalIndex(this._currentIndex + 1);
      case Image360Action.Backward:
        return this.isLegalIndex(this._currentIndex - 1);
      case Image360Action.Enter:
        return this.isLegalIndex(this._currentIndex);
      default:
        return false;
    }
  }

  public doAction(action: Image360Action): Image360 | undefined {
    let currentIndex = this._currentIndex;
    switch (action) {
      case Image360Action.Forward:
        currentIndex++;
        break;
      case Image360Action.Backward:
        currentIndex--;
        break;
      case Image360Action.Enter:
        break;
      default:
        throw new Error(`Unknown movement ${action}`);
    }
    if (!this.isLegalIndex(currentIndex)) {
      return undefined;
    }
    this._currentIndex = currentIndex;
    return this.current();
  }
}
