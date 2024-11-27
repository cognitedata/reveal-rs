/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useState, useEffect, useMemo } from 'react';
import {
  type CogniteCadModel,
  type CognitePointCloudModel,
  type Image360Collection,
  type Cognite3DViewer
} from '@cognite/reveal';
import { CadModelContainer } from '../CadModelContainer/CadModelContainer';
import { PointCloudContainer } from '../PointCloudContainer/PointCloudContainer';
import { Image360CollectionContainer } from '../Image360CollectionContainer/Image360CollectionContainer';
import { useReveal } from '../RevealCanvas/ViewerContext';
import {
  type TypedReveal3DModel,
  type AddResourceOptions,
  type Reveal3DResourcesProps,
  type CadModelOptions,
  type PointCloudModelOptions,
  type AddCadResourceOptions,
  type AddPointCloudResourceOptions
} from './types';
import { useCalculatePointCloudStyling } from './useCalculatePointCloudStyling';
import {
  type AnnotationIdStylingGroup,
  type PointCloudModelStyling
} from '../PointCloudContainer/useApplyPointCloudStyling';
import { EMPTY_ARRAY } from '../../utilities/constants';
import {
  isAssetMappingStylingGroup,
  isCadAssetMappingStylingGroup,
  isImage360AssetStylingGroup
} from '../../utilities/StylingGroupUtils';
import { type ImageCollectionModelStyling } from '../Image360CollectionContainer/useApply360AnnotationStyling';
import { is360ImageAddOptions } from './typeGuards';
import { useRemoveNonReferencedModels } from './useRemoveNonReferencedModels';

import { useCalculateCadStyling } from './useCalculateCadStyling';
import { useReveal3DResourcesStylingLoadingSetter } from './Reveal3DResourcesInfoContext';
import { type CadModelStyling } from '../CadModelContainer/types';

