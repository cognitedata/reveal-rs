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
  hideFileMetadataPreview,
  setProcessCurrentView,
  setSelectedFileId,
} from 'src/modules/Process/processSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ProcessToolBar } from 'src/modules/Process/Containers/ProcessToolBar/ProcessToolBar';
import { ProcessFooter } from 'src/modules/Process/Containers/ProcessFooter';
import { RootState } from 'src/store/rootReducer';

pushMetric('Vision.Process');
const queryClient = new QueryClient();

export default function ProcessStep() {
  const dispatch = useDispatch();

  const currentView = useSelector(
    ({ processSlice }: RootState) => processSlice.currentView
  );

  const handleDeselect = () => {
    dispatch(setSelectedFileId(null));
  };

  useEffect(() => {
    return () => {
      dispatch(hideFileMetadataPreview());
    };
  }, []);
  return (
    <>
      <Deselect
        onClick={() => {
          handleDeselect();
        }}
      />
      <QueryClientProvider client={queryClient}>
        <TitleContainer>
          <Title level={2}>Contextualize Imagery Data</Title>
        </TitleContainer>
        <ProcessToolBar />
        <FileToolbar
          currentView={currentView}
          onViewChange={(view) =>
            dispatch(setProcessCurrentView(view as ViewMode))
          }
        />
        <ResultsContainer>
          <ProcessResults currentView={currentView as ViewMode} />
        </ResultsContainer>
        <ProcessFooter />
      </QueryClientProvider>
    </>
  );
}

const ResultsContainer = styled.div`
  flex: 1;
  height: calc(100% - 50px);
`;

const TitleContainer = styled.div`
  padding: 5px 0;
`;

const Deselect = styled.div`
  position: fixed;
  z-index: 0;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;
