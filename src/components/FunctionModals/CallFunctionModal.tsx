import React, { useState, useEffect, SyntheticEvent } from 'react';
import { Modal, Input, Form, Alert } from 'antd';
import { Button } from '@cognite/cogs.js';
import { useMutation, useQueryCache } from 'react-query';
import { createFunctionCall, isOIDCFlow } from 'utils/api';
import FunctionCallStatus from 'components/FunctionCallStatus';
import FunctionCallResponse from 'components/FunctionCallResponse';
import ErrorFeedback from 'components/Common/atoms/ErrorFeedback';
import { callsKey, sortFunctionKey } from 'utils/queryKeys';
import { useCall, useFunction } from 'utils/hooks';

const canParseInputData = (inputData: string) => {
  if (inputData === '') {
    return true;
  }
  try {
    JSON.parse(inputData);
    return (
      typeof JSON.parse(inputData) === 'object' &&
      !Array.isArray(JSON.parse(inputData))
    );
  } catch {
    return false;
  }
};

type Props = {
  id: number;
  closeModal?: () => void;
};

export default function CallFunctionModal({ id, closeModal }: Props) {
  const queryCache = useQueryCache();
  const [updateInterval, setUpdateInteval] = useState<number | false>(1000);
  const [inputData, setInputData] = useState('');
  // The statefull `callId` could be replaced with wrapping the
  // relevant components in a <LastFunctionCall>, but then it would
  // not be possible to start a new call when one is already running.
  const [callId, setCallId] = useState<number | undefined>();

  const [
    createCall,
    { data, isSuccess: callCreated, isLoading, error },
  ] = useMutation(createFunctionCall, {
    onSuccess() {
      queryCache.invalidateQueries(callsKey({ id }));
      queryCache.invalidateQueries(sortFunctionKey);
    },
  });

  useEffect(() => {
    if (callCreated && data?.id) {
      setCallId(data?.id);
    }
  }, [callCreated, data]);

  const { data: fn } = useFunction(id);
  const { data: callResponse } = useCall(
    { id, callId: callId! },
    {
      enabled: !!callId,
      refetchInterval: updateInterval,
    }
  );

  const running = isLoading || (!!callId && callResponse?.status === 'Running');

  useEffect(() => {
    if (!!callId && !running) {
      setUpdateInteval(false);
    } else {
      setUpdateInteval(1000);
    }
  }, [callId, running]);

  const validJSONMessage = <div style={{ color: 'green' }}>JSON is valid</div>;
  const JSONCheckMessage = !canParseInputData(inputData)
    ? 'Input data must be a valid JSON object'
    : validJSONMessage;
  const helpMessage = inputData ? (
    JSONCheckMessage
  ) : (
    <span>
      <b>Warning: </b>Secrets or other confidential information should not be
      passed via the data object. There is a dedicated secrets object in the
      request body to &quot;Create functions&quot; for this purpose.
    </span>
  );

  const handleInputDataChange = (evt: { target: { value: string } }) => {
    setInputData(evt.target.value);
  };

  const handleCancel = (e: SyntheticEvent) => {
    // Avoid toggling the above <Panel />
    e.stopPropagation();
    if (closeModal) {
      closeModal();
    }
  };

  const onCallClick = (e: SyntheticEvent) => {
    e.stopPropagation();
    const formattedInputData =
      inputData === '' ? undefined : JSON.parse(inputData);
    createCall({ id, data: formattedInputData, isOIDC: isOIDCFlow() });
  };

  return (
    <Modal
      title="Call function"
      visible
      width={900}
      onCancel={handleCancel}
      footer={[
        <Button key="close" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="call"
          type="primary"
          disabled={
            isLoading || (callId && running) || !canParseInputData(inputData)
          }
          onClick={onCallClick}
        >
          Call
        </Button>,
      ]}
    >
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Form.Item label="Function name">
          <Input disabled value={fn?.name} />
        </Form.Item>
        <Form.Item
          label="Input data"
          validateStatus={canParseInputData(inputData) ? 'success' : 'error'}
          help={helpMessage}
          hasFeedback={!!inputData && inputData.length > 0}
        >
          <Input.TextArea
            rows={4}
            disabled={running}
            value={inputData}
            onChange={handleInputDataChange}
            allowClear
          />
        </Form.Item>
        <Form.Item label="Call status">
          <FunctionCallStatus id={id} callId={callId} />
        </Form.Item>
        <Form.Item label="Call response">
          {error && (
            <Alert
              type="error"
              message="Error"
              description={
                <>
                  <p>An error occured when calling the function.</p>
                  <ErrorFeedback error={error} />
                </>
              }
            />
          )}
          <FunctionCallResponse id={id} callId={data?.id} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export const stuffForUnitTests = {
  canParseInputData,
};
