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

import * as Color from 'color';

import { UniqueId } from 'Core/Primitives/UniqueId';
import { Identifiable } from 'Core/Primitives/Identifiable';
import { TargetId } from 'Core/Primitives/TargetId';
import { Class, isInstanceOf } from 'Core/Primitives/ClassT';
import { RenderStyleResolution } from 'Core/Enums/RenderStyleResolution';
import { NodeEventArgs } from 'Core/Views/NodeEventArgs';
import { ITargetIdAccessor } from 'Core/Interfaces/ITargetIdAccessor';
import { BaseRenderStyle } from 'Core/Styles/BaseRenderStyle';
import { ColorType } from 'Core/Enums/ColorType';
import { Colors } from 'Core/Primitives/Colors';
import { Changes } from 'Core/Views/Changes';
import { CheckBoxState } from 'Core/Enums/CheckBoxState';
import { ITarget } from 'Core/Interfaces/ITarget';
import { Util } from 'Core/Primitives/Util';
import { VirtualUserInterface } from 'Core/States/VirtualUserInterface';
import { FileType } from 'Core/Enums/FileType';
import { Range3 } from 'Core/Geometry/Range3';
import { ColorTypeProperty } from 'Core/Property/Concrete/Property/ColorTypeProperty';
import { ValueProperty } from 'Core/Property/Base/ValueProperty';
import { BasePropertyFolder } from 'Core/Property/Base/BasePropertyFolder';
import { ColorMaps } from 'Core/Primitives/ColorMaps';
import { BaseCommand } from 'Core/Commands/BaseCommand';
import { ResetVisualSettingsCommand } from 'Core/Commands/SettingsPanel/ResetVisualSettingsCommand';
import { CopyFolderVisualSettingsCommand } from 'Core/Commands/SettingsPanel/CopyFolderVisualSettingsCommand';
import { CopySystemVisualSettingsCommand } from 'Core/Commands/SettingsPanel/CopySystemVisualSettingsCommand';

export abstract class BaseNode extends Identifiable {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'BaseNode';

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  protected constructor() {
    super();
  }

  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  private _color: Color | undefined = undefined;

  private _colorMap = ColorMaps.rainbowName;

  private _name: string | undefined = undefined;

  private _isExpanded = false;

  private _isActive: boolean = false;

  private _isSelected: boolean = false;

  private _isInitialized: boolean = false;

  private _uniqueId: UniqueId = UniqueId.new();

  private _children: BaseNode[] = [];

  private _parent: BaseNode | null = null;

  private _renderStyles: BaseRenderStyle[] = [];

  private _isLoading: boolean = false;

  private _loadingError?: string;

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get name(): string {
    return this.getName();
  }

  public set name(value: string) {
    this.setName(value);
  }

  public get color(): Color {
    return this.getColor();
  }

  public set color(value: Color) {
    this.setColor(value);
  }

  public get colorMap(): string {
    return this._colorMap;
  }

  public set colorMap(value: string) {
    this._colorMap = value;
  }

  public get uniqueId(): UniqueId {
    return this._uniqueId;
  }

  public get renderStyles(): BaseRenderStyle[] {
    return this._renderStyles;
  }

  public get path(): string {
    return `${this.parent ? this.parent.path : ''}\\${this.name}`;
  }

  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  public get activeTarget(): ITarget | null {
    return this.activeTargetIdAccessor as ITarget;
  }

  public get isLoading(): boolean {
    return this._isLoading;
  }

  public set isLoading(value: boolean) {
    this._isLoading = value;
  }

  public get loadingError(): string | undefined {
    return this._loadingError;
  }

  public set loadingError(error: string | undefined) {
    this._loadingError = error;
  }

  // This is the text shown in the tree control
  public get displayName(): string {
    const nameExtension = this.getNameExtension();
    if (Util.isEmpty(nameExtension)) return this.name;
    return `${this.name} [${nameExtension}]`;
  }

  //= =================================================
  // OVERRIDES of Identifiable
  //= =================================================

