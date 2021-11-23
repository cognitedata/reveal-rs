import React, { useEffect, useRef, useState } from 'react';
import { Collapse, Input } from 'antd';
import { ColorPicker } from 'src/modules/Common/Components/ColorPicker/ColorPicker';
import { getRandomColor } from 'src/modules/Review/Components/AnnotationSettingsModal/utill';
import {
  AnnotationCollection,
  Keypoint,
  KeypointCollection,
} from 'src/modules/Review/types';
import styled from 'styled-components';
import { CaretRightOutlined } from '@ant-design/icons';
import { Body, Button, Detail, Tooltip } from '@cognite/cogs.js';
import { NO_EMPTY_LABELS_MESSAGE } from 'src/constants/AnnotationSettings';
import isEmpty from 'lodash-es/isEmpty';
import { Header } from './Header';
import { renderEmptyAnnotationMessage } from './EmptyAnnotationInfo';

const { Panel } = Collapse;

type NewKeypoints = {
  collectionName: string;
  keypoints: {
    caption: string;
    color: string;
  }[];
};

const handleClick = (evt: any) => {
  // dummy handler to stop event propagation
  evt.stopPropagation();
};

const validNewKeypoint = (newKeypoints: NewKeypoints | undefined) => {
  if (newKeypoints) {
    const { collectionName, keypoints } = newKeypoints;
    if (collectionName === '') return false;

    const keypointCaptions = keypoints.map((keypoint) => keypoint.caption);
    if (keypointCaptions.includes('')) return false;
  }
  return true;
};

