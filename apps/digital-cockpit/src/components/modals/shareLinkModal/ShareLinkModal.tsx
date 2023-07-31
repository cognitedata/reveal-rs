import React, { useState, useRef } from 'react';
import Modal from 'components/modals/simpleModal/Modal';
import { useDispatch } from 'react-redux';
import { modalClose } from 'store/modals/actions';
import { RootDispatcher } from 'store/types';
import { Body, Button } from '@cognite/cogs.js';
import { Board, Suite } from 'store/suites/types';
import {
  ShareURLInput,
  ShareURLInputContainer,
} from 'components/modals/elements';
import { useMetrics } from 'utils/metrics';
import { useLink } from 'hooks';
import * as Sentry from '@sentry/browser';
import assign from 'lodash/assign';

interface Props {
  boardItem: Board;
  suiteItem: Suite;
}
const ModalWidth = 528;

const ShareLinkModal: React.FC<Props> = ({
  boardItem: board,
  suiteItem: suite,
}: Props) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const ref = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<RootDispatcher>();
  const metrics = useMetrics('ShareLink');
  const { createLink } = useLink();
  const handleCloseModal = () => {
    dispatch(modalClose());
  };
  let entity = '';
  let url = '';
  let title = '';
  if (board) {
    entity = 'board';
    ({ url, title } = board);
  } else if (suite) {
    entity = 'suite';
    ({ title } = suite);
    url = createLink(`/suites/${suite.key}`);
  } else {
    Sentry.captureMessage(
      'Missing data item for ShareLinkModal',
      Sentry.Severity.Error
    );
  }

  const copyToClipboard = () => {
    if (ref.current) {
      ref.current.select();
      document.execCommand('copy');
      setCopySuccess(true);
      const props = assign(
        {},
        suite ? { suiteKey: suite.key, suite: suite.title } : null,
        board ? { boardKey: board.key, board: board.title } : null
      );
      metrics.track('Copied', props);
    }
  };

  return (
    <Modal
      visible
      onCancel={handleCloseModal}
      headerText={`Share this ${entity}`}
      hasFooter={false}
      width={ModalWidth}
    >
      <Body>{title}</Body>
      <ShareURLInputContainer>
        <ShareURLInput ref={ref} value={url} readOnly />
        <Button type="tertiary" onClick={copyToClipboard}>
          {copySuccess ? 'Copied' : 'Copy'}
        </Button>
      </ShareURLInputContainer>
    </Modal>
  );
};

export default ShareLinkModal;
