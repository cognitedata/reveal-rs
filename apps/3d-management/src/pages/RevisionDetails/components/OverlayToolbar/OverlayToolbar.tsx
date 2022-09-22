import React from 'react';
import { ToolBarButton, ToolBar, Slider, Icon } from '@cognite/cogs.js';
import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  THREE,
} from '@cognite/reveal';

import styled from 'styled-components';

const SliderContainer = styled.div`
  display: flex;
  width: 230px;
  border: 2px solid black;
  border-radius: 4px;
  > div {
    margin: 8px;
    text-align: center;
  }
`;

const PointSizeSlider = styled(Slider)`
  offset-anchor: right top;
  float: right;
  display: inline;
`;

const ClippingPlaneSlider = styled(Slider)`
  offset-anchor: right top;
  float: right;
  display: inline;
`;
const CenteredIcon = styled(Icon)`
  margin-left: auto;
  margin-right: auto;
  width: 50%;
  margin-top: auto;
  margin-bottom: auto;
  height: 50%;
`;

type Props = {
  viewer: Cognite3DViewer;
  model: Cognite3DModel | CognitePointCloudModel;
};
export function OverlayToolbar({ viewer, model }: Props) {
  const buttonGroups: ToolBarButton[][] = [
    [
      {
        icon: 'Scan',
        description: 'Fit camera to the model',
        onClick: () => viewer.fitCameraToModel(model, 400),
      },
    ],
  ];

  addClippingSlider();
  addPointSizeSliderIfApplicable();

  return (
    <ToolBar direction="horizontal">
      <ToolBar.ButtonGroup buttonGroup={buttonGroups[0]} />
    </ToolBar>
  );

  function addPointSizeSliderIfApplicable() {
    if (model instanceof CognitePointCloudModel) {
      const pointCloudModel = model;
      const pointSizeSlider = (
        <SliderContainer>
          <CenteredIcon type="Dot" />
          <PointSizeSlider
            min={0}
            max={1.0}
            step={0.01}
            defaultValue={model.pointSize}
            onChange={(pointSize) => {
              pointCloudModel.pointSize = pointSize;
            }}
          />
          <CenteredIcon type="DotLarge" />
        </SliderContainer>
      );
      const pointSizeTool: ToolBarButton = {
        icon: 'DotLarge',
        description: 'Point size',
        dropdownContent: pointSizeSlider,
      };
      buttonGroups[0].push(pointSizeTool);
    }
  }

  function addClippingSlider() {
    const bounds = model.getModelBoundingBox();
    const clippingPlaneSlider = (
      <SliderContainer>
        <CenteredIcon type="CubeBottom" />
        <ClippingPlaneSlider
          min={bounds.min.y}
          max={bounds.max.y}
          step={(bounds.max.y - bounds.min.y) / 250.0}
          defaultValue={bounds.max.y}
          onChange={(clippingYPosition) => {
            viewer.setClippingPlanes([
              new THREE.Plane(new THREE.Vector3(0, -1, 0), clippingYPosition),
            ]);
          }}
        />
        <CenteredIcon type="CubeTop" />
      </SliderContainer>
    );
    const pointSizeTool: ToolBarButton = {
      icon: 'ResizeHeight',
      description: 'Slice',
      dropdownContent: clippingPlaneSlider,
    };
    buttonGroups[0].push(pointSizeTool);
  }
}
