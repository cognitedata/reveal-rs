/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { LineDomainObject } from '../primitives/line/LineDomainObject';
import { Color, Vector3 } from 'three';
import { LineRenderStyle } from '../primitives/line/LineRenderStyle';
import { createTriangleIndexesFromVectors } from './createTriangleIndexesFromVectors';
import { type AnnotationIdentifier, type AssetIdentifier, type AnnotationStatus } from './types';
import { type DmsUniqueIdentifier } from '../../../data-providers';

const DEFAULT_VECTOR_LENGTH = 5;

export class Image360AnnotationDomainObject extends LineDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public connectedImageId: string | DmsUniqueIdentifier;
  public readonly center = new Vector3(); // The points are unit vectors from the center
  public vectorLength = DEFAULT_VECTOR_LENGTH;
  public annotationIdentifier?: AnnotationIdentifier;
  public assetRef?: AssetIdentifier;
  public status: AnnotationStatus = 'pending';

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(connectedImageId: string | DmsUniqueIdentifier) {
    super(PrimitiveType.Polygon);
    this.color = new Color(Color.NAMES.yellow);
    this.connectedImageId = connectedImageId;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get typeName(): TranslationInput {
    return { untranslated: '360 image annotation' };
  }

  public override get hasPanelInfo(): boolean {
    return false;
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new Image360AnnotationDomainObject(this.connectedImageId);
    clone.copyFrom(this, what);
    return clone;
  }

  public override copyFrom(domainObject: Image360AnnotationDomainObject, what?: symbol): void {
    super.copyFrom(domainObject, what);
    this.connectedImageId = domainObject.connectedImageId;
    this.center.copy(domainObject.center);
    this.vectorLength = domainObject.vectorLength;

    this.annotationIdentifier = domainObject.annotationIdentifier;
    this.assetRef = domainObject.assetRef;
    this.status = domainObject.status;
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new LineRenderStyle();
    style.showLabel = false;
    style.pipeRadius = 0.01 / 3;
    style.selectedPipeRadius = 2 * style.pipeRadius;
    style.depthTest = false;
    style.transparent = true; // Needed to make the line visible through other objects
    style.showSolid = true;
    style.renderOrder = 100;
    return style;
  }

  public override getTransformedPoint(point: Vector3): Vector3 {
    return this.getCopyOfTransformedPoint(point, new Vector3());
  }

  public override getCopyOfTransformedPoint(point: Vector3, target: Vector3): Vector3 {
    target.copy(this.center);
    target.addScaledVector(point, this.vectorLength);
    return target;
  }

  public override getTriangleIndexes(): number[] | undefined {
    return createTriangleIndexesFromVectors(this.points);
  }
}