  public get /* override */ className(): string {
    return BaseNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return className === BaseNode.className || super.isA(className);
  }

  public /* override */ toString(): string {
    return this.getDebugString();
  }

  //= =================================================
  // VIRTUAL METHODS: Name
  //= =================================================

  public abstract get typeName(): string;

  public /* virtual */ setName(value: string) {
    this._name = value;
  }

  public /* virtual */ getName(): string {
    if (this._name === undefined) this._name = this.generateNewName();
    return this._name;
  }

  public /* virtual */ canChangeName(): boolean {
    return true;
  }

  public /* virtual */ getNameExtension(): string | null {
    return null;
  }

  //= =================================================
  // VIRTUAL METHODS: Label
  //= =================================================

  public /* virtual */ isVisibleInTreeControl(): boolean {
    return true;
  } // If false, the icon and it children is not shown in the tree control

  public /* virtual */ getLabelColor(): Color {
    return Colors.black;
  }

  public /* virtual */ isLabelInBold(): boolean {
    return this.isActive;
  } // true shows the label in bold font

  public /* virtual */ isLabelInItalic(): boolean {
    return !this.canBeDeleted();
  } // true shows the label in italic font

  //= =================================================
  // VIRTUAL METHODS: Tabs
  //= =================================================

  public get /* virtual */ isTab(): boolean {
    return false;
  }

  //= =================================================
  // VIRTUAL METHODS: Color
  //= =================================================

  public /* virtual */ getColor(): Color {
    if (this._color === undefined) this._color = this.generateNewColor();
    return this._color;
  }

  public /* virtual */ setColor(value: Color) {
    this._color = value;
  }

  public /* virtual */ canChangeColor(): boolean {
    return true;
  }

  public /* virtual */ hasIconColor(): boolean {
    return this.canChangeColor();
  }

  public /* virtual */ hasColorMap(): boolean {
    return false;
  }

  //= =================================================
  // VIRTUAL METHODS: Icon
  //= =================================================

  public /* virtual */ getIcon(): string {
    return this.typeName + FileType.Png;
  }

  //= =================================================
  // VIRTUAL METHODS: Bounding box
  //= =================================================

  public get /* virtual */ boundingBox(): Range3 {
    const range = new Range3();
    for (const child of this.children) range.addRange(child.boundingBox);
    return range;
  }

  //= =================================================
  // VIRTUAL METHODS: Active / Selected
  //= =================================================

  public get /* virtual */ isActive(): boolean {
    return this._isActive;
  }

  public set /* virtual */ isActive(value: boolean) {
    this._isActive = value;
  }

  public /* virtual */ canBeActive(): boolean {
    return false;
  }

  public /* virtual */ canBeSelected(): boolean {
    return true;
  }

  //= =================================================
  // VIRTUAL METHODS: Appearance in the explorer
  //= =================================================

  public /* virtual */ canBeDeleted(): boolean {
    return true;
  }

  public /* virtual */ canBeChecked(_: ITarget | null): boolean {
    return true;
  }

  public /* virtual */ isFilter(_: ITarget | null): boolean {
    return false;
  }

  public /* virtual */ isRadio(_: ITarget | null): boolean {
    return false;
  }

  public /* virtual */ isTree(): boolean {
    return false;
  }

  //= =================================================
  // VIRTUAL METHODS: Visibility
  //= =================================================

  public /* virtual */ getCheckBoxEnabled(_?: ITarget | null): boolean {
    return true;
  }

  public /* virtual */ getCheckBoxState(
    target?: ITarget | null
  ): CheckBoxState {
    if (!target)
      // eslint-disable-next-line no-param-reassign
      target = this.activeTarget;

    if (!target) return CheckBoxState.Never;

    let numCandidates = 0;
    let numAll = 0;
    let numNone = 0;

    for (const child of this.children) {
      const childState = child.getCheckBoxState(target);
      if (childState === CheckBoxState.Never) continue;

      numCandidates += 1;
      if (childState === CheckBoxState.All) numAll += 1;
      else if (
        childState === CheckBoxState.None ||
        childState === CheckBoxState.CanNotBeChecked
      )
        numNone += 1;

      // Optimization, not tested
      if (numNone < numCandidates && numCandidates < numAll)
        return CheckBoxState.Some;
    }
    if (numCandidates === 0) return CheckBoxState.Never;
    if (numCandidates === numAll) return CheckBoxState.All;
    if (numCandidates === numNone)
      return this.canBeChecked(target)
        ? CheckBoxState.None
        : CheckBoxState.CanNotBeChecked;
    return CheckBoxState.Some;
  }

