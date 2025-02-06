/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useMemo } from 'react';
import { CadModelContainer } from '../CadModelContainer/CadModelContainer';
import { PointCloudContainer } from '../PointCloudContainer/PointCloudContainer';
import { Image360CollectionContainer } from '../Image360CollectionContainer/Image360CollectionContainer';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { type Reveal3DResourcesProps, type CadModelOptions } from './types';
import { useCalculatePointCloudStyling } from './hooks/useCalculatePointCloudStyling';
import { EMPTY_ARRAY } from '../../utilities/constants';
import { isAssetMappingStylingGroup } from '../../utilities/StylingGroupUtils';
import { type ImageCollectionModelStyling } from '../Image360CollectionContainer/useApply360AnnotationStyling';
import { is360ImageAddOptions, isClassicIdentifier } from './typeGuards';
import { useRemoveNonReferencedModels } from './hooks/useRemoveNonReferencedModels';
import { useCalculateCadStyling } from './hooks/useCalculateCadStyling';
import { useReveal3DResourcesStylingLoadingSetter } from './Reveal3DResourcesInfoContext';
import { type CadModelStyling } from '../CadModelContainer/types';
import { type PointCloudModelStyling } from '../PointCloudContainer/types';
import { useTypedModels } from './hooks/useTypedModels';
import {
  useAssetMappedNodesForRevisions,
  useGenerateAssetMappingCachePerItemFromModelCache,
  useGenerateNode3DCache
} from '../../hooks/cad';
import { useCallCallbackOnFinishedLoading } from './hooks/useCallCallbackOnFinishedLoading';
import { useSetExpectedLoadCount } from './hooks/useSetExpectedLoadCount';
import { useCalculateImage360Styling } from './hooks/useCalculateImage360Styling';

export const Reveal3DResources = ({
  resources,
  defaultResourceStyling,
  instanceStyling,
  onResourcesAdded,
  onResourceLoadError,
  onResourceIsLoaded,
  image360Settings
}: Reveal3DResourcesProps): ReactElement => {
  const renderTarget = useRenderTarget();

  useRemoveNonReferencedModels(resources, renderTarget);

  const { data: reveal3DModels } = useTypedModels(
    renderTarget.viewer,
    resources,
    onResourceLoadError
  );

  useSetExpectedLoadCount(resources);
  useCallCallbackOnFinishedLoading(resources, onResourcesAdded);

  const image360CollectionAddOptions = useMemo(() => {
    return resources
      .filter(is360ImageAddOptions)
      .map((options) => ({ ...image360Settings, ...options }));
  }, [resources, image360Settings]);

  const cadModelOptions = useMemo(() => {
    if (reveal3DModels === undefined) {
      return EMPTY_ARRAY;
    }
    return reveal3DModels.filter((model): model is CadModelOptions => model.type === 'cad');
  }, [reveal3DModels]);

  const { data: assetMappings } = useAssetMappedNodesForRevisions(cadModelOptions);

  useGenerateAssetMappingCachePerItemFromModelCache(cadModelOptions, assetMappings);
  useGenerateNode3DCache(cadModelOptions, assetMappings);

  const instanceStylingWithAssetMappings =
    instanceStyling?.filter(isAssetMappingStylingGroup) ?? EMPTY_ARRAY;

  const { styledModels: styledCadModelOptions, isModelMappingsLoading } = useCalculateCadStyling(
    cadModelOptions,
    instanceStylingWithAssetMappings,
    defaultResourceStyling
  );

  const setModel3DStylingLoading = useReveal3DResourcesStylingLoadingSetter();

  useEffect(() => {
    setModel3DStylingLoading(isModelMappingsLoading);
  }, [isModelMappingsLoading]);

  const styledPointCloudModelOptions = useCalculatePointCloudStyling(
    reveal3DModels ?? EMPTY_ARRAY,
    instanceStylingWithAssetMappings,
    defaultResourceStyling
  );

  const image360StyledGroup = useCalculateImage360Styling(instanceStyling);

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
            onLoad={onResourceIsLoaded}
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
        let key;
        if (isClassicIdentifier(model)) {
          key = `${model.modelId}/${model.revisionId}/${index}`;
        } else {
          key = `${model.revisionExternalId}/${model.revisionSpace}/${index}`;
        }
        return (
          <PointCloudContainer
            key={key}
            addModelOptions={model}
            styling={pcStyling}
            transform={model.transform}
            onLoad={onResourceIsLoaded}
            onLoadError={onResourceLoadError}
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
              onLoad={onResourceIsLoaded}
              onLoadError={onResourceLoadError}
            />
          );
        }
        return <></>;
      })}
    </>
  );
};
