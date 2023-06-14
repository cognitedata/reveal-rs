import { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppStateContext } from '@interactive-diagrams-app/context';
import { useAnnotationsForFiles } from '@interactive-diagrams-app/hooks';
import { itemSelector as assetSelector } from '@interactive-diagrams-app/modules/assets';
import { itemSelector as fileSelector } from '@interactive-diagrams-app/modules/files';
import { startConvertFileToSvgJob } from '@interactive-diagrams-app/modules/svgConvert';
import { Vertices } from '@interactive-diagrams-app/modules/types';
import {
  boundingBoxToVertices,
  getTaggedAnnotationBoundingBox,
  isTaggedAnnotationsApiAnnotation,
  isTaggedEventAnnotation,
  TaggedAnnotation,
} from '@interactive-diagrams-app/modules/workflows';
import { RootState } from '@interactive-diagrams-app/store';
import { ThunkDispatch } from '@reduxjs/toolkit';
import isEqual from 'lodash/isEqual';
import { AnyAction } from 'redux';
import { createSelector } from 'reselect';

import { FileInfo } from '@cognite/sdk';

import getAssetIdsFromTaggedAnnotations from '../utils/getAssetIdsFromTaggedAnnotations';

type DiagramToConvert = {
  fileName: string;
  fileId: number;
  annotations: {
    text: string;
    region: { shape: string; vertices: Vertices };
  }[];
  assetIds: number[];
};

export const useConvertToSVG = (fileIds: number[]) => {
  const dispatch = useDispatch<ThunkDispatch<any, void, AnyAction>>();
  const { svgPrefix, prefixType } = useContext(AppStateContext);
  const [isConverting, setIsConverting] = useState(false);
  const { diagramsToConvert, nrOfPendingDiagramsToConvert } =
    useDiagramsToConvert(fileIds);
  const { status: convertStatus, svgId } = useSelector(
    (state: RootState) => state.svgConvert[fileIds[0]] ?? {}
  );

  useEffect(() => {
    if (
      convertStatus &&
      convertStatus !== 'Completed' &&
      convertStatus !== 'Failed'
    )
      setIsConverting(true);
    else setIsConverting(false);
  }, [convertStatus]);

  const convertDiagramsToSVG = async () => {
    if (diagramsToConvert?.length)
      dispatch(
        startConvertFileToSvgJob.action({
          diagrams: diagramsToConvert,
          prefix: prefixType === 'custom' ? svgPrefix : undefined,
        })
      );
  };

  return {
    convertDiagramsToSVG,
    nrOfPendingDiagramsToConvert,
    convertStatus,
    svgId,
    isConverting,
  };
};

