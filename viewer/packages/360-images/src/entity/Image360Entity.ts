/*!
 * Copyright 2022 Cognite AS
 */

import { SceneHandler } from '@reveal/utilities';
import { Image360FileProvider } from '@reveal/data-providers';
import { Image360Icon } from '../icons/Image360Icon';
import { Image360 } from './Image360';
import { Historical360ImageSet } from '@reveal/data-providers/src/types';
import { Image360RevisionEntity } from './Image360RevisionEntity';
import minBy from 'lodash/minBy';
import { Image360VisualizationBox } from './Image360VisualizationBox';

export class Image360Entity implements Image360 {
  private readonly _image360Icon: Image360Icon;
  private readonly _revisions: Image360RevisionEntity[];
  private readonly _transform: THREE.Matrix4;
  private readonly _image360VisualzationBox: Image360VisualizationBox;
  private _activeRevision: Image360RevisionEntity;
  private readonly _reloadImage: (entity: Image360Entity, revision: Image360RevisionEntity) => Promise<void>;

  /**
   * Get a copy of the model-to-world transformation matrix
   * of the given 360 image.
   * @returns model-to-world transform of the 360 Image
   */
  get transform(): THREE.Matrix4 {
    return this._transform.clone();
  }

  /**
   * The object containing the unit cube with the 360 images.
   * @returns Image360Visualization
   */
  get image360Visualization(): Image360VisualizationBox {
    return this._image360VisualzationBox;
  }

  /**
   * Get the icon that represents the 360
   * image during normal visualization.
   * @returns Image360Icon
   */
  get icon(): Image360Icon {
    return this._image360Icon;
  }

  constructor(
    image360Metadata: Historical360ImageSet,
    sceneHandler: SceneHandler,
    imageProvider: Image360FileProvider,
    transform: THREE.Matrix4,
    icon: Image360Icon,
    reloadImage: (entity: Image360Entity, revision: Image360RevisionEntity) => Promise<void>
  ) {
    this._transform = transform;
    this._image360Icon = icon;
    this._reloadImage = reloadImage;

    this._image360VisualzationBox = new Image360VisualizationBox(this._transform, sceneHandler);
    this._image360VisualzationBox.visible = false;

    this._revisions = image360Metadata.imageRevisions.map(
      descriptor => new Image360RevisionEntity(imageProvider, descriptor, this._image360VisualzationBox)
    );
    this._activeRevision = this.getMostRecentRevision();
  }

  /**
   * List all available revisions.
   */
  public list360ImageRevisions(): Image360RevisionEntity[] {
    return this._revisions;
  }

  /**
   * Will reload the entity with images from the new revision.
   * Resolves once loading is complete. Rejects if revision could not be changed.
   * If the entity is not entered/visible the promise will be resolved instantly.
   *
   * @param revision The revision to load
   * @returns Promise for when revision has either been updated or it failed to change.
   */
  public changeRevision(revision: Image360RevisionEntity): Promise<void> {
    return this._reloadImage(this, revision);
  }

  /**
   * Get the revision that is currently loaded for this entry.
   * @returns Returns the active revision.
   */
  public getActiveRevision(): Image360RevisionEntity {
    return this._activeRevision;
  }

  public setActiveRevision(revision: Image360RevisionEntity): void {
    this._activeRevision = revision;
    this._activeRevision.applyTextures();
  }

  public getMostRecentRevision(): Image360RevisionEntity {
    return this._revisions[0];
  }

  /**
   * Get the revision closest to the provided date.
   * If all revisions are undated the first available revison is returned.
   */
  public getRevisionClosestToDate(date: Date): Image360RevisionEntity {
    const dateAsNumber = date.getTime();
    const datedRevisions = this._revisions.filter(revision => revision.date !== undefined);
    const closestDatedRevision = minBy(datedRevisions, revision => Math.abs(revision.date!.getTime() - dateAsNumber));
    return closestDatedRevision ?? this.getMostRecentRevision();
  }

  /**
   * Drops the GPU resources for the 360 image
   */
  public unloadImage(): void {
    this._image360VisualzationBox.unloadImage();
  }

  /**
   * @obvious
   */
  public dispose(): void {
    this.unloadImage();
    this._revisions.forEach(revision => revision.clearTextures());
    this._image360Icon.dispose();
  }
}
