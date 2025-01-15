/*!
 * Copyright 2024 Cognite AS
 */
import { type Vector3 } from 'three';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { createPointsOfInterestPropertiesFromPointAndTitle } from './types';
import { type DmsUniqueIdentifier } from '../../../data-providers';

import {
  CustomBaseInputCommand,
  type FieldContent
} from '../../base/commands/CustomBaseInputCommand';
import { InstanceLabel } from '../../../components/InstanceLabel';
import { isDefined } from '../../../utilities/isDefined';
import { type InstanceReference } from '../../../utilities/instanceIds';

export class CreatePointsOfInterestWithDescriptionCommand extends CustomBaseInputCommand {
  private readonly _point: Vector3;
  private readonly _scene: DmsUniqueIdentifier;

  private _associatedInstance: InstanceReference | undefined;

  private readonly poisPlaceholders: TranslationInput[] = [
    { key: 'NAME' },
    { key: 'POINT_OF_INTEREST_DESCRIPTION_PLACEHOLDER' }
  ];

  private readonly poiContents: FieldContent[] = [
    { type: 'text', content: '' },
    { type: 'comment', content: '' },
    { type: 'customInput', content: '' },
    { type: 'submitButtons', content: undefined }
  ];

  constructor(position: Vector3, scene: DmsUniqueIdentifier) {
    super();

    this._point = position;
    this._scene = scene;
    this._placeholders = this.poisPlaceholders;
    this._contents = this.poiContents;
  }

  public get associatedInstance(): InstanceReference | undefined {
    return this._associatedInstance;
  }

  public set associatedInstance(instance: InstanceReference | undefined) {
    this._associatedInstance = instance;
  }

  public setCustomInputAsInstanceReference = (input: InstanceReference): void => {
    this.poiContents.forEach((content) => {
      if (content.type === 'customInput') {
        content.content = <InstanceLabel instance={input} />;
      }
    });
  };

  public override get contents(): FieldContent[] {
    return this._contents ?? [];
  }

  public override getPostButtonLabel(): TranslationInput {
    return { key: 'CREATE' };
  }

  public override getCancelButtonLabel(): TranslationInput {
    return { key: 'CANCEL' };
  }

  public override getPlaceholderByIndex(index: number): TranslationInput | undefined {
    return this._placeholders?.[index] ?? undefined;
  }

  public override getAllPlaceholders(): TranslationInput[] {
    return this._placeholders ?? [];
  }

  public override get hasData(): true {
    return true;
  }

  public override invokeCore(): boolean {
    if (this._contents === undefined) {
      return false;
    }

    const domainObject = this.renderTarget.rootDomainObject.getDescendantByType(
      PointsOfInterestDomainObject
    );

    if (domainObject === undefined) {
      return false;
    }

    const filteredContents = filterContentsAsString(this._contents);

    const poiName = filteredContents[0];
    const poiDescription = filteredContents[1];

    const poi = domainObject.addPendingPointsOfInterest(
      createPointsOfInterestPropertiesFromPointAndTitle(
        this._point,
        this._scene,
        poiName,
        poiDescription,
        this._associatedInstance
      )
    );

    void domainObject.save().then(() => {
      this.onFinish?.();
      domainObject.setSelectedPointOfInterest(poi);
    });

    return true;
  }
}

function filterContentsAsString(contents: FieldContent[]): string[] {
  return contents
    .map((content) => {
      if (
        content.type === 'text' ||
        content.type === 'comment' ||
        content.type === 'commentWithButtons'
      ) {
        return content.content;
      }
      return undefined;
    })
    .filter((content) => isDefined(content));
}
