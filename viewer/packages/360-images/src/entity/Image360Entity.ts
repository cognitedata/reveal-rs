/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { SceneHandler } from '@reveal/utilities';
import { Image360Descriptor, Image360FileProvider, Image360Texture } from '@reveal/data-providers';
import { Image360Icon } from '../icons/Image360Icon';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import { Image360 } from './Image360';

export class Image360Entity implements Image360 {
  private readonly _imageProvider: Image360FileProvider;
  private readonly _image360Metadata: Image360Descriptor;
  private readonly _transform: THREE.Matrix4;
  private readonly _image360Icon: Image360Icon;
  private readonly _image360VisualzationBox: Image360VisualizationBox;
  private _getFullResolutionTextures: undefined | Promise<Image360Texture[] | undefined>;

  /**
   * Get a copy of the model-to-world transformation matrix
   * of the given 360 image.
   * @returns model-to-world transform of the 360 Image
   */
  get transform(): THREE.Matrix4 {
    return this._transform.clone();
  }

  /**
   * Get the icon that represents the 360
   * image during normal visualization.
   * @returns Image360Icon
   */
  get icon(): Image360Icon {
    return this._image360Icon;
  }

  /**
   * The object containing the unit cube with the 360 images.
   * @returns Image360Visualization
   */
  get image360Visualization(): Image360VisualizationBox {
    return this._image360VisualzationBox;
  }

  constructor(
    image360Metadata: Image360Descriptor,
    sceneHandler: SceneHandler,
    imageProvider: Image360FileProvider,
    transform: THREE.Matrix4,
    icon: Image360Icon
  ) {
    this._imageProvider = imageProvider;
    this._image360Metadata = image360Metadata;

    this._transform = transform;
    this._image360Icon = icon;
    this._image360VisualzationBox = new Image360VisualizationBox(this._transform, sceneHandler);
    this._image360VisualzationBox.visible = false;
    this._getFullResolutionTextures = undefined;
  }

  /**
   * Loads the 360 image (6 faces) into the visualization object.
   *
   * This will start the download of both low and full resolution images, and return once the first of these are completed.
   * If the low resolution images are completed first, full resolution download and texture loading will continue in the background
   * and applyFullResolution can be used to apply full resolution textures at a desired time.
   */
  public async load360Image(abortSignal?: AbortSignal): Promise<{ allCompleted: Promise<void> }> {
    const lowResolutionFaces = this._imageProvider
      .getLowResolution360ImageFiles(this._image360Metadata.faceDescriptors, abortSignal)
      .then(faces => {
        return { faces, isLowResolution: true };
      });

    const fullResolutionFaces = this._imageProvider
      .get360ImageFiles(this._image360Metadata.faceDescriptors, abortSignal)
      .then(faces => {
        return { faces, isLowResolution: false };
      });

    const { faces, isLowResolution } = await Promise.any([lowResolutionFaces, fullResolutionFaces]);
    await this._image360VisualzationBox.loadImages(faces);

    if (isLowResolution) {
      this._getFullResolutionTextures = fullResolutionFaces
        .catch(() => {
          return undefined;
        })
        .then(result => {
          if (result) return this._image360VisualzationBox.loadFaceTextures(result.faces);
        });
    }

    return {
      allCompleted: Promise.allSettled([lowResolutionFaces, fullResolutionFaces]).then(() => {})
    };
  }

  /**
   * Apply full resolution textures to the image360VisualzationBox. This has no effect if full resolution has already been applied.
   */
  public async applyFullResolution(): Promise<void> {
    if (this._getFullResolutionTextures) {
      const textures = await this._getFullResolutionTextures;
      if (textures) {
        this._image360VisualzationBox.updateFaceMaterials(textures);
        this._getFullResolutionTextures = undefined;
      }
    }
  }

  /**
   * Drops the GPU resources for the 360 image
   * the icon will be preserved.
   */
  public unload360Image(): void {
    this._image360VisualzationBox.unloadImages();
  }

  /**
   * @obvious
   */
  public dispose(): void {
    this.unload360Image();
    this._image360Icon.dispose();
  }
}
