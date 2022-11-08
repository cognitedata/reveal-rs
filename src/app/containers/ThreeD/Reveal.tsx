import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSDK } from '@cognite/sdk-provider';
import styled from 'styled-components';
import { use3DModel } from './hooks';
import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  DefaultCameraManager,
  Intersection,
  ViewerState,
} from '@cognite/reveal';
import { Alert } from 'antd';
import { useQuery } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import RevealErrorFeedback from './RevealErrorFeedback';
import { PointerEventDelegate } from '@cognite/reveal';
import { usePrevious } from '@cognite/data-exploration';
import { useViewerDoubleClickListener } from './hooks/useViewerDoubleClickListener';
import { ThreeDContext } from './ThreeDContext';

type Props = {
  modelId: number;
  revisionId: number;
  nodesSelectable: boolean;
  initialViewerState?: ViewerState;
  selectedAsset?: number;
  onViewerClick?: (intersection: Intersection | null) => void;
};

export function Reveal({
  modelId,
  revisionId,
  nodesSelectable,
  initialViewerState,
  selectedAsset,
  onViewerClick,
}: Props) {
  const context = useContext(ThreeDContext);
  const { setViewer, set3DModel, setPointCloudModel } = context;
  const numOfClicks = useRef<number>(0);
  const clickTimer = useRef<NodeJS.Timeout>();
  const sdk = useSDK();

  const [revealContainer, setRevealContainer] = useState<HTMLDivElement | null>(
    null
  );

  const handleMount = useCallback(
    (node: HTMLDivElement | null) => setRevealContainer(node),
    []
  );

  const {
    data: apiThreeDModel,
    isFetched: isModelFetched,
    isError: isModelError,
  } = use3DModel(modelId);

  const viewer = useMemo(() => {
    if (!revealContainer) {
      return;
    }

    return new Cognite3DViewer({
      sdk,
      domElement: revealContainer!,
      continuousModelStreaming: true,
      loadingIndicatorStyle: {
        placement: 'bottomRight',
        opacity: 1,
      },
    });
  }, [revealContainer, sdk]);

  useEffect(() => {
    if (setViewer) {
      setViewer(viewer);
    }
  }, [setViewer, viewer]);

  const { data: models } = useQuery(
    ['reveal-model', modelId, revisionId],
    async () => {
      if (!viewer) {
        return Promise.reject('Viewer missing');
      }
      const model = await viewer.addModel({
        modelId: modelId,
        revisionId,
      });

      viewer.loadCameraFromModel(model);
      if (initialViewerState) {
        viewer.setViewState(initialViewerState);
      }
      const threeDModel = model instanceof Cognite3DModel ? model : undefined;
      const pointCloudModel =
        model instanceof CognitePointCloudModel ? model : undefined;
      if (set3DModel) {
        set3DModel(threeDModel);
      }
      if (setPointCloudModel) {
        setPointCloudModel(pointCloudModel);
      }

      return { threeDModel, pointCloudModel };
    },
    {
      enabled: !!viewer,
      cacheTime: 0,
    }
  );

  const { threeDModel } = models || {
    threeDModel: undefined,
    pointCloudModel: undefined,
  };

  useEffect(() => () => viewer?.dispose(), [viewer]);

  useEffect(() => {
    if (!viewer) {
      return;
    }
    const cameraManager = viewer.cameraManager as DefaultCameraManager;
    cameraManager.setCameraControlsOptions({
      mouseWheelAction: selectedAsset ? 'zoomToTarget' : 'zoomToCursor',
    });
  }, [selectedAsset, viewer]);

  const _onViewerClick: PointerEventDelegate = useCallback(
    async ({ offsetX, offsetY }) => {
      if (!threeDModel || !viewer || !nodesSelectable) {
        return;
      }
      numOfClicks.current++;
      if (numOfClicks.current === 1) {
        clickTimer.current = setTimeout(async () => {
          const intersection = await viewer.getIntersectionFromPixel(
            offsetX,
            offsetY
          );
          if (onViewerClick) {
            onViewerClick(intersection);
          }

          clearTimeout(clickTimer.current);
          numOfClicks.current = 0;
        }, 250);
      }
      if (numOfClicks.current === 2) {
        // it is the second click in double-click event
        clearTimeout(clickTimer.current);
        numOfClicks.current = 0;
      }
    },
    [nodesSelectable, onViewerClick, threeDModel, viewer]
  );
  const previousClickHandler = usePrevious(_onViewerClick);

  useEffect(() => {
    if (!viewer) {
      return;
    }
    if (previousClickHandler) {
      viewer.off('click', previousClickHandler);
    }
    viewer.on('click', _onViewerClick);
  }, [_onViewerClick, previousClickHandler, viewer]);

  useViewerDoubleClickListener({
    viewer: viewer!,
    model: threeDModel!,
    nodesSelectable: nodesSelectable,
  });

  if (isModelError || (isModelFetched && !apiThreeDModel) || !revisionId) {
    return (
      <Alert
        type="error"
        message="Error"
        description="An error occurred retrieving the resource. Make sure you have access to this resource type."
        style={{ marginTop: '50px' }}
      />
    );
  }

  return <RevealContainer id="revealContainer" ref={handleMount} />;
}

// This container has an inline style 'position: relative' given by @cognite/reveal.
// We can not cancel it, so we had to use that -85px trick here!
const RevealContainer = styled.div`
  height: 100%;
  width: 100%;
  max-height: 100%;
  max-width: 100%;
`;

export default function RevealWithErrorBoundary(props: Props) {
  return (
    /* This is aparantly an issue because of multiple versions of @types/react. Error fallback
    // seems to work.
    @ts-ignore */
    <ErrorBoundary FallbackComponent={RevealErrorFeedback}>
      <Reveal {...props} />
    </ErrorBoundary>
  );
}
