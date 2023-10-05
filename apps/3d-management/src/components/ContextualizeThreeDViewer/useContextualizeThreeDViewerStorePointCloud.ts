import { create } from 'zustand';

import { Cognite3DViewer, PointColorType } from '@cognite/reveal';
import { AnnotationModel } from '@cognite/sdk';

import { DEFAULT_POINT_SIZE } from '../../pages/ContextualizeEditor/constants';

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
  NONE = 'none',
  ADD_ANNOTATION = 'addAnnotation',
  DELETE_ANNOTATION = 'deleteAnnotation',
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
};

const initialState: RootState = {
  pendingAnnotation: null,
  isResourceSelectorOpen: true,
  threeDViewer: null,
  tool: ToolType.NONE,
  shouldShowBoundingVolumes: false,
  shouldShowWireframes: true,
  modelId: null,
  isModelLoaded: false,
  annotations: null,
  visualizationOptions: DEFAULT_VISUALIZATION_OPTIONS,
};

export const useContextualizeThreeDViewerStorePointCloud = create<RootState>(
  () => initialState
);

export const onOpenResourceSelector = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: true,
  }));
};

export const onCloseResourceSelector = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    isResourceSelectorOpen: false,
    pendingAnnotation: null,
  }));
};

export const setPendingAnnotation = (annotation: CubeAnnotation | null) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    pendingAnnotation: annotation,
    isResourceSelectorOpen:
      annotation !== null || prevState.isResourceSelectorOpen,
  }));
};

export const setThreeDViewer = (viewer: Cognite3DViewer) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    threeDViewer: viewer,
  }));
};

export const setModelLoaded = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    isModelLoaded: true,
  }));
};

export const setTool = (tool: ToolType) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    tool,
    pendingAnnotation: null,
  }));
};

export const setAnnotations = (annotations: AnnotationModel[]) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    annotations: annotations,
  }));
};

export const toggleShouldShowBoundingVolumes = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    shouldShowBoundingVolumes: !prevState.shouldShowBoundingVolumes,
  }));
};

export const toggleShouldShowWireframes = () => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    shouldShowWireframes: !prevState.shouldShowWireframes,
  }));
};

export const setModelId = (modelId: number) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    modelId,
  }));
};

export const updateVisualizationOptions = (
  visualizationOptions: Partial<VisualizationOptions>
) => {
  useContextualizeThreeDViewerStorePointCloud.setState((prevState) => ({
    ...prevState,
    visualizationOptions: {
      ...prevState.visualizationOptions,
      ...visualizationOptions,
    },
  }));
};
