/* eslint-disable @cognite/no-number-z-index */
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FileToolbar } from 'src/modules/Process/Containers/FileToolbar';
import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { pushMetric } from 'src/utils/pushMetric';
import { ProcessResults } from 'src/modules/Process/Containers/ProcessResults';
import { ViewMode } from 'src/modules/Common/types';
import {
  hideFileMetadata,
  setCurrentView,
  setFocusedFileId,
  selectAllProcessFiles,
} from 'src/modules/Process/processSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ProcessToolBar } from 'src/modules/Process/Containers/ProcessToolBar/ProcessToolBar';
import { ProcessFooter } from 'src/modules/Process/Containers/ProcessFooter';
import { RootState } from 'src/store/rootReducer';
import { ProcessFileUploadModalContainer } from 'src/modules/Process/Containers/ProcessFileUploadModalContainer';
import { ProcessFileDownloadModalContainer } from 'src/modules/Process/Containers/ProcessFileDownloadModalContainer';
import { ProcessBulkEditModalContainer } from 'src/modules/Process/Containers/ProcessBulkEditModalContainer';
import { ExploreModalContainer } from 'src/modules/Process/Containers/ExploreModalContainer';
import { pollJobs } from 'src/store/thunks/Process/pollJobs';
import { isVideo } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';

const ResultsContainer = styled.div`
  flex: 1;
  height: calc(100% - 50px);
`;

const TitleContainer = styled.div`
  padding: 5px 0;
`;

pushMetric('Vision.Process');
const queryClient = new QueryClient();

export default function ProcessStep() {
  const dispatch = useDispatch();

  const currentView = useSelector(
    ({ processSlice }: RootState) => processSlice.currentView
  );

  const processFiles = useSelector((state: RootState) =>
    selectAllProcessFiles(state)
  );
  const poll = () => {
    const ids = processFiles
      .filter((file) => !isVideo(file))
      .map(({ id }) => id);
    console.log(processFiles);

    dispatch(
      pollJobs({
        fileIds: ids,
      })
    );
  };

  useEffect(() => {
    poll();
    return () => {
      dispatch(hideFileMetadata());
    };
  }, []);
  return (
    <>
      <Deselect />
      <ProcessFileUploadModalContainer />
      <ProcessFileDownloadModalContainer />
      <QueryClientProvider client={queryClient}>
        <TitleContainer>
          <Title level={2}>Contextualize Imagery Data</Title>
        </TitleContainer>
        <ProcessToolBar />
        <FileToolbar
          currentView={currentView}
          onViewChange={(view) => dispatch(setCurrentView(view as ViewMode))}
        />
        <ResultsContainer>
          <ProcessResults currentView={currentView as ViewMode} />
        </ResultsContainer>
        <ProcessFooter />
        <ExploreModalContainer />
        <ProcessBulkEditModalContainer />
      </QueryClientProvider>
    </>
  );
}

const Deselect = () => {
  const dispatch = useDispatch();
  const focusedFileId = useSelector(
    ({ processSlice }: RootState) => processSlice.focusedFileId
  );
  return (
    <DeselectContainer
      onClick={() => {
        if (focusedFileId) {
          dispatch(setFocusedFileId(null));
        }
      }}
    />
  );
};

const DeselectContainer = styled.div`
  position: fixed;
  z-index: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;
