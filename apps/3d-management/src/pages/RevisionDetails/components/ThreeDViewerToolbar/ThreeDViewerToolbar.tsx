import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  PotreePointColorType,
} from '@cognite/reveal';
import React from 'react';
import * as THREE from 'three';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import message from 'antd/lib/message';
import * as Sentry from '@sentry/browser';
import zIndex from 'src/utils/zIndex';
import * as FileActions from 'src/store/modules/File/index';
import * as RevisionActions from 'src/store/modules/Revision/index';
import {
  Legacy3DModel,
  Legacy3DViewer,
} from 'src/pages/RevisionDetails/components/ThreeDViewer/legacyViewerTypes';
import { ToolbarTreeView } from 'src/pages/RevisionDetails/components/ThreeDViewerToolbar/ToolbarTreeView';
import { isOldViewer } from 'src/utils';
import MessageType from 'src/AntdMessage';
import { useFlag } from '@cognite/react-feature-flags';
import { isDevelopment } from '@cognite/cdf-utilities';
import { EditRotation } from './EditRotation';
import { ThumbnailUploader } from './ThumbnailUploader';
import { ColorTypePicker } from './ColorTypePicker';
import { ClassPicker } from './ClassPicker';

const CONTAINER_PADDING = 8;
const CONTAINER_WIDTH = 400;
const DEFAULT_MARGIN = 16;
const SCROLLBAR_WIDTH = 2;

const ToolbarContainer = styled.div`
  position: absolute;
  padding: ${CONTAINER_PADDING}px;
  top: 0;
  right: 0;
  height: 100%;
  width: ${CONTAINER_WIDTH}px;
  display: flex;
  flex-direction: column;
  z-index: ${zIndex.DEFAULT};
  background-color: #fff;
  border: 1px solid var(--cogs-greyscale-grey3);
`;

const MenuSection = styled.div`
  &:not(:first-child) {
    margin-top: ${DEFAULT_MARGIN}px;
  }
  width: fit-content;
`;

type RevisionUpdatePayload = {
  modelId: number;
  revisionId: number;
  published?: boolean;
  rotation?: v3.Tuple3<number>;
  camera?: v3.RevisionCameraProperties;
};
type OwnProps = {
  viewer: Cognite3DViewer | Legacy3DViewer;
  model: Cognite3DModel | CognitePointCloudModel | Legacy3DModel;
};
type DispatchProps = {
  updateRevision: (payload: RevisionUpdatePayload) => Promise<void>;
};

type Props = OwnProps & DispatchProps;

