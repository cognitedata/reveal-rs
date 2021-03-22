import React from 'react';
import { Button, Title } from '@cognite/cogs.js';
import { FileMetadataFieldsContainer } from 'src/components/FileMetadata/FileMetadataFieldsContainer';
import { MetadataTableToolBar } from 'src/components/FileMetadata/MetadataTableToolBar';
import { MetaDataTable } from 'src/components/FileMetadata/MetadataTable';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  fileInfoEdit,
  metadataEditMode,
  selectUpdatedFileDetails,
  selectUpdatedFileMeta,
} from 'src/store/previewSlice';
import isEqual from 'lodash-es/isEqual';
import { VisionFileDetails } from 'src/components/FileMetadata/Types';
import { updateFileById } from 'src/store/uploadedFilesSlice';
import styled from 'styled-components';
import { toggleFileMetadataPreview } from 'src/store/processSlice';

export const FileMetadataPreview = () => {
  const dispatch = useDispatch();

  const fileId = useSelector(
    ({ processSlice }: RootState) => processSlice.selectedFileId
  );

  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, String(fileId))
  );

  const tableEditMode = useSelector(({ previewSlice }: RootState) =>
    metadataEditMode(previewSlice)
  );

  const fileMetadata = useSelector((state: RootState) =>
    selectUpdatedFileMeta(state, String(fileId))
  );

  if (!fileId) {
    return null;
  }

  const onClose = () => {
    dispatch(toggleFileMetadataPreview());
  };

  const onFieldChange = (key: string, value: any) => {
    if (!isEqual(fileDetails[key as keyof VisionFileDetails], value)) {
      dispatch(fileInfoEdit({ key, value }));
    }
  };

  const updateFileInfo = (key: string) => {
    dispatch(updateFileById({ fileId, key }));
  };

  const onEditModeChange = (mode: boolean) => {
    if (mode) {
      updateFileInfo('metadata');
    }
  };

  return (
    <Container>
      <CloseButtonRow>
        <CloseButton
          icon="Close"
          variant="ghost"
          type="secondary"
          onClick={onClose}
        />
      </CloseButtonRow>
      <Content>
        <TitleRow>
          <Title level={3}>File Details</Title>
        </TitleRow>
        <DetailsContainer>
          <MetadataTableToolBar
            editMode={tableEditMode}
            metadata={fileMetadata}
            onEditModeChange={onEditModeChange}
          />
          <MetaDataTable
            title="MetaData"
            rowHeight={35}
            columnWidth={180}
            editMode={tableEditMode}
            data={fileMetadata}
          />
          <FileMetadataFieldsContainer
            info={fileDetails}
            onFieldChange={onFieldChange}
            updateInfo={updateFileInfo}
          />
        </DetailsContainer>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 40px auto;
`;

const Content = styled.div`
  padding: 10px 20px;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 32px auto;
`;

const TitleRow = styled.div`
  display: flex;
`;

const DetailsContainer = styled.div`
  width: 100%;
  padding: 15px 0;
`;

const CloseButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const CloseButton = styled(Button)`
  color: black;
`;
