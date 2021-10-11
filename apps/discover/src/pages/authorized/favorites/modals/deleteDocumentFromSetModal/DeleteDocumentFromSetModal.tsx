import React from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components/macro';

import { Modal } from 'components/modal';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';

const Title = styled.div`
  margin-bottom: 8px;
  font-weight: 600;
`;

interface Props {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteDocumentFromSetModal: React.FC<Props> = (props) => {
  const { isOpen, title, onClose, onConfirm } = props;
  const { t } = useTranslation('Favorites');
  const metrics = useGlobalMetrics('favorites');

  const handleConfirm = () => {
    metrics.track('click-confirm-delete-document-from-set-button');
    onConfirm();
  };

  const handleCancel = () => {
    metrics.track('click-cancel-delete-document-from-set-button');
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText={t('Delete')}
      title={t('Warning')}
    >
      {title ? <Title>{title}</Title> : ''}
      {t('Do you want to delete this document from the set?')}
    </Modal>
  );
};

export default DeleteDocumentFromSetModal;