function ThreeDViewerToolbar(props: Props) {
  React.useEffect(() => {
    (window as any).model = props.model;
    (window as any).viewer = props.viewer;
  }, [props.model, props.viewer]);

  const treeViewIsHiddenByFeatureFlag =
    useFlag('3DM_tree_view_hidden') && !isDevelopment();

  const onRotationChange = (rotationMatrix: THREE.Matrix4) => {
    if ('setModelTransformation' in props.model) {
      const matrix = props.model.getModelTransformation();
      const newMatrix = new THREE.Matrix4().multiplyMatrices(
        matrix,
        rotationMatrix
      );
      props.model.setModelTransformation(newMatrix);
    } else {
      // @ts-ignore old viewer uses old THREE with applyMatrix instead of applyMatrix4
      props.model.applyMatrix(rotationMatrix);
      props.model.updateMatrixWorld(false);
    }

    if (props.viewer instanceof Cognite3DViewer) {
      props.viewer.forceRerender();
    } else {
      props.viewer.fitCameraToModel(props.model as any, 0);

      // force render hacks are required to render model correctly, otherwise some parts might not be rendered after rotation
      // @ts-ignore
      // eslint-disable-next-line
      props.viewer._forceRendering = true;
      // @ts-ignore
      // eslint-disable-next-line
      props.viewer._animate();
      requestAnimationFrame(() => {
        if (props && props.viewer) {
          // @ts-ignore
          // eslint-disable-next-line
          props.viewer._forceRendering = false;
        }
      });
    }
  };

  const onEditRotationDone = async (rotation: v3.Tuple3<number>) => {
    const [rotationX, rotationY, rotationZ] = rotation;
    if (rotationX || rotationY || rotationZ) {
      const progressMessage = message.loading(
        'Uploading model rotation...'
      ) as MessageType;
      const rotationEuler = new THREE.Euler();
      let tmpMatrix: THREE.Matrix4;
      if ('getModelTransformation' in props.model) {
        tmpMatrix = props.model.getModelTransformation();
      } else {
        tmpMatrix = props.model.matrix.clone();
      }

      // for pointcloud it just works without that
      if (props.model instanceof Cognite3DModel) {
        // Undo the default 90 degrees on X axis shift
        tmpMatrix.premultiply(
          new THREE.Matrix4().makeRotationFromEuler(
            new THREE.Euler(Math.PI / 2, 0, 0)
          )
        );
      }

      // Fetch actual location radians
      rotationEuler.setFromRotationMatrix(tmpMatrix);

      try {
        // Update revision with correct starting location and correct rotation
        await updateInitialLocation({
          rotation: rotationEuler.toArray().slice(0, 3),
        });

        progressMessage.then(() =>
          message.success('Model rotation is updated.')
        );
      } catch (e) {
        progressMessage.then(() => {
          message.error("Couldn't update model initial location");
        });
        Sentry.captureException(e);
      }
    }
  };

  const updateInitialLocation = async (
    otherUpdates?: Partial<RevisionUpdatePayload>
  ) => {
    // Get camera position and target for upload
    const position = props.viewer.getCameraPosition();
    const target = props.viewer.getCameraTarget();

    // Convert camera position and target to model space
    const inverseModelMatrix = new THREE.Matrix4();
    if (props.model instanceof Cognite3DModel) {
      props.model.mapPositionFromModelToCdfCoordinates(position, position);
      props.model.mapPositionFromModelToCdfCoordinates(target, target);
    } else {
      // Get inverse transformation matrix to compute camera position and target in model space
      inverseModelMatrix.getInverse(props.model.matrix);
      position.applyMatrix4(inverseModelMatrix);
      target.applyMatrix4(inverseModelMatrix);
    }

    await props.updateRevision({
      modelId: props.model.modelId,
      revisionId: props.model.revisionId,
      camera: {
        position: position.toArray(),
        target: target.toArray(),
      },
      ...otherUpdates,
    });
  };

  const showTreeView =
    !treeViewIsHiddenByFeatureFlag &&
    !(props.model instanceof CognitePointCloudModel) &&
    !isOldViewer(props.viewer);

  return (
    <ToolbarContainer>
      <div>
        <MenuSection>
          <ThumbnailUploader
            onUploadDone={updateInitialLocation}
            getScreenshot={(w, h) => props.viewer.getScreenshot(w, h)}
            modelId={props.model.modelId}
            revisionId={props.model.revisionId}
          />
        </MenuSection>

        <MenuSection>
          <EditRotation
            onRotationChange={onRotationChange}
            onEditRotationDone={onEditRotationDone}
          />
        </MenuSection>

        {props.model instanceof CognitePointCloudModel && (
          <MenuSection style={{ display: 'flex' }}>
            <ColorTypePicker
              onChange={(colorType: PotreePointColorType) => {
                if (props.model instanceof CognitePointCloudModel) {
                  // eslint-disable-next-line no-param-reassign
                  props.model.pointColorType = colorType;
                }
              }}
            />

            <div style={{ marginLeft: DEFAULT_MARGIN }}>
              <ClassPicker model={props.model} />
            </div>
          </MenuSection>
        )}
      </div>

      {showTreeView && (
        <>
          <div
            style={{
              marginTop: DEFAULT_MARGIN,
            }}
          >
            <hr />
          </div>
          <ToolbarTreeView
            style={{
              marginTop: DEFAULT_MARGIN,
            }}
            width={CONTAINER_WIDTH - 2 * CONTAINER_PADDING - SCROLLBAR_WIDTH}
            model={props.model as Cognite3DModel}
          />
        </>
      )}
    </ToolbarContainer>
  );
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return bindActionCreators<any, any>(
    { ...FileActions, ...RevisionActions },
    dispatch
  );
}

export default connect(null, mapDispatchToProps)(ThreeDViewerToolbar);
