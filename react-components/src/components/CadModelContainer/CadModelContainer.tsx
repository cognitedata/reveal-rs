/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useState, useRef } from 'react';
import {
  type GeometryFilter,
  type AddModelOptions,
  type CogniteCadModel,
  type ClassicDataSourceType
} from '@cognite/reveal';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { type Matrix4 } from 'three';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import {
  useReveal3DResourceLoadFailCount,
  useReveal3DResourcesCount,
  useThisAsExpectedResourceLoad
} from '../Reveal3DResources/Reveal3DResourcesInfoContext';
import { isEqual } from 'lodash';
import { modelExists } from '../../utilities/modelExists';
import { getViewerResourceCount } from '../../utilities/getViewerResourceCount';
import { type CadModelStyling } from './types';
import { useApplyCadModelStyling } from './useApplyCadModelStyling';
import { isSameGeometryFilter, isSameModel } from '../../utilities/isSameModel';
import { useModelIdRevisionIdFromModelOptions } from '../../hooks/useModelIdRevisionIdFromModelOptions';

export type CogniteCadModelProps = {
  addModelOptions: AddModelOptions<ClassicDataSourceType>;
  styling?: CadModelStyling;
  transform?: Matrix4;
  onLoad?: (model: CogniteCadModel) => void;
  onLoadError?: (options: AddModelOptions<ClassicDataSourceType>, error: any) => void;
};

export function CadModelContainer({
  addModelOptions,
  transform,
  styling,
  onLoad,
  onLoadError
}: CogniteCadModelProps): ReactElement {
  const cachedViewerRef = useRevealKeepAlive();
  const viewer = useReveal();
  const { setRevealResourcesCount } = useReveal3DResourcesCount();
  const { setReveal3DResourceLoadFailCount } = useReveal3DResourceLoadFailCount();
  const initializingModel = useRef<AddModelOptions<ClassicDataSourceType> | undefined>(undefined);
  const initializingModelsGeometryFilter = useRef<GeometryFilter | undefined>(undefined);

  const [model, setModel] = useState<CogniteCadModel | undefined>(undefined);

  useThisAsExpectedResourceLoad();

  const [{ data: addModelOptionsResult }] = useModelIdRevisionIdFromModelOptions([addModelOptions]);

  const modelId = addModelOptionsResult?.modelId;
  const revisionId = addModelOptionsResult?.revisionId;
  const geometryFilter = addModelOptions.geometryFilter;

  useEffect(() => {
    if (
      isEqual(initializingModel.current, addModelOptionsResult) ||
      addModelOptionsResult === undefined
    ) {
      return;
    }

    initializingModel.current = addModelOptionsResult;
    addModel(addModelOptionsResult, transform)
      .then((model) => {
        onLoad?.(model);
        setRevealResourcesCount(getViewerResourceCount(viewer));
      })
      .catch((error) => {
        const errorReportFunction = onLoadError ?? defaultLoadErrorHandler;
        errorReportFunction(addModelOptionsResult, error);
        setReveal3DResourceLoadFailCount((p) => p + 1);
        return () => {
          setReveal3DResourceLoadFailCount((p) => p - 1);
        };
      });
  }, [modelId, revisionId, geometryFilter]);

  useEffect(() => {
    if (!modelExists(model, viewer) || transform === undefined) return;

    model.setModelTransformation(transform);
  }, [transform, model]);

  useApplyCadModelStyling(model, styling);

  useEffect(
    () => () => {
      removeModel(model);
    },
    [model]
  );

  return <></>;

  async function addModel(
    addModelOptions: AddModelOptions,
    transform?: Matrix4
  ): Promise<CogniteCadModel> {
    const cadModel = await getOrAddModel();

    if (transform !== undefined) {
      cadModel.setModelTransformation(transform);
    }
    setModel(cadModel);

    return cadModel;

    async function getOrAddModel(): Promise<CogniteCadModel> {
      const viewerModel = viewer.models.find(
        (model) =>
          isSameModel(model, addModelOptions) &&
          isSameGeometryFilter(geometryFilter, initializingModelsGeometryFilter.current)
      );

      if (viewerModel !== undefined) {
        return await Promise.resolve(viewerModel as CogniteCadModel);
      }
      initializingModelsGeometryFilter.current = geometryFilter;
      return await viewer.addCadModel(addModelOptions);
    }
  }

  function removeModel(model: CogniteCadModel | undefined): void {
    if (!modelExists(model, viewer)) return;

    if (cachedViewerRef !== undefined && !cachedViewerRef.isRevealContainerMountedRef.current)
      return;

    viewer.removeModel(model);
    setRevealResourcesCount(getViewerResourceCount(viewer));
  }
}

function defaultLoadErrorHandler(
  addOptions: AddModelOptions<ClassicDataSourceType>,
  error: any
): void {
  console.warn(
    `Failed to load (${addOptions.modelId}, ${addOptions.revisionId}): ${JSON.stringify(error)}`
  );
}
