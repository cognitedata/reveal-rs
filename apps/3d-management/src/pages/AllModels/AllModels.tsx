import { Model3D } from '@cognite/sdk';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';
import { useMetrics } from 'src/hooks/useMetrics';
import React, { ChangeEvent, useState } from 'react';
import ModelRevisions from 'src/pages/AllModels/components/ModelRevisions/ModelRevisions';
import {
  APP_TITLE,
  DEFAULT_MARGIN_V,
  getContainer,
  userHasCapabilities,
} from 'src/utils';
import { Modal, Steps, message } from 'antd';

import { Button, Flex, Input } from '@cognite/cogs.js';
import FileUploader from 'src/pages/AllModels/components/FileUploader';
import Spinner from 'src/components/Spinner';
import { PageHeader } from 'src/components/PageHeader';
import PermissioningHintWrapper from 'src/components/PermissioningHintWrapper';
import ModelsTable from 'src/pages/AllModels/components/ModelsTable/ModelsTable';

import styled from 'styled-components';
import { RouteComponentProps } from 'react-router';
import { useCreateModelMutation } from 'src/hooks/models';
import { useModels } from 'src/hooks/models/useModels';
import { useCreateRevisionMutation } from 'src/hooks/revisions';

const { Step } = Steps;

type Props = RouteComponentProps & {
  user: AuthenticatedUserWithGroups;
};

const TableOperations = styled.div`
  margin: 20px 0 16px 0;
  position: relative;

  button {
    margin-right: 8px;
  }
  button:nth-child(2) {
    position: absolute;
    right: 0;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  margin-top: 20px;

  button:nth-child(2) {
    align-self: end;
    margin-right: 0;
    margin-left: auto;
  }

  button:nth-child(3) {
    align-self: end;
    margin-right: 0;
    margin-left: 10px;
  }
`;

export default function AllModels(props: Props) {
  const metrics = useMetrics('3D');

  const modelsQuery = useModels();

  const [createModel] = useCreateModelMutation();
  const [createRevision] = useCreateRevisionMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [currentUploadStep, setCurrentUploadStep] = useState<number>(0);
  const [createdModel, setCreatedModel] = useState<Model3D>();

  const isFormFilled = newModelName.length > 0;

  const expandedRowRender = (model) => (
    <ModelRevisions model={model} {...props} />
  );

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const nextStep = () => {
    setCurrentUploadStep((prevStep: number) => prevStep + 1);
  };

  const previousStep = () => {
    if (currentUploadStep > 0) {
      setCurrentUploadStep((prevStep: number) => prevStep - 1);
    }
  };

  const { data: models } = modelsQuery;

  const showAddModelButton = userHasCapabilities(props.user, [
    { acl: 'threedAcl', actions: ['CREATE'] },
    { acl: 'filesAcl', actions: ['WRITE'] },
  ]);

  const modelUploadSteps = [
    {
      title: 'Name Your Model',
      content: (
        <div>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            style={{
              margin: `${DEFAULT_MARGIN_V}px 0`,
            }}
          >
            <div>Input Model Name:</div>
            <Input
              placeholder="Model Name"
              value={newModelName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewModelName(e.target.value)
              }
            />
          </Flex>

          <ButtonRow>
            <Button onClick={closeModal}>Cancel</Button>
            <Button
              onClick={nextStep}
              disabled={!isFormFilled}
              type="primary"
              icon="Check"
            >
              Create New Model
            </Button>
          </ButtonRow>
        </div>
      ),
    },
    {
      title: 'Upload an Initial Model',
      content: (
        <FileUploader
          beforeUploadStart={async () => {
            metrics.track('Models.Add');
            await createModel(
              { name: newModelName },
              {
                onSuccess: (model) => setCreatedModel(model),
              }
            );
          }}
          onUploadSuccess={async (fileId) => {
            message.info(
              'Upload complete, starting processing job to render 3d model'
            );
            metrics.track('Revisions.New');

            if (createdModel) {
              await createRevision({
                fileId,
                modelId: createdModel.id,
              });
            }

            setNewModelName('');
            setIsModalVisible(false);
            setCreatedModel(undefined);
            setCurrentUploadStep(0);
            modelsQuery.refetch();
          }}
          onUploadFailure={() => {
            closeModal();
            setCreatedModel(undefined);
          }}
          onCancel={previousStep}
        />
      ),
    },
  ];

  if (modelsQuery.isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader
        title={APP_TITLE}
        breadcrumbs={[{ title: APP_TITLE, path: '/3d-models' }]}
        help="https://docs.cognite.com/cdf/3d/"
        rightItem={
          <TableOperations>
            <PermissioningHintWrapper hasPermission={showAddModelButton}>
              <Button
                type="primary"
                disabled={!showAddModelButton}
                onClick={() => setIsModalVisible(true)}
              >
                Add model
              </Button>
            </PermissioningHintWrapper>
          </TableOperations>
        }
      />

      <ModelsTable
        models={models || []}
        expandedRowRender={expandedRowRender}
        refresh={modelsQuery.refetch}
      />
      <Modal
        title="Insert New Model"
        visible={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={currentUploadStep ? '800px' : undefined}
        getContainer={getContainer}
      >
        <Steps progressDot current={currentUploadStep} size="small">
          {modelUploadSteps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div>{modelUploadSteps[currentUploadStep].content}</div>
      </Modal>
    </div>
  );
}