export const Keypoints = ({
  collections,
  setCollections,
  options,
}: {
  collections: AnnotationCollection;
  setCollections: (collection: AnnotationCollection) => void;
  options?: { createNew?: { text?: string } };
}) => {
  const { predefinedKeypoints } = collections;
  const [newKeypoints, setNewKeypoints] =
    useState<NewKeypoints | undefined>(undefined);
  const keypointPanelRef = useRef<HTMLDivElement | null>(null);

  const addNewKeypoint = () => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      keypoints.push({
        caption: '',
        color: getRandomColor(),
      });
      setNewKeypoints({
        ...newKeypoints,
        keypoints: [...keypoints],
      });
    }
  };

  const addNewKeypointGroup = (newKeypointGroup?: { text?: string }) => {
    setNewKeypoints({
      collectionName: newKeypointGroup?.text || '',
      keypoints: [{ caption: '', color: getRandomColor() }],
    });
  };

  const updateColor = (index: number, value: string) => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      keypoints[index].color = value;
      setNewKeypoints({
        ...newKeypoints,
        keypoints: [...keypoints],
      });
    }
  };
  const updateCaption = (index: number, value: string) => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      keypoints[index].caption = value;
      setNewKeypoints({
        ...newKeypoints,
        keypoints: [...keypoints],
      });
    }
  };
  const onDeleteKeypoint = (index: number) => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      keypoints.splice(index, 1);

      setNewKeypoints({
        ...newKeypoints,
        keypoints: [...keypoints],
      });
    }
  };
  const onFinish = () => {
    if (newKeypoints) {
      const { collectionName, keypoints } = newKeypoints;
      const structuredNewKeypoints: Keypoint[] = keypoints.map(
        (keypoint, index) => ({
          ...keypoint,
          order: `${index + 1}`,
        })
      );
      setCollections({
        ...collections,
        predefinedKeypoints: [
          ...collections.predefinedKeypoints,
          {
            collectionName,
            keypoints: structuredNewKeypoints,
          },
        ],
      });
      setNewKeypoints(undefined);
    }
  };

  const scrollToBottom = () => {
    const elm = keypointPanelRef.current;
    if (elm) {
      elm.scrollTop = elm.scrollHeight - elm.clientHeight;
    }
  };

  // create new keypoint on settings open
  useEffect(() => {
    if (options) {
      if (!isEmpty(options.createNew)) {
        addNewKeypointGroup(options.createNew);
      }
    }
  }, [options]);

  useEffect(() => {
    scrollToBottom();
  }, [newKeypoints, predefinedKeypoints]);

  return (
    <>
      <Header
        title="Keypoints"
        count={predefinedKeypoints.length}
        disabledMessage={newKeypoints && 'Finish before creating a new one'}
        onClickNew={() => addNewKeypointGroup()}
      />
      <CollapsePanel ref={keypointPanelRef}>
        <Collapse
          bordered={false}
          defaultActiveKey={['new']}
          expandIconPosition="left"
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              style={{ color: '#595959' }}
              rotate={isActive ? 270 : 90}
            />
          )}
        >
          {predefinedKeypoints.length ? (
            predefinedKeypoints.map(
              (keypointCollection: KeypointCollection) => (
                <Panel
                  header={
                    <PanelHeader>
                      <Body level={2}>{keypointCollection.collectionName}</Body>
                    </PanelHeader>
                  }
                  key={keypointCollection.collectionName}
                >
                  <PanelBody>
                    <Row>
                      <OrderDetail style={{ marginLeft: '30px' }}>
                        Order
                      </OrderDetail>
                      <KeyPointDetail>Key point</KeyPointDetail>
                    </Row>
                    {keypointCollection.keypoints?.map((keypoint, index) => (
                      <Row key={`${keypoint.caption} - ${keypoint.color}`}>
                        <ColorBox color={keypoint.color} />
                        <OrderDetail>{index + 1}</OrderDetail>
                        <KeyPointDetail>{keypoint.caption}</KeyPointDetail>
                      </Row>
                    ))}
                  </PanelBody>
                </Panel>
              )
            )
          ) : (
            <div style={{ padding: '10px', background: '#ffffff' }}>
              {!newKeypoints && renderEmptyAnnotationMessage('point')}
            </div>
          )}
          {/* New Keypoint Collection */}
          {newKeypoints && (
            <Panel
              style={{ background: '#4a67fb14' }}
              header={
                <PanelHeader>
                  <PanelHeaderInput
                    onClick={handleClick}
                    value={newKeypoints.collectionName}
                    placeholder="Create a point group"
                    onChange={(e) => {
                      const { value } = e.target;
                      setNewKeypoints({
                        ...newKeypoints,
                        collectionName: value,
                      });
                    }}
                  />
                  <Button
                    icon="Trash"
                    onClick={() => setNewKeypoints(undefined)}
                    size="small"
                    type="ghost-danger"
                    aria-label="deleteButton"
                  />
                </PanelHeader>
              }
              key="new"
            >
              <PanelBody>
                <Row>
                  <Body style={{ marginLeft: '30px' }} level={3}>
                    Order
                  </Body>
                  <Body level={3}>Keypoint</Body>
                </Row>
                {newKeypoints.keypoints.map((keypoint, index) => (
                  <Row key={index.toString()}>
                    <ColorPicker
                      size="16px"
                      color={keypoint.color}
                      onChange={(newColor: string) => {
                        updateColor(index, newColor);
                      }}
                    />
                    <OrderDetail>{index + 1}</OrderDetail>
                    <KeypointInput
                      size="small"
                      value={keypoint.caption}
                      placeholder="Create individual point"
                      onChange={(e) => {
                        const { value } = e.target;
                        updateCaption(index, value);
                      }}
                    />
                    <Button
                      icon="Trash"
                      onClick={() => onDeleteKeypoint(index)}
                      size="small"
                      type="ghost-danger"
                      aria-label="deleteButton"
                    />
                  </Row>
                ))}
                <KeypointControls>
                  <Button
                    type="secondary"
                    size="small"
                    icon="PlusCompact"
                    onClick={addNewKeypoint}
                  >
                    Add Point
                  </Button>
                  <Tooltip
                    content={
                      <span data-testid="text-content">
                        {NO_EMPTY_LABELS_MESSAGE}
                      </span>
                    }
                    disabled={validNewKeypoint(newKeypoints)}
                  >
                    <Button
                      type="primary"
                      size="small"
                      icon="Checkmark"
                      onClick={onFinish}
                      disabled={!validNewKeypoint(newKeypoints)}
                    >
                      Finish
                    </Button>
                  </Tooltip>
                </KeypointControls>
              </PanelBody>
            </Panel>
          )}
        </Collapse>
      </CollapsePanel>
    </>
  );
};

const CollapsePanel = styled.div`
  overflow: auto;
  height: 500px;
  .ant-collapse-header {
    padding: 12px 12px 12px 33px;
  }
  .ant-collapse-content-box {
    padding: 0;
    background: #ffffff;
  }
`;

const PanelHeader = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
`;

const PanelBody = styled.div``;

const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 15px;
  justify-content: start;
  align-items: center;
  padding: 10px;
  border-bottom: 0.5px solid #d9d9d9;
`;

const ColorBox = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background: ${(props) => props.color};
`;
const OrderDetail = styled(Detail)`
  width: 34px;
  background: #ffffff;
  font-size: 12px;
`;
const KeyPointDetail = styled(Detail)`
  width: 180px;
  background: #ffffff;
  font-size: 12px;
`;

const PanelHeaderInput = styled(Input)`
  width: 200px;
  background: #ffffff;
`;
const KeypointInput = styled(Input)`
  width: 160px;
  height: 24px;
  background: #ffffff;
  font-size: 12px;
`;
const KeypointControls = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 5px;
  justify-content: end;
  padding: 10px;
`;
