import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  currentCollection,
  deSelectAllCollections,
  deselectAllKeypoints,
  nextKeyPoint,
  nextShape,
} from 'src/modules/Review/store/imagePreviewSlice';
import { RootState } from 'src/store/rootReducer';
import {
  deselectAllAnnotations,
  selectVisibleNonRejectedAnnotationsByFileId,
  VisibleAnnotation,
} from 'src/modules/Review/store/previewSlice';
import { Annotation } from 'src/api/types';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { ReactImageAnnotateWrapper } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ReactImageAnnotateWrapper';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { CreateAnnotations } from 'src/store/thunks/Annotation/CreateAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import { KeypointVertex } from 'src/utils/AnnotationUtils';
import { pushMetric } from 'src/utils/pushMetric';

export const ImagePreview = ({
  file,
  onEditMode,
}: {
  file: FileInfo;
  onEditMode: (editMode: boolean) => void;
}) => {
  const dispatch = useDispatch();
  const visibleNonRejectedAnnotations = useSelector(
    ({ previewSlice }: RootState) =>
      selectVisibleNonRejectedAnnotationsByFileId(
        previewSlice,
        String(file.id)
      ) as VisibleAnnotation[]
  );

  const selectedAnnotationIds = useSelector(
    (state: RootState) => state.previewSlice.selectedAnnotationIds
  );

  const definedCollection = useSelector(
    ({ imagePreviewReducer }: RootState) =>
      imagePreviewReducer.predefinedCollections
  );

  const currentShape = useSelector(({ imagePreviewReducer }: RootState) =>
    nextShape(imagePreviewReducer)
  );

  const nextPoint = useSelector(({ imagePreviewReducer }: RootState) =>
    nextKeyPoint(imagePreviewReducer)
  );

  const currentKeypointCollection = useSelector(
    ({ imagePreviewReducer }: RootState) =>
      currentCollection(imagePreviewReducer)
  );

  const selectedKeypointIds = useSelector(
    (state: RootState) => state.imagePreviewReducer.keypointMap.selectedIds
  );

  const annotations: VisibleAnnotation[] = useMemo(() => {
    return visibleNonRejectedAnnotations.map((ann) => {
      let value: VisibleAnnotation = { ...ann, selected: false };
      if (selectedAnnotationIds.includes(ann.id)) {
        value = { ...ann, selected: true };
      }

      if (value.data?.keypoint) {
        const keypoints = value.region?.vertices.map((keypointVertex) => ({
          ...(keypointVertex as KeypointVertex),
          selected: selectedKeypointIds.includes(
            (keypointVertex as KeypointVertex).id
          ),
        }));
        value = {
          ...value,
          region: {
            vertices: keypoints as KeypointVertex[],
            shape: value.region!.shape,
          },
        };
      }
      return value;
    });
  }, [
    visibleNonRejectedAnnotations,
    selectedAnnotationIds,
    selectedKeypointIds,
  ]);

  const handleCreateAnnotation = (annotation: UnsavedAnnotation) => {
    pushMetric('Vision.Review.CreateAnnotation');

    if (annotation?.region?.shape === 'rectangle') {
      pushMetric('Vision.Review.CreateAnnotation.Rectangle');
    }
    if (annotation?.region?.shape === 'points') {
      pushMetric('Vision.Review.CreateAnnotation.Points');
    }
    if (annotation?.region?.shape === 'polygon') {
      pushMetric('Vision.Review.CreateAnnotation.Polygon');
    }
    dispatch(CreateAnnotations({ fileId: file.id, annotation }));
  };

  const handleModifyAnnotation = async (annotation: Annotation) => {
    await dispatch(UpdateAnnotations([annotation]));
    dispatch(deselectAllAnnotations());
    dispatch(deSelectAllCollections());
    dispatch(deselectAllKeypoints());
  };

  const handleDeleteAnnotation = (annotation: Annotation) => {
    dispatch(
      DeleteAnnotationsAndHandleLinkedAssetsOfFile({
        annotationIds: [annotation.id],
        showWarnings: true,
      })
    );
  };

  const handleInEditMode = (mode: boolean) => {
    onEditMode(mode);
  };

  return (
    <ReactImageAnnotateWrapper
      fileInfo={file}
      annotations={annotations}
      onCreateAnnotation={handleCreateAnnotation}
      onUpdateAnnotation={handleModifyAnnotation}
      onDeleteAnnotation={handleDeleteAnnotation}
      handleInEditMode={handleInEditMode}
      collection={definedCollection}
      currentShape={currentShape}
      nextKeyPoint={nextPoint}
      currentCollection={currentKeypointCollection}
    />
  );
};
