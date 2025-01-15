/*!
 * Copyright 2024 Cognite AS
 */

import {
  type Cognite3DViewer,
  type Image360Collection,
  type Image360Annotation,
  type Image360AnnotationAppearance,
  type DataSourceType
} from '@cognite/reveal';
import { Color } from 'three';
import { image360CollectionExists } from '../../utilities/modelExists';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type CogniteInternalId } from '@cognite/sdk';
import { useReveal } from '../RevealCanvas/ViewerContext';

export type AnnotationIdStylingGroup = {
  assetIds: CogniteInternalId[];
  style: Image360AnnotationAppearance;
};

export type ImageCollectionModelStyling = {
  defaultStyle?: Image360AnnotationAppearance;
  groups?: AnnotationIdStylingGroup[];
};

const defaultStyling: Image360AnnotationAppearance = {
  color: new Color('rgb(150, 150, 242)'),
  visible: true
};

export const useApply360AnnotationStyling = (
  imageCollection?: Image360Collection<DataSourceType>,
  styling?: ImageCollectionModelStyling
): void => {
  const viewer = useReveal();
  const [lastStyledImageAnnotations, setLastStyledImageAnnotations] = useState<
    Array<Image360Annotation<DataSourceType>>
  >([]);

  const abortController = useRef(new AbortController());

  const defaultStyle = styling?.defaultStyle ?? defaultStyling;
  const styleGroups = styling?.groups;

  const applyDefaultAnnotationStyling = useCallback(() => {
    if (imageCollection === undefined) return;
    lastStyledImageAnnotations.forEach((a) => {
      a.setColor(undefined);
    });
    setLastStyledImageAnnotations([]);
    imageCollection.setDefaultAnnotationStyle(defaultStyle);
    viewer.requestRedraw();
  }, [viewer, defaultStyle, styleGroups]);

  useEffect(() => {
    if (imageCollection === undefined) return;
    imageCollection.on('image360Entered', applyDefaultAnnotationStyling);

    return () => {
      imageCollection.off('image360Entered', applyDefaultAnnotationStyling);
    };
  }, [viewer, imageCollection]);

  useEffect(() => {
    if (!image360CollectionExists(imageCollection, viewer) || styleGroups === undefined) return;

    if (styleGroups.length === 0) {
      applyDefaultAnnotationStyling();
      abortController.current.abort();
      abortController.current = new AbortController();
    } else {
      void applyStyling(
        imageCollection,
        styleGroups,
        viewer,
        applyDefaultAnnotationStyling,
        setLastStyledImageAnnotations,
        abortController.current.signal
      );
    }
  }, [styleGroups, imageCollection]);
};

async function applyStyling(
  imageCollection: Image360Collection<DataSourceType>,
  styling: AnnotationIdStylingGroup[],
  viewer: Cognite3DViewer<DataSourceType>,
  applyDefaultAnnotationStyling: () => void,
  setLastStyledImageAnnotations: (annotations: Array<Image360Annotation<DataSourceType>>) => void,
  signal: AbortSignal
): Promise<void> {
  if (styling === undefined || styling.length === 0) return;

  for (const group of styling) {
    if (group.assetIds !== undefined) {
      const annotationInfoPromise = group.assetIds.map(async () => {
        return await imageCollection.findImageAnnotations({
          assetRef: { id: group.assetIds[0] }
        });
      });
      const annotationInfo = (await Promise.all(annotationInfoPromise)).flat();

      if (annotationInfo.length === 0 || signal.aborted) {
        return;
      }
      applyDefaultAnnotationStyling();

      annotationInfo.forEach((info) => {
        info.annotation.setColor(group.style.color);
      });
      setLastStyledImageAnnotations(annotationInfo.map((i) => i.annotation));

      viewer.requestRedraw();
    }
  }
}
