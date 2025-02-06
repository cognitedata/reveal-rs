/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useRef } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { type DataSourceType, type Image360Collection } from '@cognite/reveal';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { type AddImage360CollectionOptions } from '../Reveal3DResources/types';
import {
  type ImageCollectionModelStyling,
  useApply360AnnotationStyling
} from './useApply360AnnotationStyling';
import { type Matrix4 } from 'three';
import {
  DEFAULT_IMAGE360_ICON_COUNT_LIMIT,
  DEFAULT_IMAGE360_ICON_CULLING_RADIUS
} from './constants';
import {
  useReveal3DResourceLoadFailCount,
  useReveal3DResourcesCount
} from '../Reveal3DResources/Reveal3DResourcesInfoContext';
import { getViewerResourceCount } from '../../utilities/getViewerResourceCount';
import { RevealModelsUtils } from '../../architecture/concrete/reveal/RevealModelsUtils';

type Image360CollectionContainerProps = {
  addImage360CollectionOptions: AddImage360CollectionOptions;
  styling?: ImageCollectionModelStyling;
  onLoad?: (image360: Image360Collection<DataSourceType>) => void;
  onLoadError?: (addOptions: AddImage360CollectionOptions, error: any) => void;
};

export function Image360CollectionContainer({
  addImage360CollectionOptions,
  styling,
  onLoad,
  onLoadError
}: Image360CollectionContainerProps): ReactElement {
  const cachedViewerRef = useRevealKeepAlive();
  const modelRef = useRef<Image360Collection<DataSourceType>>();
  const renderTarget = useRenderTarget();
  const viewer = renderTarget.viewer;
  const { setRevealResourcesCount } = useReveal3DResourcesCount();
  const { setReveal3DResourceLoadFailCount } = useReveal3DResourceLoadFailCount();

  const initializingSiteId = useRef<{ siteId: string } | { externalId: string } | undefined>(
    undefined
  );

  useEffect(() => {
    if (
      addImage360CollectionOptions.source === 'events' &&
      initializingSiteId.current === addImage360CollectionOptions
    ) {
      return;
    }

    initializingSiteId.current = addImage360CollectionOptions;

    const cleanupCallbackPromise = add360Collection(addImage360CollectionOptions.transform);
    return () => {
      void cleanupCallbackPromise.then((callback) => {
        callback();
      });
    };
  }, [addImage360CollectionOptions]);

  useApply360AnnotationStyling(modelRef.current, styling);
  useSetIconCulling(modelRef.current, addImage360CollectionOptions.iconCullingOptions);

  useEffect(() => {
    if (
      modelRef.current === undefined ||
      addImage360CollectionOptions.transform === undefined ||
      !viewer.get360ImageCollections().includes(modelRef.current)
    ) {
      return;
    }

    modelRef.current.setModelTransformation(addImage360CollectionOptions.transform);
  }, [modelRef, addImage360CollectionOptions.transform, viewer]);

  return <></>;

  async function add360Collection(transform?: Matrix4): Promise<() => void> {
    return await getOrAdd360Collection()
      .then((image360Collection) => {
        if (transform !== undefined) {
          image360Collection.setModelTransformation(transform);
        }

        setCollectionCullingOptions(
          image360Collection,
          addImage360CollectionOptions.iconCullingOptions
        );

        modelRef.current = image360Collection;
        onLoad?.(image360Collection);
        setRevealResourcesCount(getViewerResourceCount(viewer));
        return remove360Collection;
      })
      .catch((error: any) => {
        const errorReportFunction = onLoadError ?? defaultLoadErrorHandler;
        errorReportFunction(addImage360CollectionOptions, error);
        setReveal3DResourceLoadFailCount((p) => p + 1);
        return () => {
          setReveal3DResourceLoadFailCount((p) => p - 1);
        };
      });

    async function getOrAdd360Collection(): Promise<Image360Collection<DataSourceType>> {
      const collections = viewer.get360ImageCollections();
      const siteId =
        addImage360CollectionOptions.source === 'events'
          ? addImage360CollectionOptions.siteId
          : addImage360CollectionOptions.externalId;
      const collection = collections.find((collection) => collection.id === siteId);
      if (collection !== undefined) {
        return collection;
      }

      if (addImage360CollectionOptions.source === 'events') {
        return await viewer
          .add360ImageSet('events', { site_id: siteId }, { preMultipliedRotation: false })
          .then((model) => {
            RevealModelsUtils.add(renderTarget, model);
            return model;
          });
      } else {
        return await viewer
          .add360ImageSet('datamodels', {
            source: addImage360CollectionOptions.source,
            image360CollectionExternalId: addImage360CollectionOptions.externalId,
            space: addImage360CollectionOptions.space
          })
          .then((model) => {
            RevealModelsUtils.add(renderTarget, model);
            return model;
          });
      }
    }
  }

  function remove360Collection(): void {
    if (modelRef.current === undefined) return;

    if (cachedViewerRef !== undefined && !cachedViewerRef.isRevealContainerMountedRef.current)
      return;

    RevealModelsUtils.remove(renderTarget, modelRef.current);
    setRevealResourcesCount(getViewerResourceCount(viewer));
    modelRef.current = undefined;
  }
}

const useSetIconCulling = (
  collection?: Image360Collection<DataSourceType>,
  cullingParameters?: { radius?: number; iconCountLimit?: number }
): void => {
  const radius = cullingParameters?.radius;
  const iconCountLimit = cullingParameters?.iconCountLimit;

  useEffect(() => {
    setCollectionCullingOptions(collection, cullingParameters);
  }, [collection, radius, iconCountLimit]);
};

function setCollectionCullingOptions(
  collection?: Image360Collection<DataSourceType>,
  cullingParameters?: { radius?: number; iconCountLimit?: number }
): void {
  collection?.set360IconCullingRestrictions(
    cullingParameters?.radius ?? DEFAULT_IMAGE360_ICON_CULLING_RADIUS,
    cullingParameters?.iconCountLimit ?? DEFAULT_IMAGE360_ICON_COUNT_LIMIT
  );
}

function defaultLoadErrorHandler(addOptions: AddImage360CollectionOptions, error: any): void {
  console.warn(
    `Failed to load image collection ${
      'siteId' in addOptions ? addOptions.siteId : addOptions.externalId
    }: ${JSON.stringify(error)}`
  );
}
