import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import includes from 'lodash/includes';

import { Button, Tooltip } from '@cognite/cogs.js';
import { getTenantInfo } from '@cognite/react-container';

import {
  DownloadButton,
  PreviewButton,
  ViewButton,
  CogniteButton,
  FeedbackButton,
} from 'components/buttons';
import { showErrorMessage } from 'components/toast';
import { useDocumentLabelsByExternalIds } from 'hooks/useDocumentLabels';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { downloadFileFromUrl } from 'modules/documentPreview/utils';
import { documentSearchActions } from 'modules/documentSearch/actions';
import { useDocumentConfig } from 'modules/documentSearch/hooks';
import { DocumentType } from 'modules/documentSearch/types';
import {
  canContextualize,
  getContextualizePath,
} from 'modules/documentSearch/utils/contextualize';
import { setObjectFeedbackModalDocumentId } from 'modules/feedback/actions';
import { FlexGrow, FlexAlignItems } from 'styles/layout';

import { AddToFavoritesButton } from './AddToFavoritesButton';
import { ActionContainer, FavouriteTooltip } from './elements';

interface Props {
  doc: DocumentType;
  handlePreviewClick?: () => void;
  handleViewClick?: () => void;
  isPreviewButtonDisabled?: boolean;
}

const DocumentPreviewActionsComponent: React.FC<Props> = ({
  doc,
  handlePreviewClick,
  handleViewClick,
  isPreviewButtonDisabled,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation('Search');
  const { data: config } = useDocumentConfig();
  const metrics = useGlobalMetrics('feedback');
  const [project] = getTenantInfo();
  const filteredLabels = useDocumentLabelsByExternalIds(doc.doc.labels);

  const onExtractParentFolder = () => {
    const parentPath = doc.doc.filepath;
    if (!parentPath) {
      showErrorMessage('Parent path not found');
      return;
    }
    metrics.track('click-extract-parent-folder-button');
    dispatch(
      documentSearchActions.extractParentFolder(
        parentPath,
        config?.extractByFilepath
      )
    );
  };

  const onOpenFeedback = () => {
    dispatch(setObjectFeedbackModalDocumentId(doc.id));
    metrics.track('click-document-feedback-button');
  };

  const getDownloadUrlFromDoc = async () => {
    downloadFileFromUrl(doc.id);
  };

  const contextualize = () => canContextualize(filteredLabels);

  const goToSchematic = () =>
    window.open(getContextualizePath(doc.doc.id, project));

  const supportedFileTypes = config?.wellboreSchematics?.supportedFileTypes;

  /**
   * Does document type supportd for Wellbore Schematics
   */
  const isSupportedFileType =
    supportedFileTypes &&
    includes(supportedFileTypes, doc.doc.filetype.toUpperCase());

  return (
    <ActionContainer>
      <FavouriteTooltip
        content={t('Add to Favourites') as string}
        placement="top"
      >
        <AddToFavoritesButton document={doc} />
      </FavouriteTooltip>

      <Tooltip content={t('Explore Parent Folder') as string} placement="top">
        <Button
          type="ghost"
          data-testid="button-extract-parent-folder"
          onClick={onExtractParentFolder}
          icon="FolderLine"
          aria-label="Explore Parent Folder"
        />
      </Tooltip>
      <FeedbackButton onClick={onOpenFeedback} data-testid="button-feedback" />
      <DownloadButton
        tooltip={t('Download Document')}
        onClick={getDownloadUrlFromDoc}
        data-testid="button-download"
        aria-label="Download Document"
      />
      {contextualize() && isSupportedFileType && (
        <CogniteButton
          tooltip={t('Go to Wellbore Schematic')}
          aria-label={t('Go to Wellbore Schematic')}
          onClick={goToSchematic}
          data-testid="button-Schematic"
        />
      )}

      <FlexGrow />

      <FlexAlignItems>
        <PreviewButton
          data-testid="button-preview-document"
          disabled={isPreviewButtonDisabled}
          onClick={handlePreviewClick}
        />
        <ViewButton
          iconPlacement="left"
          data-testid="button-view-document"
          disabled={isPreviewButtonDisabled}
          onClick={handleViewClick}
        />
      </FlexAlignItems>
    </ActionContainer>
  );
};

export const DocumentPreviewActions = React.memo(
  DocumentPreviewActionsComponent
);
