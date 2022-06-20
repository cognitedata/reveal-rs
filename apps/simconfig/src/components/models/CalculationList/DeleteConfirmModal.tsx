import { Button, Modal } from '@cognite/cogs.js';

import type { ModelCalculation } from './CalculationList';

interface DeleteConfirmModalProps {
  isModelOpen: boolean;
  handleModalConfirm(
    isConfirmed: boolean,
    calculationConfig?: ModelCalculation | null
  ): void;
  calculationConfig: ModelCalculation | null;
}

export function DeleteConfirmModal({
  isModelOpen,
  handleModalConfirm,
  calculationConfig,
}: DeleteConfirmModalProps) {
  const calcName = calculationConfig?.configuration.calculationName ?? 'NA';
  return (
    <Modal
      footer={
        <div className="cogs-modal-footer-buttons">
          <Button
            onClick={() => {
              handleModalConfirm(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="danger"
            onClick={() => {
              handleModalConfirm(true, calculationConfig);
            }}
          >
            Delete
          </Button>
        </div>
      }
      style={{ top: '20%' }}
      title="Are you sure?"
      visible={isModelOpen}
      onCancel={() => {
        handleModalConfirm(false);
      }}
    >
      <h3>
        Do you want to delete <strong>{calcName}</strong> calculation config?
      </h3>
      <br />
      <h3>This is an irreversible action</h3>
    </Modal>
  );
}

export default DeleteConfirmModal;
