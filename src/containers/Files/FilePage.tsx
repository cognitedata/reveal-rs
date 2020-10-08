import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'utils/Metrics';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { FilePreview } from './FilePreview';

export const FilePage = () => {
  const { fileId } = useParams<{
    fileId: string | undefined;
  }>();
  const fileIdNumber = fileId ? parseInt(fileId, 10) : undefined;
  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const { hidePreview } = useResourcePreview();
  const isActive = resourcesState.some(
    el => el.state === 'active' && el.id === fileIdNumber && el.type === 'file'
  );

  useEffect(() => {
    if (fileIdNumber && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([{ id: fileIdNumber, type: 'file', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, fileIdNumber, setResourcesState]);

  useEffect(() => {
    trackUsage('Exploration.File', { fileId: fileIdNumber });
    hidePreview();
  }, [fileIdNumber, hidePreview]);

  if (
    !fileId ||
    fileId.length === 0 ||
    !fileIdNumber ||
    Number.isNaN(fileIdNumber)
  ) {
    return null;
  }

  return <FilePreview fileId={fileIdNumber} contextualization />;
};
