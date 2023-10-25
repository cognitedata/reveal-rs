import isEqual from 'lodash/isEqual';
import { create } from 'zustand';

import { Cognite3DViewer, PointColorType } from '@cognite/reveal';
import { AnnotationModel } from '@cognite/sdk';

import { DEFAULT_POINT_SIZE } from '../../pages/ContextualizeEditor/constants';

import { TransformMode } from './utils/createTransformControls';

export type ThreeDPosition = {
  x: number;
  y: number;
  z: number;
};

export type CubeAnnotation = {
  position: ThreeDPosition;
  size: ThreeDPosition;
};

type VisualizationOptions = { pointSize: number; pointColor: PointColorType };
const DEFAULT_VISUALIZATION_OPTIONS: VisualizationOptions = {
  pointSize: DEFAULT_POINT_SIZE,
  pointColor: PointColorType.Rgb,
};

export enum ToolType {
  SELECT_TOOL = 'selectTool',
  ADD_ANNOTATION = 'addAnnotation',
}

type RootState = {
  pendingAnnotation: CubeAnnotation | null;
  isResourceSelectorOpen: boolean;
  threeDViewer: Cognite3DViewer | null;
  tool: ToolType;
  shouldShowBoundingVolumes: boolean;
  shouldShowWireframes: boolean;
  modelId: number | null;
  isModelLoaded: boolean;
  annotations: AnnotationModel[] | null;
  visualizationOptions: VisualizationOptions;
  transformMode: TransformMode | null;
  hoveredAnnotationId: number | null;
  selectedAnnotationId: number | null;
};

const initialState: RootState = {
  pendingAnnotation: null,
  isResourceSelectorOpen: true,
  threeDViewer: null,
  tool: ToolType.ADD_ANNOTATION,
  shouldShowBoundingVolumes: false,
  shouldShowWireframes: true,
  modelId: null,
  isModelLoaded: false,
  annotations: null,
  visualizationOptions: DEFAULT_VISUALIZATION_OPTIONS,
  transformMode: null,
  hoveredAnnotationId: null,
  selectedAnnotationId: null,
};

export const useContextualizeThreeDViewerStore = create<RootState>(
  () => initialState
);

export const onOpenResourceSelector = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: true,
  }));
};

export const onCloseResourceSelector = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: false,
    pendingAnnotation: null,
  }));
};

export const setPendingAnnotation = (annotation: CubeAnnotation | null) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    pendingAnnotation: annotation,
    isResourceSelectorOpen:
      annotation !== null || prevState.isResourceSelectorOpen,
  }));
};

export const updatePendingAnnotation = (deltaAnnotation: {
  position: ThreeDPosition;
  scale: ThreeDPosition;
}) => {
  useContextualizeThreeDViewerStore.setState((prevState) => {
    const { pendingAnnotation } = prevState;
    if (pendingAnnotation === null) return prevState;

    const wouldNotUpdatePendingAnnotation =
      isEqual(pendingAnnotation.position, deltaAnnotation.position) &&
      isEqual(deltaAnnotation.scale, { x: 1, y: 1, z: 1 });
    if (wouldNotUpdatePendingAnnotation) return prevState;

    return {
      ...prevState,
      pendingAnnotation: {
        position: deltaAnnotation.position,
        size: {
          x: pendingAnnotation.size.x * Math.abs(deltaAnnotation.scale.x),
          y: pendingAnnotation.size.y * Math.abs(deltaAnnotation.scale.y),
          z: pendingAnnotation.size.z * Math.abs(deltaAnnotation.scale.z),
        },
      },
    };
  });
};

export const setThreeDViewer = (model: Cognite3DViewer) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    threeDViewer: model,
  }));
};

export const setModelLoaded = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    isModelLoaded: true,
  }));
};

export const setTool = (tool: ToolType) => {
  const isSelectTool = tool === ToolType.SELECT_TOOL;
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    tool,
    pendingAnnotation: null,
    selectedAnnotationId: isSelectTool ? prevState.selectedAnnotationId : null,
  }));
};

export const setAnnotations = (annotations: AnnotationModel[]) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    annotations: annotations,
  }));
};

export const toggleShouldShowBoundingVolumes = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    shouldShowBoundingVolumes: !prevState.shouldShowBoundingVolumes,
  }));
};

export const toggleShouldShowWireframes = () => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    shouldShowWireframes: !prevState.shouldShowWireframes,
  }));
};

export const setModelId = (modelId: number) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    modelId,
  }));
};

export const updateVisualizationOptions = (
  visualizationOptions: Partial<VisualizationOptions>
) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    visualizationOptions: {
      ...prevState.visualizationOptions,
      ...visualizationOptions,
    },
  }));
};

export const setTransformMode = (transformMode: TransformMode | null) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    transformMode:
      prevState.transformMode === transformMode ? null : transformMode,
  }));
};

export const setHoveredAnnotationId = (annotationId: number | null) => {
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    hoveredAnnotationId: annotationId,
  }));
};

export const setSelectedAnnotationId = (annotationId: number | null) => {
  const prevSelectedAnnotationId =
    useContextualizeThreeDViewerStore.getState().selectedAnnotationId;
  if (annotationId === prevSelectedAnnotationId) {
    return;
  }
  useContextualizeThreeDViewerStore.setState((prevState) => ({
    ...prevState,
    selectedAnnotationId: annotationId,
  }));
};

export const resetContextualizeThreeDViewerStore = () => {
  useContextualizeThreeDViewerStore.setState(initialState);
};
