/*!
 * Copyright 2023 Cognite AS
 */

import { assertNever, EventTrigger } from '@reveal/utilities';
import pull from 'lodash/pull';
import cloneDeep from 'lodash/cloneDeep';
import {
  AssetAnnotationImage360Info,
  Image360AnnotationAssetFilter,
  Image360AnnotationAssetQueryResult,
  Image360Collection
} from './Image360Collection';
import { Image360Entity } from '../entity/Image360Entity';
import { Image360EnteredDelegate, Image360ExitedDelegate } from '../types';
import { IconCollection, IconCullingScheme } from '../icons/IconCollection';
import { Image360AnnotationAppearance } from '../annotation/types';

import {
  ClassicDataSourceType,
  DataSourceType,
  DMDataSourceType,
  Image360FileDescriptor,
  Image360Provider
} from '@reveal/data-providers';
import { Image360AnnotationFilter } from '../annotation/Image360AnnotationFilter';
import { Matrix4 } from 'three';
import { DEFAULT_IMAGE_360_OPACITY } from '../entity/Image360VisualizationBox';
import { Image360AnnotationProvider, InstanceReference } from '@reveal/data-providers/src/types';
import { createCollectionIdString } from './createCollectionIdString';
import { getInstanceIdFromAnnotation } from '../annotation/getInstanceId';

type Image360Events = 'image360Entered' | 'image360Exited';

/**
 * Default implementation of {@link Image360Collection}. Used for events when entering
 * and exiting 360 image mode
 */
export class DefaultImage360Collection<T extends DataSourceType> implements Image360Collection<T> {
  /**
   * A list containing all the 360 images in this set.
   */
  readonly image360Entities: Image360Entity<T>[];

  /**
   * If defined, any subsequently entered 360 images will load the revision that are closest to the target date.
   * If undefined, the most recent revision will be loaded.
   */
  private _targetRevisionDate: Date | undefined;

  private _needsRedraw: boolean = false;

  private _defaultStyle: Image360AnnotationAppearance = {};

  private readonly _image360DataProvider: Image360AnnotationProvider<T>;
  private readonly _annotationFilter: Image360AnnotationFilter;

  private readonly _events = {
    image360Entered: new EventTrigger<Image360EnteredDelegate<T>>(),
    image360Exited: new EventTrigger<Image360ExitedDelegate>()
  };
  private readonly _icons: IconCollection;
  private _isCollectionVisible: boolean;
  private readonly _collectionId: T['image360Identifier'];
  private readonly _collectionLabel: string | undefined;
  private readonly _setNeedsRedraw: () => void;

  get collectionId(): T['image360Identifier'] {
    return this._collectionId;
  }

  /**
   * @deprecated
   */
  get id(): string {
    return createCollectionIdString(this._collectionId);
  }

  get label(): string | undefined {
    return this._collectionLabel;
  }

  get targetRevisionDate(): Date | undefined {
    return this._targetRevisionDate;
  }

  set targetRevisionDate(date: Date | undefined) {
    this._targetRevisionDate = date;
  }

  /**
   * The events from the image collection.
   */
  get events(): {
    image360Entered: EventTrigger<Image360EnteredDelegate<T>>;
    image360Exited: EventTrigger<Image360ExitedDelegate>;
  } {
    return this._events;
  }

  get isCollectionVisible(): boolean {
    return this._isCollectionVisible;
  }

  constructor(
    identifier: T['image360Identifier'],
    collectionLabel: string | undefined,
    entities: Image360Entity<T>[],
    icons: IconCollection,
    annotationFilter: Image360AnnotationFilter,
    image360DataProvider: Image360Provider<T>,
    setNeedsRedraw: () => void
  ) {
    this._collectionId = identifier;
    this._collectionLabel = collectionLabel;
    this.image360Entities = entities;
    this._icons = icons;
    this._isCollectionVisible = true;
    this._annotationFilter = annotationFilter;
    this._image360DataProvider = image360DataProvider;
    this._setNeedsRedraw = setNeedsRedraw;
  }

  public getModelTransformation(out?: Matrix4): Matrix4 {
    return this._icons.getTransform(out);
  }

