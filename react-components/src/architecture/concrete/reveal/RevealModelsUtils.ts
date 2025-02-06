/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { CogniteCadModel, CognitePointCloudModel } from '@cognite/reveal';
import { CadDomainObject } from './cad/CadDomainObject';
import { PointCloudDomainObject } from './pointCloud/PointCloudDomainObject';
import { Image360CollectionDomainObject } from './Image360Collection/Image360CollectionDomainObject';
import { type RevealModel } from './RevealTypes';
import { type RootDomainObject } from '../../base/domainObjects/RootDomainObject';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';

export class RevealModelsUtils {
  public static getByRevealModel(
    root: RootDomainObject,
    model: RevealModel
  ): DomainObject | undefined {
    if (model instanceof CogniteCadModel) {
      for (const child of root.getChildrenByType(CadDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    } else if (model instanceof CognitePointCloudModel) {
      for (const child of root.getChildrenByType(PointCloudDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    } else {
      for (const child of root.getChildrenByType(Image360CollectionDomainObject)) {
        if (child.model === model) {
          return child;
        }
      }
    }
    return undefined;
  }

  public static add(renderTarget: RevealRenderTarget, model: RevealModel): void {
    const root = renderTarget.rootDomainObject;
    if (root === undefined) {
      throw new Error('Root domain object is not set');
    }
    let domainObject: DomainObject;
    if (model instanceof CogniteCadModel) {
      domainObject = new CadDomainObject(model);
    } else if (model instanceof CognitePointCloudModel) {
      domainObject = new PointCloudDomainObject(model);
    } else {
      domainObject = new Image360CollectionDomainObject(model);
    }
    root.addChildInteractive(domainObject);
  }

  public static remove(renderTarget: RevealRenderTarget, model: RevealModel): void {
    const root = renderTarget.rootDomainObject;
    if (root === undefined) {
      throw new Error('Root domain object is not set');
    }
    const domainObject = RevealModelsUtils.getByRevealModel(root, model);
    if (domainObject !== undefined) {
      domainObject.removeInteractive();
    }
  }
}
