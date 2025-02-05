/*!
 * Copyright 2024 Cognite AS
 */
import { type GeometryFilter } from '@cognite/reveal';
import {
  type AddImage360CollectionOptions,
  type AddResourceOptions
} from '../components/Reveal3DResources/types';
import { Matrix4 } from 'three';
import {
  is360ImageAddOptions,
  is360ImageEventsAddOptions,
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components/Reveal3DResources/typeGuards';

export function isSameGeometryFilter(
  filter0: GeometryFilter | undefined,
  filter1: GeometryFilter | undefined
): boolean {
  if (filter0 === filter1) {
    return true;
  }

  if (filter0 === undefined || filter1 === undefined) {
    return false;
  }

  if (filter0.boundingBox === filter1.boundingBox) {
    return true;
  }

  if (filter0.boundingBox === undefined || filter1.boundingBox === undefined) {
    return false;
  }

  return (
    filter0.boundingBox.equals(filter1.boundingBox) &&
    filter0.isBoundingBoxInModelCoordinates === filter1.isBoundingBoxInModelCoordinates
  );
}

export function isSameModel(model0: AddResourceOptions, model1: AddResourceOptions): boolean {
  const isFirstImage360 = is360ImageAddOptions(model0);
  const isSecondImage360 = is360ImageAddOptions(model1);
  const isFirstModelClassic = isClassicIdentifier(model0);
  const isSecondModelClassic = isClassicIdentifier(model1);
  const isFirstModelDM = isDM3DModelIdentifier(model0);
  const isSecondModelDM = isDM3DModelIdentifier(model1);

  if (isFirstImage360 !== isSecondImage360) {
    return false;
  }

  if (isFirstImage360 && isSecondImage360) {
    return isSame360Collection(model0, model1);
  }

  if (isFirstModelClassic && isSecondModelClassic) {
    return (
      model0.modelId === model1.modelId &&
      model0.revisionId === model1.revisionId &&
      isSameTransform(model0.transform, model1.transform)
    );
  }

  if (isFirstModelDM && isSecondModelDM) {
    return (
      model0.revisionExternalId === model1.revisionExternalId &&
      model0.revisionSpace === model1.revisionSpace &&
      isSameTransform(model0.transform, model1.transform)
    );
  }

  return false;
}

export function isSame360Collection(
  collection0: AddImage360CollectionOptions,
  collection1: AddImage360CollectionOptions
): boolean {
  const isFirstEventsBased = is360ImageEventsAddOptions(collection0);
  const isSecondEventsBased = is360ImageEventsAddOptions(collection1);
  if (isFirstEventsBased !== isSecondEventsBased) {
    return false;
  }

  if (isFirstEventsBased && isSecondEventsBased) {
    return (
      collection0.siteId === collection1.siteId &&
      isSameTransform(collection0.transform, collection1.transform)
    );
  }

  if (!isFirstEventsBased && !isSecondEventsBased) {
    return (
      collection0.externalId === collection1.externalId &&
      collection0.space === collection1.space &&
      isSameTransform(collection0.transform, collection1.transform)
    );
  }

  return false;
}

const identity = new Matrix4();

function isSameTransform(m0: Matrix4 | undefined, m1: Matrix4 | undefined): boolean {
  if ((m0 === undefined || m0.equals(identity)) && (m1 === undefined || m1.equals(identity))) {
    return true;
  }

  if (m0 === undefined || m1 === undefined) {
    return false;
  }

  return m0.equals(m1);
}