  public /* virtual */ setVisibleInteractive(
    visible: boolean,
    target?: ITarget | null,
    topLevel = true
  ): boolean {
    if (!target)
      // eslint-disable-next-line no-param-reassign
      target = this.activeTarget;
    if (!target) return false;
    const checkBoxState = this.getCheckBoxState(target);
    if (checkBoxState === CheckBoxState.Never) return false;
    if (checkBoxState === CheckBoxState.None && !this.canBeChecked(target))
      return false;

    let hasChanged = false;
    for (const child of this.children)
      if (child.setVisibleInteractive(visible, target, false))
        hasChanged = true;

    if (!hasChanged) return false;

    if (topLevel) this.notifyVisibleStateChange();
    return true;
  }

  protected notifyVisibleStateChange(): void {
    const args = new NodeEventArgs(Changes.visibleState);
    this.notify(args);
    for (const ancestor of this.getAncestorsExceptRoot()) ancestor.notify(args);
    for (const descendant of this.getDescendants()) descendant.notify(args);
  }

  // Use this when clicking on the checkbox in the three control
  public toggleVisibleInteractive(target?: ITarget | null): void {
    const checkBoxState = this.getCheckBoxState(target);
    if (checkBoxState === CheckBoxState.None)
      this.setVisibleInteractive(true, target);
    else if (
      checkBoxState === CheckBoxState.Some ||
      checkBoxState === CheckBoxState.All
    )
      this.setVisibleInteractive(false, target);
  }

  //= =================================================
  // VIRTUAL METHODS: Others
  //= =================================================

  protected /* virtual */ initializeCore(): void {}

  protected /* virtual */ notifyCore(_args: NodeEventArgs): void {}

  protected /* virtual */ removeInternalData(): void {}

  protected get /* virtual */ activeTargetIdAccessor(): ITargetIdAccessor | null {
    const { root } = this;
    return root ? root.activeTargetIdAccessor : null;
  }

  //= =================================================
  // VIRTUAL METHODS: Render styles
  //= =================================================

  public get /* virtual */ renderStyleResolution(): RenderStyleResolution {
    return RenderStyleResolution.Unique;
  }

  public get /* virtual */ renderStyleRoot(): BaseNode | null {
    return null;
  }

  public /* virtual */ createRenderStyle(
    _targetId: TargetId
  ): BaseRenderStyle | null {
    return null;
  }

  public /* virtual */ verifyRenderStyle(_style: BaseRenderStyle) {
    /* overide when validating the render style */
  }

  public /* virtual */ supportsColorType(
    _colorType: ColorType,
    _solid: boolean
  ): boolean {
    return true;
  }

  //= =================================================
  // VIRTUAL METHODS: Populate Settings
  //= =================================================

  protected /* virtual */ populateInfoCore(folder: BasePropertyFolder): void {
    folder.addString({
      name: 'name',
      instance: this,
      readonly: !this.canChangeName(),
      applyDelegate: (_name: string) => this.notifyNameChanged(),
    });
    if (this.canChangeColor())
      folder.addColor({
        name: 'color',
        instance: this,
        applyDelegate: (_name: string) => this.notifyColorChanged(),
      });
    folder.addReadOnlyString('Type', this.typeName);
    if (this.hasColorMap())
      folder.addColorMap({
        name: 'colorMap',
        instance: this,
        readonly: false,
        applyDelegate: (_name: string) => this.notifyColorMapChanged(),
        toolTip: 'Color map is used in visualization, see color type ',
      });
  }