export const Reveal3DResources = ({
  resources,
  defaultResourceStyling,
  instanceStyling,
  onResourcesAdded,
  onResourceLoadError,
  onResourceIsLoaded,
  image360Settings
}: Reveal3DResourcesProps): ReactElement => {
  const viewer = useReveal();

  const [reveal3DModels, setReveal3DModels] = useState<TypedReveal3DModel[]>([]);

  const numModelsLoaded = useRef(0);

  useEffect(() => {
    void getTypedModels(resources, viewer, onResourceLoadError).then(setReveal3DModels);
  }, [resources, viewer]);

  const image360CollectionAddOptions = useMemo(() => {
    return resources
      .filter(is360ImageAddOptions)
      .map((options) => ({ ...image360Settings, ...options }));
  }, [resources, image360Settings]);

  useRemoveNonReferencedModels(resources, viewer);

  const cadModelOptions = useMemo(
    () => reveal3DModels.filter((model): model is CadModelOptions => model.type === 'cad'),
    [reveal3DModels]
  );

  const pointCloudModelOptions = useMemo(
    () =>
      reveal3DModels.filter(
        (model): model is PointCloudModelOptions => model.type === 'pointcloud'
      ),
    [reveal3DModels]
  );

  const { styledModels: styledCadModelOptions, isModelMappingsLoading } = useCalculateCadStyling(
    cadModelOptions,
    instanceStyling?.filter(isCadAssetMappingStylingGroup) ?? EMPTY_ARRAY,
    defaultResourceStyling
  );

  const setModel3DStylingLoading = useReveal3DResourcesStylingLoadingSetter();

  useEffect(() => {
    setModel3DStylingLoading(isModelMappingsLoading);
  }, [isModelMappingsLoading]);

  const instaceStylingWithAssetMappings =
    instanceStyling?.filter(isAssetMappingStylingGroup) ?? EMPTY_ARRAY;

  const styledPointCloudModelOptions = useCalculatePointCloudStyling(
    pointCloudModelOptions,
    instaceStylingWithAssetMappings,
    defaultResourceStyling
  );

  const image360StyledGroup =
    instanceStyling
      ?.filter(isImage360AssetStylingGroup)
      .map((group) => {
        return { assetIds: group.assetIds, style: group.style.image360 };
      })
      .filter(
        (group): group is AnnotationIdStylingGroup & { assetIds: number[] } =>
          group.style !== undefined
      ) ?? EMPTY_ARRAY;

  const onModelLoaded = (
    model: CogniteCadModel | CognitePointCloudModel | Image360Collection
  ): void => {
    onModelFailOrSucceed();
    onResourceIsLoaded?.(model);
  };

  const onModelLoadedError = (addOptions: AddResourceOptions, error: any): void => {
    onResourceLoadError?.(addOptions, error);
    onModelFailOrSucceed();
  };

  const onModelFailOrSucceed = (): void => {
    numModelsLoaded.current += 1;

    const expectedTotalLoadCount = reveal3DModels.length + image360CollectionAddOptions.length;

    if (numModelsLoaded.current === expectedTotalLoadCount && onResourcesAdded !== undefined) {
      onResourcesAdded();
    }
  };

  return (
    <>
      {styledCadModelOptions.map(({ styleGroups, model }, index) => {
        const defaultStyle = model.styling?.default ?? defaultResourceStyling?.cad?.default;
        const cadStyling: CadModelStyling = {
          defaultStyle,
          groups: styleGroups
        };
        return (
          <CadModelContainer
            key={`${model.modelId}/${model.revisionId}/${index}`}
            addModelOptions={model}
            styling={cadStyling}
            transform={model.transform}
            onLoad={onModelLoaded}
            onLoadError={onResourceLoadError}
          />
        );
      })}
      {styledPointCloudModelOptions.map(({ styleGroups, model }, index) => {
        const defaultStyle = model.styling?.default ?? defaultResourceStyling?.pointcloud?.default;
        const pcStyling: PointCloudModelStyling = {
          defaultStyle,
          groups: styleGroups
        };
        return (
          <PointCloudContainer
            key={`${model.modelId}/${model.revisionId}/${index}`}
            addModelOptions={model}
            styling={pcStyling}
            transform={model.transform}
            onLoad={onModelLoaded}
            onLoadError={onModelLoadedError}
          />
        );
      })}
      {image360CollectionAddOptions.map((addModelOption) => {
        const image360Styling: ImageCollectionModelStyling = {
          defaultStyle: defaultResourceStyling?.image360?.default,
          groups: image360StyledGroup
        };
        let key;
        if ('siteId' in addModelOption) {
          key = `${addModelOption.siteId}`;
        } else if ('externalId' in addModelOption) {
          key = `${addModelOption.externalId}`;
        }

        if ('externalId' in addModelOption || 'siteId' in addModelOption) {
          return (
            <Image360CollectionContainer
              key={key}
              addImage360CollectionOptions={addModelOption}
              styling={image360Styling}
              onLoad={onModelLoaded}
              onLoadError={onModelLoadedError}
            />
          );
        }
        return <></>;
      })}
    </>
  );
};

async function getTypedModels(
  resources: AddResourceOptions[],
  viewer: Cognite3DViewer,
  onLoadFail?: (resource: AddResourceOptions, error: any) => void
): Promise<TypedReveal3DModel[]> {
  const errorFunction = onLoadFail ?? defaultLoadFailHandler;

  const modelTypePromises = resources
    .filter(
      (resource): resource is AddCadResourceOptions | AddPointCloudResourceOptions =>
        !is360ImageAddOptions(resource)
    )
    .map(async (addModelOptions) => {
      const type = await viewer
        .determineModelType(addModelOptions.modelId, addModelOptions.revisionId)
        .catch((error) => {
          errorFunction(addModelOptions, error);
          return '';
        });
      const typedModel = { ...addModelOptions, type };
      return typedModel;
    });

  const resourceLoadResults = await Promise.all(modelTypePromises);
  const successfullyLoadedResources = resourceLoadResults.filter(
    (p): p is TypedReveal3DModel => p.type === 'cad' || p.type === 'pointcloud'
  );

  return successfullyLoadedResources;
}

function defaultLoadFailHandler(resource: AddResourceOptions, error: any): void {
  console.warn(`Could not load resource ${JSON.stringify(resource)}: ${JSON.stringify(error)}`);
}
