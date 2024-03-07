import {
  CogniteCadModel,
  CogniteModel,
  CognitePointCloudModel,
  Image360Collection
} from '@cognite/reveal';

export abstract class ModelHandler {
  protected constructor(protected model: CogniteModel | Image360Collection) {}

  public abstract key(): string;
  public abstract visible(): boolean;
  public abstract setVisibility(visible: boolean): void;

  public isSame(handler: ModelHandler): boolean;
  public isSame(handler: ModelHandler): Boolean {
    return handler.model === this.model;
  }
}

export class CadModelHandler extends ModelHandler {
  constructor(private _cadModel: CogniteCadModel) {
    super(_cadModel);
  }

  key(): string {
    return `cad-${this._cadModel.modelId}-${this._cadModel.revisionId}`;
  }

  visible(): boolean {
    return this._cadModel.visible;
  }

  setVisibility(visible: boolean): void {
    this._cadModel.visible = visible;
  }

  getRevisionId(): number {
    return this._cadModel.revisionId;
  }
}

export class PointCloudModelHandler extends ModelHandler {
  constructor(private _pointCloudModel: CognitePointCloudModel) {
    super(_pointCloudModel);
  }

  key(): string {
    return `pointcloud-${this._pointCloudModel.modelId}-${this._pointCloudModel.revisionId}`;
  }

  visible(): boolean {
    return this._pointCloudModel.visible;
  }

  setVisibility(visible: boolean): void {
    this._pointCloudModel.visible = visible;
  }

  getRevisionId(): number {
    return this._pointCloudModel.revisionId;
  }
}

export class Image360CollectionHandler extends ModelHandler {
  constructor(private _image360Collection: Image360Collection) {
    super(_image360Collection);
  }

  key(): string {
    return `image360-${this._image360Collection.id}`;
  }

  visible(): boolean {
    return this._image360Collection.getIconsVisibility();
  }

  setVisibility(visible: boolean): void {
    this._image360Collection.setIconsVisibility(visible);
  }

  getSiteId(): string {
    return this._image360Collection.id;
  }
}
