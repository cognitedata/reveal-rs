import React from 'react';
import { Modal } from 'antd';
import { getContainer } from 'src/utils';
import styled from 'styled-components';
import { LegacyAnnotationCollection } from 'src/modules/Review/types';
import { AnnotationSettingsModalContent } from './AnnotationSettingsModalContent';

export type AnnotationSettingsModalProps = {
  predefinedAnnotations: LegacyAnnotationCollection;
  showModal: boolean;
  onDone: (collection: LegacyAnnotationCollection) => void;
  onCancel: () => void;
  options?: {
    createNew: { text?: string; color?: string };
    activeView: 'keypoint' | 'shape';
  };
};

export const AnnotationSettingsModal = (
  props: AnnotationSettingsModalProps
) => {
  return (
    <StyledModal
      getContainer={getContainer}
      visible={props.showModal}
      onCancel={props.onCancel}
      width={580}
      footer={null} // to remove default ok and cancel buttons
      bodyStyle={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '10px',
        padding: '23px 18px',
        maxHeight: '710px',
        display: 'inline-table',
      }}
      destroyOnClose
    >
      <AnnotationSettingsModalContent
        predefinedAnnotations={props.predefinedAnnotations}
        onCancel={props.onCancel}
        onDone={props.onDone}
        options={props.options}
      />
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 10px;
  }
`;
