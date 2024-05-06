/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useEffect } from 'react';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { type AddResourceOptions, type Reveal3DResourcesProps } from './types';
import { ResourceUpdater } from './ResourceUpdater';
import { useSDK } from '../RevealCanvas/SDKProvider';
import { useFdmNodeCache } from '../CacheProvider/NodeCacheProvider';
import { useAssetMappingCache } from '../CacheProvider/AssetMappingCacheProvider';
import { usePointCloudAnnotationCache } from '../CacheProvider/PointCloudAnnotationCacheProvider';

export const Reveal3DResources = ({
  resources,
  defaultResourceStyling,
  instanceStyling,
  onResourcesAdded,
  onResourceLoadError
}: Reveal3DResourcesProps): ReactElement => {
  const viewer = useReveal();
  const sdk = useSDK();

  const onModelFailOrSucceed = (): void => {
    numModelsLoaded.current += 1;

    const expectedTotalLoadCount = resources.length;

    if (numModelsLoaded.current === expectedTotalLoadCount && onResourcesAdded !== undefined) {
      onResourcesAdded();
    }
  };

  const onModelLoaded = (): void => {
    onModelFailOrSucceed();
  };

  const onModelLoadedError = (addOptions: AddResourceOptions, error: any): void => {
    onResourceLoadError?.(addOptions, error);
    onModelFailOrSucceed();
  };

  const fdmNodeCache = useFdmNodeCache();
  const assetMappingCache = useAssetMappingCache();
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();

  const revealHandler = useRef<ResourceUpdater>(
    new ResourceUpdater(
      viewer,
      sdk,
      fdmNodeCache,
      assetMappingCache,
      pointCloudAnnotationCache,
      onModelLoaded,
      onModelLoadedError
    )
  );
  const numModelsLoaded = useRef(0);

  useEffect(() => {
    void revealHandler.current.updateCommonStyling(
      instanceStyling ?? [],
      defaultResourceStyling ?? {}
    );
  }, [defaultResourceStyling, instanceStyling]);

  useEffect(() => {
    void revealHandler.current.updateModels(resources);
  }, [resources]);

  return <></>;
};