  protected /* virtual */ populateStatisticsCore(
    _folder: BasePropertyFolder
  ): void {}

  //= =================================================
  // INSTANCE METHODS: Populate Settings
  //= =================================================

  public populateInfo(folder: BasePropertyFolder): void {
    this.populateInfoCore(folder);
  }

  public populateStatistics(folder: BasePropertyFolder): void {
    this.populateStatisticsCore(folder);
  }

  public populateRenderStyle(folder: BasePropertyFolder): void {
    const style = this.getRenderStyle();
    if (style) style.populate(folder);

    for (const child of folder.children) {
      if (child instanceof ValueProperty) {
        child.applyDelegate = (name: string) => {
          let node = this.renderStyleRoot;
          if (!node) node = this;
          node.notify(new NodeEventArgs(Changes.renderStyle, name));
        };

        if (child instanceof ColorTypeProperty) {
          child.optionValidationDelegate = (colorType: ColorType) =>
            this.supportsColorType(colorType, child.solid);
          child.nodeColor = this.color;
          child.parentNodeColor = this.parent?.color;
        }
      }
    }
  }

  public createRenderStyleCommands(): BaseCommand[] | null {
    const commands: BaseCommand[] = [];
    commands.push(new ResetVisualSettingsCommand(this));
    const { renderStyleRoot } = this;
    if (!renderStyleRoot || renderStyleRoot === this) {
      commands.push(new CopyFolderVisualSettingsCommand(this));
      commands.push(new CopySystemVisualSettingsCommand(this));
    }
    return commands;
  }

  //= =================================================
  // INSTANCE METHODS: Selected
  //= =================================================

  public isSelected(): boolean {
    return this._isSelected;
  }

  public setSelected(value: boolean) {
    this._isSelected = value;
  }

  public setSelectedInteractive(value: boolean) {
    if (this._isSelected === value) return false;

    if (!this.isVisibleInTreeControl) return false;

    if (value) {
      const treeNode = this.getTreeNode();
      if (treeNode) {
        for (const descendant of treeNode.getDescendants())
          if (descendant.isSelected()) descendant.setSelectedInteractive(false);
      }
    }
    this.setSelected(value);
    this.notify(new NodeEventArgs(Changes.selected));
    return true;
  }

  //= =================================================
  // INSTANCE METHODS: Expand
  //= =================================================

  public get isExpanded(): boolean {
    return this._isExpanded;
  }

  public set isExpanded(value: boolean) {
    this._isExpanded = value;
  }

  // Use this when clicking on the expand marker in the three control
  public toggleExpandInteractive() {
    this.setExpandedInteractive(!this.isExpanded);
  }

  public setExpandedInteractive(value: boolean) {
    if (this.isExpanded === value) return false;

    if (!this.canBeExpanded) return false;

    this.isExpanded = value;
    this.notify(new NodeEventArgs(Changes.expanded));
    return true;
  }

  // if true show expander marker
  public canBeExpanded(): boolean {
    for (const child of this.children) {
      if (child.isVisibleInTreeControl()) return true;
    }
    return false;
  }

  //= =================================================
  // INSTANCE PROPERTIES: Child-Parent relationship
  //= =================================================

  public get children(): BaseNode[] {
    return this._children;
  }

  public get childCount(): number {
    return this._children.length;
  }

  public get childIndex(): number | undefined {
    return !this.parent ? undefined : this.parent.children.indexOf(this);
  }

  public get parent(): BaseNode | null {
    return this._parent;
  }

  public get root(): BaseNode {
    return this.parent != null ? this.parent.root : this;
  }

  public get hasParent(): boolean {
    return this._parent != null;
  }

  //= =================================================
  // INSTANCE METHODS: Getters
  //= =================================================

  public getColorByColorType(
    colorType: ColorType,
    fgColor?: Color | undefined
  ): Color {
    switch (colorType) {
      case ColorType.Specified:
        return this.getColor();
      case ColorType.Parent:
        return this.parent ? this.parent.getColor() : Colors.grey;
      case ColorType.Black:
        return Colors.black;
      case ColorType.White:
        return Colors.white;
      case ColorType.ForeGround:
        return !fgColor ? Colors.white : fgColor;
      default:
        return Colors.white; // Must be white because texture colors are multiplicative
    }
  }

