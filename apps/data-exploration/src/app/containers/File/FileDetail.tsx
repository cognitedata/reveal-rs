import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import styled from 'styled-components';

import { Loader, Metadata } from '@data-exploration/components';
import { FileInfo } from '@data-exploration/containers';
import { useCdfUserHistoryService } from '@user-history';
import isEmpty from 'lodash/isEmpty';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Tabs, Infobar } from '@cognite/cogs.js';
import {
  FilePreview as CogniteFilePreview,
  ErrorFeedback,
  ResourceType,
} from '@cognite/data-exploration';
import { CogniteError, FileInfo as FileInfoType } from '@cognite/sdk';
import { useCdfItem, usePermissions } from '@cognite/sdk-react-query-hooks';

import {
  APPLICATION_ID,
  useTranslation,
  SUB_APP_PATH,
} from '@data-exploration-lib/core';
import { useFileAnnotationsResourceIds } from '@data-exploration-lib/domain-layer';

import { BreadcrumbsV2 } from '../../components/Breadcrumbs/BreadcrumbsV2';
import ResourceTitleRow from '../../components/ResourceTitleRow';
import {
  useEndJourney,
  usePushJourney,
  useResourceDetailSelectedTab,
} from '../../hooks';
import { trackUsage } from '../../utils/Metrics';
import { AllTab } from '../All';
import { DetailsTabWrapper } from '../Common/element';
import { ResourceDetailsTabs } from '../ResourceDetails';

// FilePreviewTabType;
// - preview
// - details
// - timeseries
// - files
// - sequences
// - events
// - assets

export const FileDetail = ({
  fileId,
  actions,
}: {
  fileId: number;
  actions?: React.ReactNode;
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);

  const { t } = useTranslation();
  const [pushJourney] = usePushJourney();

  const { flow } = getFlow();
  const { data: filesAcl } = usePermissions(flow as any, 'filesAcl', 'WRITE');
  const { data: annotationsAcl } = usePermissions(
    flow as any,
    'annotationsAcl',
    'WRITE'
  );
  const writeAccess = filesAcl && annotationsAcl;

  const { resourceType } = useParams<{
    resourceType: ResourceType;
  }>();

  const { pathname, search: searchParams } = useLocation();
  const userHistoryService = useCdfUserHistoryService();

  const [selectedTab, setSelectedTab] = useResourceDetailSelectedTab();
  const [endJourney] = useEndJourney();
  const activeTab = selectedTab || 'preview';

  const handlePreviewClose = () => {
    endJourney();
  };

  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab);
  };

  const { data: annotationList } = useFileAnnotationsResourceIds({
    id: fileId,
  });

  useEffect(() => {
    trackUsage('Exploration.Preview.File', { fileId });
    setEditMode(false);
  }, [fileId]);

  const {
    data: fileInfo,
    isLoading,
    isError,
    error,
  } = useCdfItem<FileInfoType>('files', {
    id: fileId!,
  });

  useEffect(() => {
    if (fileInfo !== undefined) {
      // save File preview as view resource in user history
      if (fileInfo?.name)
        userHistoryService.logNewResourceView({
          application: SUB_APP_PATH,
          name: fileInfo?.name,
          path: pathname.concat(searchParams),
        });
      trackUsage('Exploration.Preview.File.MimeType', {
        mimeType: fileInfo.mimeType,
      });
    }
  }, [fileInfo]);

  const allResourcesFilter = useMemo(() => {
    if (!fileInfo || !fileInfo.assetIds || isEmpty(fileInfo.assetIds)) {
      return {};
    }
    return {
      assetSubtreeIds: fileInfo.assetIds.map((id) => ({
        value: id,
      })),
    };
  }, [fileInfo]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    const { errorMessage: message, status, requestId } = error as CogniteError;
    return (
      <ErrorFeedback
        error={{ message, status, requestId }}
        onPreviewClose={handlePreviewClose}
      />
    );
  }

  if (!fileInfo) {
    return (
      <>{t('FILE_ID_NOT_FOUND', `File ${fileId} not found!`, { fileId })}</>
    );
  }

  return (
    <FileDetailWrapper data-testid="file-detail">
      <BreadcrumbsV2 />
      <ResourceTitleRow
        item={{ id: fileId!, type: resourceType || 'file' }}
        title={fileInfo.name}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabs
        parentResource={{
          type: 'file',
          id: fileId,
          externalId: fileInfo.externalId,
          title: fileInfo.name,
        }}
        onTabChange={handleTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab
            label={t('PREVIEW_TAB_LABEL', 'Preview')}
            key="preview"
            tabKey="preview"
          >
            <PreviewTabWrapper data-testid="file-preview">
              {editMode && (
                <Infobar
                  type="neutral"
                  buttonText={t('DONE_EDITING', 'Done editing')}
                  onButtonClick={() => setEditMode(false)}
                >
                  {t(
                    'FILE_EDITING_MODE_NOTIFY_TEXT',
                    'You are in editing mode.'
                  )}
                </Infobar>
              )}
              <CogniteFilePreview
                key={fileId}
                id={`${APPLICATION_ID}-${fileId}`}
                applicationId={APPLICATION_ID}
                fileId={fileId!}
                creatable={editMode}
                contextualization={writeAccess}
                onItemClicked={(item) => {
                  pushJourney({ id: item.id, type: item.type });
                }}
                setEditMode={() => setEditMode((mode) => !mode)}
                filesAcl={filesAcl}
                annotationsAcl={annotationsAcl}
              />
            </PreviewTabWrapper>
          </Tabs.Tab>,
          <Tabs.Tab label={t('DETAILS', 'Details')} key="info" tabKey="info">
            <DetailsTabWrapper>
              <FileInfo file={fileInfo} />
              <Metadata metadata={fileInfo.metadata} />
            </DetailsTabWrapper>
          </Tabs.Tab>,
          <Tabs.Tab
            label={t('ALL_RESOURCES', 'All resources')}
            key="all-resources"
            tabKey="all-resources"
          >
            <AllTab
              filters={{ common: allResourcesFilter }}
              selectedResourceExternalId={fileInfo.externalId}
              setCurrentResourceType={(type) => type && setSelectedTab(type)}
              resourceAnnotationList={annotationList}
            />
          </Tabs.Tab>,
        ]}
      />
    </FileDetailWrapper>
  );
};

const PreviewTabWrapper = styled.div`
  height: 100%;
`;

const FileDetailWrapper = styled.div`
  display: contents;
`;
