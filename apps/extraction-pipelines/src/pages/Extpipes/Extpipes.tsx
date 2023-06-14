import React, { FunctionComponent, useEffect, useState } from 'react';
import { useExtpipes } from '@extraction-pipelines/hooks/useExtpipes';
import NoExtpipes from '@extraction-pipelines/components/error/NoExtpipes';
import { Button, Flex, Loader, Modal, Tabs, Title } from '@cognite/cogs.js';
import { ErrorFeedback } from '@extraction-pipelines/components/error/ErrorFeedback';
import {
  StyledTooltip,
  PageWrapperColumn,
} from '@extraction-pipelines/components/styled';
import ExtpipesTable from '@extraction-pipelines/components/table/ExtpipesTable';
import styled from 'styled-components';
import { getContainer } from '@extraction-pipelines/utils/utils';
import { CreateExtpipe } from '@extraction-pipelines/pages/create/CreateExtpipe';

import { trackUsage } from '@extraction-pipelines/utils/Metrics';
import { useTranslation } from '@extraction-pipelines/common';
import ExtpipesTableSearch from '@extraction-pipelines/components/table/ExtpipesTableSearch';
import HostedExtractionPipelineTable from '@extraction-pipelines/components/table/HostedExtractionPipelineTable';
import { useSearchParams } from 'react-router-dom';
import { CreateSourceModal } from '@extraction-pipelines/components/create-source-modal/CreateSourceModal';
import { useFlag } from '@cognite/react-feature-flags';

export const LEARNING_AND_RESOURCES_URL: Readonly<string> =
  'https://docs.cognite.com/cdf/integration/guides/interfaces/about_integrations.html';

const CreateExtpipeModal = (props: {
  title: string;
  visible: boolean;
  close: () => void;
}) => {
  return (
    <Modal
      visible={props.visible}
      size="large"
      closable
      onCancel={props.close}
      getContainer={getContainer}
      hideFooter
      title={props.title}
    >
      <VerticalSpace />
      <CreateExtpipe customCancelCallback={props.close} />
    </Modal>
  );
};

interface OwnProps {}

type Props = OwnProps;

const Extpipes: FunctionComponent<Props> = () => {
  const { t } = useTranslation();
  useEffect(() => {
    trackUsage({ t: 'Overview' });
  }, []);

  const { isEnabled: shouldShowHostedExtractors } = useFlag(
    'FUSION_HOSTED_EXTRACTORS'
  );

  const {
    data,
    isInitialLoading,
    error: errorExtpipes,
    refetch,
  } = useExtpipes(20);

  const canEdit = true;
  const [isCreateSourceModalOpen, setIsCreateSourceModalOpen] = useState(false);
  const [isCreateExtpipeModalOpen, setIsCreateExtpipeModalOpen] =
    useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');

  const tab = searchParams.get('tab') ?? 'self-hosted';

  const onClickCreateButton = () => {
    if (tab === 'hosted') {
      setIsCreateSourceModalOpen(true);
    } else if (canEdit && !isCreateExtpipeModalOpen) {
      trackUsage({ t: 'Create.DialogOpened' });
      setIsCreateExtpipeModalOpen(true);
    }
  };
  const closeCreateDialog = () => {
    trackUsage({ t: 'Create.DialogClosed' });
    if (tab === 'hosted') {
      setIsCreateSourceModalOpen(false);
    } else {
      setIsCreateExtpipeModalOpen(false);
    }
  };

  const createExtpipeButton = (
    <StyledTooltip disabled={canEdit} content={t('no-create-access')}>
      <Button
        type="primary"
        icon="AddLarge"
        disabled={!canEdit}
        onClick={onClickCreateButton}
      >
        {t('create-ext-pipeline')}
      </Button>
    </StyledTooltip>
  );

  if (isInitialLoading) {
    return <Loader />;
  }

  if (data?.pages?.[0]?.items.length === 0) {
    return (
      <>
        <CreateExtpipeModal
          visible={isCreateExtpipeModalOpen}
          close={() => setIsCreateExtpipeModalOpen(false)}
          title={t('create-ext-pipeline')}
        />
        <NoExtpipes actionButton={createExtpipeButton} />
      </>
    );
  }

  const handleErrorDialogClick = async () => {
    await refetch();
  };

  if (errorExtpipes) {
    if (errorExtpipes.status === 403) {
      return (
        <ErrorFeedback
          onClick={handleErrorDialogClick}
          fallbackTitle={t('list-extaction-pipelines-error-403')}
          btnText="Retry"
        />
      );
    }
    return (
      <ErrorFeedback
        btnText="Retry"
        onClick={handleErrorDialogClick}
        fallbackTitle={t('fail-to-get-ext-pipeline')}
        contentText={t('try-again-later')}
        error={errorExtpipes}
      />
    );
  }

  return (
    <StyledContainer>
      <CreateExtpipeModal
        visible={isCreateExtpipeModalOpen}
        close={closeCreateDialog}
        title={t('create-ext-pipeline')}
      />
      {isCreateSourceModalOpen && (
        <CreateSourceModal
          onCancel={() => {
            setIsCreateSourceModalOpen(false);
          }}
          visible={isCreateSourceModalOpen}
        />
      )}
      <Flex direction="column" gap={16}>
        {shouldShowHostedExtractors && (
          <Tabs
            activeKey={tab}
            onTabClick={(key) => {
              setSearchParams(
                (prev) => {
                  prev.set('tab', key);
                  return prev;
                },
                { replace: true }
              );
            }}
          >
            <Tabs.Tab
              tabKey="self-hosted"
              label={t('self-hosted-extractors')}
            />
            <Tabs.Tab tabKey="hosted" label={t('hosted-extractors')} />
          </Tabs>
        )}
        <StyledActionBar>
          <ExtpipesTableSearch onChange={setSearchQuery} value={searchQuery} />
          {createExtpipeButton}
        </StyledActionBar>
      </Flex>
      {shouldShowHostedExtractors && tab === 'hosted' ? (
        <HostedExtractionPipelineTable search={searchQuery} />
      ) : (
        <ExtpipesTable search={searchQuery} />
      )}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  margin-top: 24px;
  width: 100%;
`;

const StyledActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export default function CombinedComponent() {
  const { t } = useTranslation();
  return (
    <StyledPageContainer>
      <PageWrapperColumn>
        <Title level={3}>{t('extraction-pipeline', { count: 0 })}</Title>
        <Flex>
          <Extpipes />
        </Flex>
      </PageWrapperColumn>
    </StyledPageContainer>
  );
}

const VerticalSpace = styled.div`
  height: 16px;
`;

const StyledPageContainer = styled.div`
  padding: 0 16px;
`;