  //= =================================================
  // INSTANCE METHODS: Get a child or children
  //= =================================================

  public hasChildByType<T extends BaseNode>(classType: Class<T>): boolean {
    return this.getChildByType(classType) !== null;
  }

  public getChild(index: number): BaseNode {
    return this._children[index];
  }

  public getChildByName(name: string): BaseNode | null {
    for (const child of this.children) if (child.name === name) return child;
    return null;
  }

  public getChildByUniqueId(uniqueId: UniqueId): BaseNode | null {
    for (const child of this.children)
      if (child.uniqueId.equals(uniqueId)) return child;
    return null;
  }

  public getChildByType<T extends BaseNode>(classType: Class<T>): T | null {
    for (const child of this.children) {
      if (isInstanceOf(child, classType)) return child as T;
    }
    return null;
  }

  public getActiveChildByType<T extends BaseNode>(
    classType: Class<T>
  ): T | null {
    for (const child of this.children) {
      if (child.isActive && isInstanceOf(child, classType)) return child as T;
    }
    return null;
  }

  public *getChildrenByType<T extends BaseNode>(
    classType: Class<T>
  ): Generator<T> {
    for (const child of this.children) {
      if (isInstanceOf(child, classType)) yield child as T;
    }
  }

  //= =================================================
  // INSTANCE METHODS: Get descendants
  //= =================================================

  public *getDescendants(): Generator<BaseNode> {
    for (const child of this.children) {
      yield child;
      for (const descendant of child.getDescendants()) yield descendant;
    }
  }

  public *getThisAndDescendants(): Generator<BaseNode> {
    yield this;
    for (const descendant of this.getDescendants()) yield descendant;
  }

  public *getDescendantsByType<T extends BaseNode>(
    classType: Class<T>
  ): Generator<T> {
    for (const child of this.children) {
      if (isInstanceOf(child, classType)) yield child as T;

      for (const descendant of child.getDescendantsByType<T>(classType)) {
        if (isInstanceOf(descendant, classType)) yield descendant as T;
      }
    }
  }

  public getActiveDescendantByType<T extends BaseNode>(
    classType: Class<T>
  ): T | null {
    for (const child of this.children) {
      if (child.isActive && isInstanceOf(child, classType)) return child as T;

      const descendant = child.getActiveDescendantByType(classType);
      if (descendant) return descendant as T;
    }
    return null;
  }

  public getDescendantByUniqueId(uniqueId: UniqueId): BaseNode | null {
    for (const child of this.children) {
      if (child.uniqueId.equals(uniqueId)) return child;

      const ancestor = child.getDescendantByUniqueId(uniqueId);
      if (ancestor) return ancestor;
    }
    return null;
  }

  //= =================================================
  // INSTANCE METHODS: Get ancestors
  //= =================================================

  public getSelectedNode(): BaseNode | null {
    for (const descendant of this.getThisAndDescendants()) {
      if (descendant.isSelected()) return descendant;
    }
    return null;
  }

  public getTreeNode(): BaseNode | null {
    for (const ancestor of this.getThisAndAncestors()) {
      if (ancestor.isTree()) return ancestor;
    }
    return null;
  }

