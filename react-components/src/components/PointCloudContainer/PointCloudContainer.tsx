/*!
 * Copyright 2023 Cognite AS
 */
import {
  type CognitePointCloudModel,
  type AddModelOptions,
  type DataSourceType
} from '@cognite/reveal';

import { useEffect, type ReactElement, useState, useRef } from 'react';
import { type Matrix4 } from 'three';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import {
  useReveal3DResourceLoadFailCount,
  useReveal3DResourcesCount
} from '../Reveal3DResources/Reveal3DResourcesInfoContext';
import { cloneDeep, isEqual } from 'lodash';
import { useApplyPointCloudStyling } from './useApplyPointCloudStyling';
import { modelExists } from '../../utilities/modelExists';
import { getViewerResourceCount } from '../../utilities/getViewerResourceCount';
import { type PointCloudModelStyling } from './types';
import { useModelIdRevisionIdFromModelOptions } from '../../hooks/useModelIdRevisionIdFromModelOptions';
import { isClassicIdentifier, isDMIdentifier } from '../Reveal3DResources';
import { isSameModel } from '../../utilities/isSameModel';
import { RevealModelsUtils } from '../../architecture/concrete/reveal/RevealModelsUtils';

export type CognitePointCloudModelProps = {
  addModelOptions: AddModelOptions<DataSourceType>;
  styling?: PointCloudModelStyling;
  transform?: Matrix4;
  onLoad?: (model: CognitePointCloudModel<DataSourceType>) => void;
  onLoadError?: (options: AddModelOptions<DataSourceType>, error: any) => void;
};

export function PointCloudContainer({
  addModelOptions,
  styling,
  transform,
  onLoad,
  onLoadError
}: CognitePointCloudModelProps): ReactElement {
  const cachedViewerRef = useRevealKeepAlive();
  const [model, setModel] = useState<CognitePointCloudModel<DataSourceType> | undefined>(undefined);
  const renderTarget = useRenderTarget();
  const viewer = renderTarget.viewer;
  const { setRevealResourcesCount } = useReveal3DResourcesCount();
  const { setReveal3DResourceLoadFailCount } = useReveal3DResourceLoadFailCount();
  const initializingModel = useRef<AddModelOptions<DataSourceType> | undefined>(undefined);

  const [{ data: addModelOptionsResult }] = useModelIdRevisionIdFromModelOptions([addModelOptions]);

  const modelId = addModelOptionsResult?.modelId;
  const revisionId = addModelOptionsResult?.revisionId;

  useEffect(() => {
    if (
      isEqual(initializingModel.current, addModelOptions) ||
      modelId === undefined ||
      revisionId === undefined
    ) {
      return;
    }

    initializingModel.current = cloneDeep(addModelOptions);

    const cleanupCallbackPromise = addModel(addModelOptions, transform)
      .then((pointCloudModel: CognitePointCloudModel<DataSourceType>) => {
        onLoad?.(pointCloudModel);
        setRevealResourcesCount(getViewerResourceCount(viewer));
        return removeModel;
      })
      .catch((error) => {
        const errorHandler = onLoadError ?? defaultLoadErrorHandler;
        errorHandler(addModelOptions, error);
        setReveal3DResourceLoadFailCount((p) => p + 1);
        return () => {
          setReveal3DResourceLoadFailCount((p) => p - 1);
        };
      });

    return () => {
      void cleanupCallbackPromise.then((callback) => {
        callback();
      });
    };
  }, [modelId, revisionId]);

  useEffect(() => {
    if (!modelExists(model, viewer) || transform === undefined) return;

    model.setModelTransformation(transform);
  }, [transform, model]);

  useApplyPointCloudStyling(model, styling);

  return <></>;

  async function addModel(
    addModelOptions: AddModelOptions<DataSourceType>,
    transform?: Matrix4
  ): Promise<CognitePointCloudModel<DataSourceType>> {
    const pointCloudModel = await getOrAddModel();

    if (transform !== undefined) {
      pointCloudModel.setModelTransformation(transform);
    }
    setModel(pointCloudModel);
    return pointCloudModel;

    async function getOrAddModel(): Promise<CognitePointCloudModel<DataSourceType>> {
      const viewerModel = viewer.models.find((pointCloudModel) => {
        const pointCloudModelClone = {
          ...pointCloudModel,
          transform: pointCloudModel.getModelTransformation()
        };
        return isSameModel(pointCloudModelClone, addModelOptions);
      });

      if (viewerModel !== undefined) {
        return await Promise.resolve(viewerModel as CognitePointCloudModel<DataSourceType>);
      }
      return await viewer.addPointCloudModel(addModelOptions).then((model) => {
        RevealModelsUtils.add(renderTarget, model);
        return model;
      });
    }
  }

  function removeModel(): void {
    if (!modelExists(model, viewer)) return;

    if (cachedViewerRef !== undefined && !cachedViewerRef.isRevealContainerMountedRef.current)
      return;

    RevealModelsUtils.remove(renderTarget, model);
    setRevealResourcesCount(getViewerResourceCount(viewer));
    setModel(undefined);
  }
}

function defaultLoadErrorHandler(addOptions: AddModelOptions<DataSourceType>, error: any): void {
  if (isClassicIdentifier(addOptions)) {
    console.warn(
      `Failed to load (${addOptions.modelId}, ${addOptions.revisionId}): ${JSON.stringify(error)}`
    );
  } else if (isDMIdentifier(addOptions)) {
    console.warn(
      `Failed to load (${addOptions.revisionExternalId}, ${addOptions.revisionSpace}): ${JSON.stringify(error)}`
    );
  }
}
