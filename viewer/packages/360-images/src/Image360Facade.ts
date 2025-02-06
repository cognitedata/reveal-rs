/*!
 * Copyright 2022 Cognite AS
 */
import { Camera, Matrix4, Ray, Raycaster, Vector2, Vector3 } from 'three';
import pull from 'lodash/pull';

import { Image360Entity } from './entity/Image360Entity';
import { Image360LoadingCache } from './cache/Image360LoadingCache';
import { Image360CollectionFactory } from './collection/Image360CollectionFactory';
import { DefaultImage360Collection } from './collection/DefaultImage360Collection';
import { IconCullingScheme } from './icons/IconCollection';
import { Image360RevisionEntity } from './entity/Image360RevisionEntity';
import { Image360AnnotationFilterOptions } from './annotation/types';
import { AsyncSequencer } from '@reveal/utilities/src/AsyncSequencer';
import { DataSourceType } from '@reveal/data-providers';
import { Image360IconIntersectionData } from './types';
import { ClosestGeometryFinder } from '@reveal/utilities';

export class Image360Facade<T extends DataSourceType> {
  private readonly _image360Collections: DefaultImage360Collection<T>[];
  private readonly _rayCaster: Raycaster;
  private readonly _image360Cache: Image360LoadingCache<T>;

  private readonly _loadSequencer = new AsyncSequencer();

  get collections(): DefaultImage360Collection<T>[] {
    return this._image360Collections;
  }

  set allIconsVisibility(visible: boolean) {
    this._image360Collections.forEach(collection => collection.setIconsVisibility(visible));
  }

  set allIconsSelected(visible: boolean) {
    this._image360Collections.forEach(collection => collection.setSelectedForAll(visible));
  }

  setHoverIconVisibilityForEntity(entity: Image360Entity<T>, visible: boolean): void {
    this.getCollectionContainingEntity(entity).setSelectedVisibility(visible);
  }

  hideAllHoverIcons(): boolean {
    return this._image360Collections.reduce((changed, collection) => {
      return collection.setSelectedVisibility(false) || changed;
    }, false);
  }

  set allIconCullingScheme(scheme: IconCullingScheme) {
    this._image360Collections.forEach(collection => collection.setCullingScheme(scheme));
  }

  constructor(private readonly _entityFactory: Image360CollectionFactory) {
    this._image360Collections = [];
    this._rayCaster = new Raycaster();
    this._image360Cache = new Image360LoadingCache();
  }

  public async create<Image360CollectionSourceType extends DataSourceType>(
    collectionIdentifier: Image360CollectionSourceType['image360Identifier'],
    annotationFilter: Image360AnnotationFilterOptions = {},
    postTransform = new Matrix4(),
    preComputedRotation = true
  ): Promise<DefaultImage360Collection<T>> {
    const sequencer = this._loadSequencer.getNextSequencer();

    try {
      const image360Collection = await this._entityFactory.create<T>(
        collectionIdentifier,
        postTransform,
        preComputedRotation,
        annotationFilter
      );
      await sequencer(() => {
        this._image360Collections.push(image360Collection);
      });
      return image360Collection;
    } catch (e) {
      await sequencer(() => {});
      throw new Error('Failed to create Image360Collection');
    }
  }

  public removeSet(collection: DefaultImage360Collection<T>): void {
    pull(this._image360Collections, collection);
    collection.dispose();
  }

  public async delete(entity: Image360Entity<T>): Promise<void> {
    await this._image360Cache.purge(entity);
    const collection = this.getCollectionContainingEntity(entity);
    collection.remove(entity);
    if (collection.image360Entities.length === 0) {
      collection.dispose();
      pull(this._image360Collections, collection);
    }
  }

  public preload(
    entity: Image360Entity<T>,
    revision: Image360RevisionEntity<T>,
    lockDownload?: boolean
  ): Promise<void> {
    const annotationPromise = revision.getAnnotations();
    const cacheLoadPromise = this._image360Cache.cachedPreload(entity, revision, lockDownload);

    return awaitPromises();

    async function awaitPromises(): Promise<void> {
      await Promise.all([annotationPromise, cacheLoadPromise]);
    }
  }

  public getCollectionContainingEntity(entity: Image360Entity<T>): DefaultImage360Collection<T> {
    const imageCollection = this._image360Collections.filter(collection =>
      collection.image360Entities.includes(entity)
    );
    if (imageCollection.length !== 1) {
      throw new Error(
        `Failed to get Collection for Image360Entity. The entity is present in ${imageCollection.length} collections.`
      );
    }
    return imageCollection[0];
  }

  public intersect(coords: Vector2, camera: Camera): Image360IconIntersectionData<T> | undefined {
    const modelMatrix = new Matrix4();
    const invModelMatrix = new Matrix4();
    const intersection = new Vector3();
    const closestFinder = new ClosestGeometryFinder<Image360IconIntersectionData<T>>(camera.position);

    for (const collection of this._image360Collections) {
      collection.getModelTransformation(modelMatrix);
      invModelMatrix.copy(modelMatrix).invert();
      // Create a ray in in model coordinates to do intersection on
      const modelRay = getTransformedRay(this._rayCaster, coords, camera, invModelMatrix);
      for (const entity of collection.image360Entities) {
        if (!hasVisibleIcon(entity)) {
          continue;
        }
        if (!entity.icon.intersect(modelRay)) {
          continue;
        }
        // The intersection is in model coordinates
        intersection.setFromMatrixPosition(entity.transform);
        if (!isInRayDirection(intersection, modelRay)) {
          continue;
        }
        // Now transform the intersection to viewer coordinates
        intersection.applyMatrix4(modelMatrix);
        closestFinder.addLazy(intersection, () => {
          return {
            image360: entity,
            image360Collection: collection,
            point: intersection.clone(),
            distanceToCamera: closestFinder.minDistance
          };
        });
      }
    }
    return closestFinder.getClosestGeometry();

    function getTransformedRay(rayCaster: Raycaster, coords: Vector2, camera: Camera, matrix: Matrix4): Ray {
      rayCaster.setFromCamera(coords, camera);
      rayCaster.ray.applyMatrix4(matrix);
      return rayCaster.ray;
    }

    function isInRayDirection(position: Vector3, ray: Ray): boolean {
      const direction = new Vector3().subVectors(position, camera.position);
      return direction.dot(ray.direction) > 0 && direction.lengthSq() > 0.00001;
    }

    function hasVisibleIcon(entity: Image360Entity<T>) {
      return entity.icon.getVisible() && !entity.image360Visualization.visible;
    }
  }

  public dispose(): void {
    this._image360Collections.forEach(imageCollection => imageCollection.dispose());
    this._image360Collections.splice(0);
  }
}
