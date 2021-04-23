import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { PrevNextNav } from 'src/modules/Workflow/components/PrevNextNav';
import { getLink, workflowRoutes } from 'src/modules/Workflow/workflowRoutes';
import { createLink } from '@cognite/cdf-utilities';
import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';
import { RootState } from 'src/store/rootReducer';
import { selectIsPollingComplete } from 'src/modules/Process/processSlice';
import { annotationsById } from 'src/modules/Preview/previewSlice';
import styled from 'styled-components';
import { Button, Modal } from '@cognite/cogs.js';
import { getContainer } from 'src/utils';
import SummaryStep from './summary/SummaryStep';

export const ProcessStepActionButtons = () => {
  const history = useHistory();
  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const { allFilesStatus } = useSelector(
    (state: RootState) => state.uploadedFiles
  );

  const annotations = useSelector((state: RootState) => {
    return annotationsById(state.previewSlice);
  });

  const onCancel = () => {
    setModalOpen(false);
  };
  const dispatch = useDispatch();
  const onNextClicked = () => {
    dispatch(SaveAvailableAnnotations());
    history.push(createLink('/explore/search/file')); // data-exploration app
  };

  const onUploadMoreClicked = () => {
    dispatch(SaveAvailableAnnotations());
    history.push(getLink(workflowRoutes.upload));
    // Todo: Delete files
  };

  const disableComplete =
    !isPollingFinished || !Object.keys(annotations).length;
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Modal
        getContainer={getContainer}
        footer={
          <FooterContainer>
            <Button onClick={onUploadMoreClicked} disabled={false}>
              Upload More
            </Button>
            <div style={{ flexGrow: 1 }} />
            <Button onClick={() => setModalOpen(false)} disabled={false}>
              Continue processing files
            </Button>
            <div style={{ padding: '10px' }} />
            <Button onClick={onNextClicked} disabled={false} type="primary">
              Finish Session
            </Button>
          </FooterContainer>
        }
        visible={isModalOpen}
        width={800}
        closable={false}
        onCancel={onCancel}
      >
        <SummaryStep />
      </Modal>
      <PrevNextNav
        prevBtnProps={{
          onClick: () => history.push(getLink(workflowRoutes.upload)),
          disabled: !isPollingFinished,
        }}
        nextBtnProps={{
          onClick: () => setModalOpen(true),
          children: 'Session summary',
          disabled: disableComplete,
        }}
        skipBtnProps={{
          disabled:
            !isPollingFinished ||
            !allFilesStatus ||
            !!Object.keys(annotations).length,
        }}
      />
    </>
  );
};

const FooterContainer = styled.div`
  display: flex;
  padding-top: inherit;
`;
