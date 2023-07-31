//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import { BaseCommand } from '../Commands/BaseCommand';
import { Polyline } from '../Geometry/Polyline';
import { BaseNode } from '../Nodes/BaseNode';
import { Util } from '../Primitives/Util';

import { TextItem } from './TextItem';

export class ViewInfo {
  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  public footer = '';

  public items: TextItem[] = [];

  public polyline: Polyline | null = null;

  //= =================================================
  // INSTANCE METHODS: Request
  //= =================================================

  public get isEmpty(): boolean {
    if (!Util.isEmpty(this.footer)) return false;

    if (this.items.length > 0) return false;

    return true;
  }

  //= =================================================
  // INSTANCE METHODS: Add operations
  //= =================================================

  // Add header of various types
  public addHeader(header: string) {
    this.items.push(new TextItem(`${header}`, true));
  }

  public addActiveTool(tool: BaseCommand) {
    this.items.push(new TextItem(`${tool.getDisplayName()}`, true));
  }

  public addPickedNode(node: BaseNode) {
    this.items.push(new TextItem(`${node.displayName}:`, true, '', 14));
  }

  // Add text only
  public addText(key: string) {
    this.items.push(new TextItem(key, false));
  }

  // Add key - value pair
  public addValue(key: string, value: string) {
    this.items.push(new TextItem(key, true, value));
  }

  // This was used to add values with TAB spacing in the frond. removed for now.
  public addTabbedValue(key: string, value: string) {
    this.items.push(new TextItem(`${key}`, true, value));
  }

  public addNumber(key: string, value: number, fractionDigits: number) {
    this.addValue(key, value.toFixed(fractionDigits));
  }

  public setPolyline(polyline: Polyline) {
    this.polyline = polyline;
  }

  //= =================================================
  // INSTANCE METHODS: Operations
  //= =================================================

  public clear(): void {
    this.items.splice(0, this.items.length);
    this.polyline = null;
  }
}