  public *getThisAndAncestors(): Generator<BaseNode> {
    let ancestor: BaseNode | null = this;
    while (ancestor) {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public *getAncestors(): Generator<BaseNode> {
    let ancestor = this.parent;
    while (ancestor) {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public *getAncestorsExceptRoot(): Generator<BaseNode> {
    let ancestor = this.parent;
    while (ancestor && ancestor.hasParent) {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public getAncestorByType<T>(classType: Class<T>): T | null {
    for (const ancestor of this.getAncestors()) {
      if (isInstanceOf(ancestor, classType)) return ancestor as T;
    }
    return null;
  }

  public getThisOrAncestorByType<T>(classType: Class<T>): T | null {
    for (const ancestor of this.getThisAndAncestors()) {
      if (isInstanceOf(ancestor, classType)) return ancestor as T;
    }
    return null;
  }

  //= =================================================
  // INSTANCE METHODS: Child-Parent relationship
  //= =================================================

  public addChild(child: BaseNode, insertFirst = false): void {
    if (child.hasParent) {
      Error(`The child ${child.typeName} already has a parent`);
      return;
    }
    if (child === this) {
      Error(`Trying to add illegal child ${child.typeName}`);
      return;
    }
    if (insertFirst) this._children.unshift(child);
    else this._children.push(child);
    child._parent = this;
  }

  public remove(): boolean {
    if (!this.parent) {
      Error(`The child ${this.typeName} don't have a parent`);
      return false;
    }
    const { childIndex } = this;
    if (childIndex === undefined) {
      Error(`The child ${this.typeName} is not child of it's parent`);
      return false;
    }
    this.clearChilderen();
    this.removeInternalData();
    this.parent.children.splice(childIndex, 1);
    this._parent = null;
    return true;
  }

  protected clearChilderen(): void {
    const { children } = this;
    if (!children) return;

    for (const child of children) child.clearChilderen();

    for (const child of children) {
      this.removeInternalData();
      child._parent = null;
    }
    children.splice(0, children.length);
  }

  public sortChildrenByName(): void {
    this.children.sort((a, b) => a.name.localeCompare(b.name));
  }

  //= =================================================
  // INSTANCE METHODS: Notifying
  //= =================================================

  public notifyNameChanged(): void {
    this.notify(new NodeEventArgs(Changes.nodeName));
  }

  public notifyColorChanged(): void {
    this.notify(new NodeEventArgs(Changes.nodeColor));
  }

  public notifyColorMapChanged(): void {
    this.notify(new NodeEventArgs(Changes.nodeColorMap));
  }

  public notifyLoadedData(): void {
    this.notify(new NodeEventArgs(Changes.loaded));
  }

  public notifyLoadingError(): void {
    this.notify(new NodeEventArgs(Changes.loadingError));
  }

  public notify(args: NodeEventArgs): void {
    VirtualUserInterface.updateNode(this, args);
    VirtualUserInterface.updateStatusPanel(JSON.stringify(args));
    this.notifyCore(args);
  }

  //= =================================================
  // INSTANCE METHODS: Loading states management
  //= =================================================

  public setLoadingState(isLoading: boolean = true): void {
    this.isLoading = isLoading;
    this.notifyLoadedData();
  }

  public setErrorLoadingState(error?: string): void {
    this.loadingError = error;
    this.notifyLoadingError();
  }

  //= =================================================
  // INSTANCE METHODS: Misc
  //= =================================================

  public initialize(): void {
    if (this._isInitialized) return; // This should be done once
    this.initializeCore();
    this._isInitialized = true;
  }

  public initializeRecursive(): void {
    this.initialize();
    for (const child of this.children) child.initializeRecursive();
  }

  public removeInteractive(): void {
    // To be called when a node is removed
    // It is not finished, because the children it not taken properly care of
    const { parent } = this;
    this.remove();
    parent?.notify(new NodeEventArgs(Changes.childDeleted));
  }

  public setActiveInteractive(): void {
    // To be called when a object should be active
    if (this.isActive) return;

    if (!this.canBeActive()) return;

    if (this.parent) {
      // Turn the others off
      for (const sibling of this.parent.getDescendants()) {
        if (sibling === this) continue;
        if (sibling.className !== this.className) continue;
        if (!sibling.canBeActive()) return;
        if (!sibling.isActive) continue;

        sibling.isActive = false;
        sibling.notify(new NodeEventArgs(Changes.active));
      }
    }
    this.isActive = true;
    this.notify(new NodeEventArgs(Changes.active));
  }

  //= =================================================
  // INSTANCE METHODS: Render styles
  //= =================================================

  public getRenderStyle(targetId?: TargetId): BaseRenderStyle | null {
    const root = this.renderStyleRoot;
    if (root != null && root !== this) return root.getRenderStyle(targetId);

    // Find the targetId if not present
    if (!targetId) {
      const target = this.activeTargetIdAccessor;
      if (target)
        // eslint-disable-next-line no-param-reassign
        targetId = target.targetId;
      else return null;
      if (!targetId) return null;
    }
    // Find the style in the node itself
    let style: BaseRenderStyle | null = null;
    for (const thisStyle of this.renderStyles) {
      if (thisStyle.isDefault) continue;

      if (!thisStyle.targetId.equals(targetId, this.renderStyleResolution))
        continue;

      style = thisStyle;
      break;
    }
    // If still not find and unique, copy one of the existing
    if (!style && this.renderStyleResolution === RenderStyleResolution.Unique) {
      for (const thisStyle of this.renderStyles) {
        if (thisStyle.isDefault) continue;

        if (!thisStyle.targetId.hasSameTypeName(targetId)) continue;

        style = thisStyle.clone() as BaseRenderStyle;
        style.isDefault = false;
        style.targetId.set(targetId, this.renderStyleResolution);
        this.renderStyles.push(style);
        break;
      }
    }
    // If still not found: Create it
    if (!style) {
      style = this.createRenderStyle(targetId);
      if (style) {
        style.targetId.set(targetId, this.renderStyleResolution);
        this.renderStyles.push(style);
      }
    }
    if (style) this.verifyRenderStyle(style);
    return style;
  }

  public replaceRenderStyle(newStyle: BaseRenderStyle | null = null): boolean {
    const target = this.activeTargetIdAccessor;
    if (!target) return false;

    const { targetId } = target;
    if (!targetId) return false;

    // Find the only style
    for (let i = 0; i < this.renderStyles.length; i++) {
      const oldStyle = this.renderStyles[i];
      if (oldStyle.isDefault) continue;

      if (!oldStyle.targetId.equals(targetId, this.renderStyleResolution))
        continue;

      this.renderStyles.splice(i, 1);
      break;
    }
    // Set the new style
    if (!newStyle) {
      // eslint-disable-next-line no-param-reassign
      newStyle = this.createRenderStyle(targetId);
      if (!newStyle) return false;
    }
    newStyle.targetId.set(targetId, this.renderStyleResolution);
    this.renderStyles.push(newStyle);
    return true;
  }

  //= =================================================
  // INSTANCE METHODS: Some helpers
  //= =================================================

  protected generateNewColor(): Color {
    return this.canChangeColor() ? Colors.nextColor : Colors.white;
  }

  protected generateNewName(): string {
    let result = this.typeName;
    if (!this.canChangeName()) return result;

    if (!this.parent) return result;

    let childIndex = 0;
    for (const child of this.parent.children) {
      if (child === this) break;
      if (this.typeName === child.typeName) childIndex += 1;
    }
    result += ` ${childIndex + 1}`;
    return result;
  }

  //= =================================================
  // INSTANCE METHODS: Debugging
  //= =================================================

  public /* virtual */ getDebugString(): string {
    let result = this.name;
    result += Util.cocatinate('typeName', this.typeName);
    result += Util.cocatinate('className', this.className);
    if (this.canChangeColor())
      result += Util.cocatinate('color', this.getColor());
    result += Util.cocatinate(
      'id',
      this.uniqueId.isEmpty
        ? ''
        : `${this.uniqueId.toString().substring(0, 6)}...`
    );
    if (this.isActive) result += Util.cocatinate('active');
    if (this.renderStyles.length > 0)
      result += Util.cocatinate('renderStyles', this.renderStyles.length);
    return result;
  }

  public toHierarcyString(): string {
    let text = '';
    for (const node of this.getThisAndDescendants()) {
      let padding = 0;
      for (const _ of node.getAncestors()) padding += 1;
      const line = `${' '.padStart(padding * 4) + node.toString()}\n`;
      text += line;
    }
    return text;
  }
}