export const useDiagramsToConvert = (fileIds: number[]) => {
  const getFile: any = useSelector(fileSelector);
  const labelsForAnnotations = useSelector(selectLabelsForAnnotations);
  const { annotations: annotationsMap } = useAnnotationsForFiles(fileIds);

  const [diagramsToConvert, setDiagramsToConvert] = useState<
    DiagramToConvert[]
  >([]);
  const [nrOfPendingDiagramsToConvert, setNrOfpendingDiagramsToConvert] =
    useState<number>(0);

  useEffect(() => {
    const pendingDiagrams = fileIds.filter(
      (fileId: number) =>
        Boolean(annotationsMap[fileId]) &&
        annotationsMap[fileId].find((taggedAnnotation) => {
          if (isTaggedEventAnnotation(taggedAnnotation)) {
            return taggedAnnotation.annotation.status === 'unhandled';
          }

          return taggedAnnotation.annotation.status === 'suggested';
        })
    ).length;
    const diagrams = fileIds
      .filter((fileId: number) => Boolean(annotationsMap[fileId]))
      .map((fileId: number) => {
        const annotations = annotationsMap[fileId].filter(
          (taggedAnnotation) => {
            if (isTaggedEventAnnotation(taggedAnnotation)) {
              return taggedAnnotation.annotation.status === 'verified';
            }

            return taggedAnnotation.annotation.status === 'approved';
          }
        );
        const file: FileInfo = getFile(fileId);

        const [item] = getAssetIdsFromTaggedAnnotations(annotations);
        const assetIds = Array.from(item?.assetIds ?? []) as number[];

        const annotationsWithLabels = labelsForAnnotations(annotations);
        const mappedAnnotations = annotationsWithLabels
          .map(({ taggedAnnotation, label }) => {
            const boundingBox =
              getTaggedAnnotationBoundingBox(taggedAnnotation);
            if (boundingBox === undefined) {
              return undefined;
            }
            return {
              text: label,
              region: {
                shape: 'rectangle',
                vertices: boundingBoxToVertices(boundingBox),
              },
            };
          })
          .filter((annotation) => annotation !== undefined);
        return {
          fileName: file?.name ?? '',
          fileId,
          annotations: mappedAnnotations,
          assetIds,
        };
      });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore ignoring for the sake of this migration
    if (!isEqual(diagrams, diagramsToConvert)) setDiagramsToConvert(diagrams);
    if (!isEqual(pendingDiagrams, nrOfPendingDiagramsToConvert))
      setNrOfpendingDiagramsToConvert(pendingDiagrams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileIds, annotationsMap]);

  return { diagramsToConvert, nrOfPendingDiagramsToConvert };
};

const getSafeLabel = (
  taggedAnnotation: TaggedAnnotation,
  label: string | undefined
): string => {
  if (label !== undefined) {
    return label;
  }

  if (
    isTaggedEventAnnotation(taggedAnnotation) &&
    taggedAnnotation.annotation.label !== undefined
  ) {
    return taggedAnnotation.annotation.label;
  }

  if (
    isTaggedAnnotationsApiAnnotation(taggedAnnotation) &&
    // @ts-expect-error adding comment to suppress eslint error during migration into monorepo
    taggedAnnotation.annotation.data.text !== undefined
  ) {
    // @ts-expect-error adding comment to suppress eslint error during migration into monorepo
    return taggedAnnotation.annotation.data.text;
  }

  return 'No label';
};

export const selectLabelsForAnnotations = createSelector(
  assetSelector,
  fileSelector,
  (assets: any, files: any) => (taggedAnnotations: TaggedAnnotation[]) => {
    const annotationLabel = (taggedAnnotation: TaggedAnnotation) => {
      if (isTaggedEventAnnotation(taggedAnnotation)) {
        switch (taggedAnnotation.annotation.resourceType) {
          case 'asset': {
            const asset = assets(
              taggedAnnotation.annotation.resourceExternalId ||
                taggedAnnotation.annotation.resourceId
            );
            return asset?.name;
          }
          case 'file': {
            const file = files(
              taggedAnnotation.annotation.resourceExternalId ||
                taggedAnnotation.annotation.resourceId
            );
            return file?.name;
          }
          default:
            return undefined;
        }
      }

      switch (taggedAnnotation.annotation.annotationType) {
        case 'diagrams.AssetLink': {
          const asset = assets(
            // @ts-expect-error adding comment to suppress eslint error during migration into monorepo
            taggedAnnotation.annotation.data.assetRef.externalId ||
              // @ts-expect-error adding comment to suppress eslint error during migration into monorepo
              taggedAnnotation.annotation.data.assetRef.id
          );
          return asset?.name;
        }
        case 'diagrams.FileLink': {
          const file = files(
            // @ts-expect-error adding comment to suppress eslint error during migration into monorepo
            taggedAnnotation.annotation.data.fileRef.externalId ||
              // @ts-expect-error adding comment to suppress eslint error during migration into monorepo
              taggedAnnotation.annotation.data.fileRef.id
          );
          return file?.name;
        }
        default:
          return undefined;
      }
    };
    return taggedAnnotations.map((taggedAnnotation) => {
      const label = getSafeLabel(
        taggedAnnotation,
        annotationLabel(taggedAnnotation)
      );

      return {
        taggedAnnotation,
        label,
      };
    });
  }
);
