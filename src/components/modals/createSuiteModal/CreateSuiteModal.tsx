import React from 'react';
import { modalSettings } from 'components/modals/config';
import { MultiStepModal } from '../multiStepModal/MultiStepModal';

const CreateSuiteModal: React.FC = () => (
  <MultiStepModal modalSettings={modalSettings.create} />
);

export default CreateSuiteModal;