  public setModelTransformation(matrix: Matrix4): void {
    this._icons.setTransform(matrix);
    this.image360Entities.forEach(entity => entity.setWorldTransform(matrix));
    this._setNeedsRedraw();
  }
  /**
   * Subscribes to events on 360 Image datasets. There are several event types:
   * 'image360Entered' - Subscribes to a event for entering 360 image mode.
   * 'image360Exited' - Subscribes to events indicating 360 image mode has exited.
   * @param event The event type.
   * @param callback Callback to be called when the event is fired.
   */
  public on(event: 'image360Entered', callback: Image360EnteredDelegate<T>): void;
  public on(event: 'image360Exited', callback: Image360ExitedDelegate): void;
  /**
   * Subscribe to the 360 Image events
   * @param event `Image360Events` event
   * @param callback Callback to 360 image events
   */
  public on(event: Image360Events, callback: Image360EnteredDelegate<T>): void {
    switch (event) {
      case 'image360Entered':
        this._events.image360Entered.subscribe(callback as Image360EnteredDelegate<T>);
        break;
      case 'image360Exited':
        this._events.image360Exited.subscribe(callback as Image360ExitedDelegate);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  /**
   * Specify parameters used to determine the number of icons that are visible when entering 360 Images.
   * @param radius Only icons within the given radius will be made visible.
   * @param pointLimit Limit the number of points within the given radius. Points closer to the camera will be prioritized.
   */
  public set360IconCullingRestrictions(radius: number, pointLimit: number): void {
    this._icons.set360IconCullingRestrictions(radius, pointLimit);
  }

  getIconsVisibility(): boolean {
    return this._isCollectionVisible;
  }

  public setIconsVisibility(value: boolean): void {
    this._isCollectionVisible = value;
    this.image360Entities.forEach(entity => entity.icon.setVisible(value));
    this._needsRedraw = true;
  }

  public isOccludedIconsVisible(): boolean {
    return this._icons.isOccludedVisible();
  }

  public setOccludedIconsVisible(value: boolean): void {
    this._icons.setOccludedVisible(value);
    this._needsRedraw = true;
  }

  public getIconsOpacity(): number {
    return this._icons.getOpacity();
  }

  public setIconsOpacity(value: number): void {
    this._icons.setOpacity(value);
    this._needsRedraw = true;
  }

  public getImagesOpacity(): number {
    for (const entity of this.image360Entities) {
      return entity.image360Visualization.opacity;
    }
    return DEFAULT_IMAGE_360_OPACITY;
  }

  public setImagesOpacity(value: number): void {
    for (const entity of this.image360Entities) {
      entity.image360Visualization.opacity = value;
    }
    this._needsRedraw = true;
  }

  /**
   * Unsubscribes from 360 image dataset event.
   * @param event The event type.
   * @param callback Callback function to be unsubscribed.
   */
  public off(event: 'image360Entered', callback: Image360EnteredDelegate<T>): void;
  public off(event: 'image360Exited', callback: Image360ExitedDelegate): void;

  /**
   * Unsubscribe to the 360 Image events
   * @param event `Image360Events` event
   * @param callback Callback to 360 image events
   */
  public off(event: Image360Events, callback: Image360EnteredDelegate<T> | Image360ExitedDelegate): void {
    switch (event) {
      case 'image360Entered':
        this._events.image360Entered.unsubscribe(callback as Image360EnteredDelegate<T>);
        break;
      case 'image360Exited':
        this._events.image360Exited.unsubscribe(callback as Image360ExitedDelegate);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  public setSelectedForAll(selected: boolean): void {
    this.image360Entities.forEach(entity => (entity.icon.selected = selected));
  }

  public setSelectedVisibility(visible: boolean): boolean {
    if (this._icons.hoverSpriteVisibility == visible) {
      return false;
    }
    this._icons.hoverSpriteVisibility = visible;
    return true;
  }

  public setCullingScheme(scheme: IconCullingScheme): void {
    this._icons.setCullingScheme(scheme);
  }

  public remove(entity: Image360Entity<T>): void {
    pull(this.image360Entities, entity);
    entity.dispose();
  }

  public dispose(): void {
    this.image360Entities.forEach(image360Entity => image360Entity.dispose());
    this.image360Entities.splice(0);
    this._icons.dispose();
    this._events.image360Entered.unsubscribeAll();
    this._events.image360Exited.unsubscribeAll();
  }

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }

  getDefaultAnnotationStyle(): Image360AnnotationAppearance {
    return cloneDeep(this._defaultStyle);
  }

  public setDefaultAnnotationStyle(defaultStyle: Image360AnnotationAppearance): void {
    this._defaultStyle = defaultStyle;
    this.image360Entities.forEach(entity =>
      entity.getRevisions().forEach(revision => revision.setDefaultAppearance(defaultStyle))
    );
  }

  findImageAnnotations(filter: Image360AnnotationAssetFilter<T>): Promise<Image360AnnotationAssetQueryResult<T>[]> {
    return this._image360DataProvider.findImageAnnotationsForInstance(filter.assetRef, this);
  }

  async getAssetIds(): Promise<InstanceReference<T>[]> {
    const annotations = await this._image360DataProvider.getAllImage360AnnotationInfos('all', this, annotation =>
      this._annotationFilter.filter(annotation)
    );

    return annotations
      .map(annotationInfo => getInstanceIdFromAnnotation<T>(annotationInfo.annotationInfo))
      .filter(result => result !== undefined);
  }

  getAnnotationsInfo(source: 'assets'): Promise<AssetAnnotationImage360Info<ClassicDataSourceType>[]>;
  getAnnotationsInfo(source: 'cdm'): Promise<AssetAnnotationImage360Info<DMDataSourceType>[]>;
  getAnnotationsInfo(source: 'all'): Promise<AssetAnnotationImage360Info<DataSourceType>[]>;
  async getAnnotationsInfo(
    source: 'assets' | 'cdm' | 'all'
  ): Promise<
    | AssetAnnotationImage360Info<ClassicDataSourceType>[]
    | AssetAnnotationImage360Info<DMDataSourceType>[]
    | AssetAnnotationImage360Info<DataSourceType>[]
  > {
    return await this._image360DataProvider.getAllImage360AnnotationInfos(source, this, annotation =>
      this._annotationFilter.filter(annotation)
    );
  }

  public getAllFileDescriptors(): Image360FileDescriptor[] {
    return this.image360Entities
      .map(entity =>
        entity
          .getRevisions()
          .map(revision => revision.getDescriptors().faceDescriptors)
          .flat()
      )
      .flat();
  }
}
