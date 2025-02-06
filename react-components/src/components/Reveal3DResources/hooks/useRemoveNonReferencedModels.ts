/*!
 * Copyright 2024 Cognite AS
 */
import {
  type DataSourceType,
  type Cognite3DViewer,
  type CogniteModel,
  type Image360Collection
} from '@cognite/reveal';
import { type AddResourceOptions } from '../types';
import {
  is360ImageAddOptions,
  is360ImageDataModelAddOptions,
  is360ImageEventsAddOptions
} from '../typeGuards';
import { useEffect } from 'react';
import { isSameModel } from '../../../utilities/isSameModel';
import { useReveal3DResourcesCount } from '../Reveal3DResourcesInfoContext';
import { getViewerResourceCount } from '../../../utilities/getViewerResourceCount';
import { type RevealRenderTarget } from '../../../architecture';
import { RevealModelsUtils } from '../../../architecture/concrete/reveal/RevealModelsUtils';

export function useRemoveNonReferencedModels(
  addOptions: AddResourceOptions[],
  renderTarget: RevealRenderTarget
): void {
  const { setRevealResourcesCount } = useReveal3DResourcesCount();
  useEffect(() => {
    const viewer = renderTarget.viewer;
    const nonReferencedModels = findNonReferencedModels(addOptions, viewer);

    nonReferencedModels.forEach((model) => {
      RevealModelsUtils.remove(renderTarget, model);
    });

    const nonReferencedCollections = findNonReferencedCollections(addOptions, viewer);

    nonReferencedCollections.forEach((model) => {
      RevealModelsUtils.remove(renderTarget, model);
    });
    setRevealResourcesCount(getViewerResourceCount(viewer));
  }, [addOptions]);
}

function findNonReferencedModels(
  addOptions: AddResourceOptions[],
  viewer: Cognite3DViewer<DataSourceType>
): Array<CogniteModel<DataSourceType>> {
  const models = viewer.models;
  const addOptionsSet = new Set(addOptions.filter((model) => !is360ImageAddOptions(model)));

  return models.filter((model) => {
    const correspondingAddOptions = (() => {
      for (const options of addOptionsSet) {
        if (is360ImageAddOptions(options)) {
          continue;
        }

        const sameModel = isSameModel(options, {
          modelId: model.modelId,
          revisionId: model.revisionId,
          transform: model.getModelTransformation()
        });

        if (sameModel) {
          return options;
        }
      }
      return undefined;
    })();

    if (correspondingAddOptions !== undefined) {
      addOptionsSet.delete(correspondingAddOptions);
      return false;
    }

    return true;
  });
}

function findNonReferencedCollections(
  addOptions: AddResourceOptions[],
  viewer: Cognite3DViewer<DataSourceType>
): Array<Image360Collection<DataSourceType>> {
  const image360CollectionAddOptions = addOptions.filter(is360ImageAddOptions);

  const collections = viewer.get360ImageCollections();
  const collectionAddOptionsSet = new Set(image360CollectionAddOptions);

  return collections.filter((collection) => {
    const correspondingAddOptions = (() => {
      for (const options of collectionAddOptionsSet) {
        const isDataModelCollectionAndSame =
          is360ImageDataModelAddOptions(options) && collection.id === options.externalId;
        const isEventCollectionAndSame =
          is360ImageEventsAddOptions(options) && collection.id === options.siteId;

        if (isDataModelCollectionAndSame || isEventCollectionAndSame) {
          return options;
        }
      }
      return undefined;
    })();

    if (correspondingAddOptions !== undefined) {
      collectionAddOptionsSet.delete(correspondingAddOptions);
      return false;
    }

    return true;
  });
}
