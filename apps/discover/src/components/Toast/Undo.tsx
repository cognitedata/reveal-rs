import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ToastOptions } from 'react-toastify';

import styled from 'styled-components/macro';

import { toast as cogniteToast, Button } from '@cognite/cogs.js';

import { useTranslation } from 'hooks/useTranslation';
import { FlexRow } from 'styles/layout';

interface Props {
  visible?: boolean;
  setVisible?: Dispatch<SetStateAction<boolean>>;
  callback: () => void;
  onUndo?: () => void;
  duration?: number;
  children?: ReactNode;
}

const StyledToast = styled(FlexRow)`
  justify-content: space-between;
  align-items: center;
`;

export const UndoToast: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  // let runCallback = true;

  const [runCallback, setRunCallback] = useState<boolean>(true);

  const handleUndoClick = useCallback(() => {
    // runCallback = false; // Don't run the callback
    setRunCallback(false);
    cogniteToast.dismiss(); // Close the toast

    if (props.onUndo) {
      props.onUndo();
    }
  }, [props]);

  const onClose = useCallback(() => {
    if (runCallback && props.callback) {
      // The user did not click 'undo'
      props.callback();
    }

    if (props.setVisible) {
      props.setVisible(false);
    }
  }, [props, runCallback]);

  const option: ToastOptions = useMemo(
    () => ({
      style: {
        width: '600px!important',
      },
      autoClose: props.duration || 5000,
      pauseOnHover: true,
      draggable: true,
      closeOnClick: false,
      onClose,
    }),
    [onClose, props.duration]
  );

  const renderToastContent = useCallback(
    () => (
      <StyledToast>
        {props.children}
        <Button onClick={handleUndoClick} aria-label="Undo">
          {t('Undo')}
        </Button>
      </StyledToast>
    ),
    [handleUndoClick, props.children, t]
  );

  useEffect(() => {
    if (props.visible) {
      cogniteToast.open(renderToastContent, option);
    } else {
      cogniteToast.dismiss();
    }
  }, [props.visible, option, renderToastContent]);

  return null;
};

export default UndoToast;
