import React from 'react';
import sdk from 'sdk-singleton';
import moment from 'moment';
import { CSSProperties } from 'styled-components';

import { Alert, Table, Tag } from 'antd';
import { Icon, Button } from '@cognite/cogs.js';
import { Call } from 'types';
import { useQuery, QueryKey } from 'react-query';

export const callStatusTag = (status: string, style?: CSSProperties) => {
  switch (status) {
    case 'Running':
      return (
        <Tag color="blue" style={style}>
          Running
        </Tag>
      );
    case 'Completed':
      return (
        <Tag color="green" style={style}>
          Completed
        </Tag>
      );
    case 'Failed':
      return (
        <Tag color="red" style={style}>
          Failed
        </Tag>
      );
    case 'Timeout':
      return (
        <Tag color="red" style={style}>
          Timeout
        </Tag>
      );
    default:
      return (
        <Tag color="orange" style={style}>
          {status}
        </Tag>
      );
  }
};

export const callTableColumns = ({
  handleViewResponse,
  handleViewLogs,
}: {
  handleViewResponse?: (call: Call) => void;
  handleViewLogs?: (call: Call) => void;
}) => [
  {
    title: 'Call Time',
    key: 'Call Time',
    render: (call: Call) => {
      const startTime = moment.utc(call.startTime);
      const timeSince = moment(startTime).fromNow();
      return timeSince;
    },
  },
  {
    title: 'Duration',
    key: 'duration',
    render: (call: Call) => {
      // If the function isn't finished yet, show current duration with end time being now
      const endTime = moment.utc(call.endTime) || moment.utc(new Date());
      const startTime = moment.utc(call.startTime);

      // round up to the nearest second
      const duration = moment
        .utc(endTime.diff(startTime))
        .add(1, 'second')
        .startOf('second');
      return `${duration.format('mm:ss')} m`;
    },
  },
  {
    title: 'Call Status',
    key: 'callStatus',
    render: (call: Call) => {
      return callStatusTag(call.status);
    },
  },
  {
    title: 'Response',
    key: 'response',
    render: (call: Call) => {
      if (!call.error && call.status === 'Completed') {
        return (
          <Button
            onClick={() => handleViewResponse && handleViewResponse(call)}
          >
            View Response
          </Button>
        );
      }
      return null;
    },
  },
  {
    title: 'Logs',
    key: 'logs',
    render: (call: Call) => (
      <Button onClick={() => handleViewLogs && handleViewLogs(call)}>
        View Logs
      </Button>
    ),
  },
];

type Props = {
  id: number;
  name: string;
  scheduleId?: number;
};

export default function FunctionCalls({ id, name, scheduleId }: Props) {
  console.log('call', id);
  const { data, isFetched, error } = useQuery<{ items: Call[] }>(
    [`/functions/${id}/calls`, { scheduleId }],
    async (_: QueryKey, { scheduleId }: any) => {
      const filter = scheduleId ? { scheduleId } : {};
      return await sdk
        .post(
          `/api/playground/projects/${sdk.project}/functions/${id}/calls/list`,
          {
            data: { filter },
          }
        )
        .then(response => response.data);
    }
  );
  const functionCalls = data?.items || [];
  const columns = callTableColumns({});

  if (error) {
    return (
      <Alert
        type="error"
        message={`Something went wrong when getting the function calls for ${name} (${id})`}
      />
    );
  }
  if (!isFetched) {
    return <Icon type="Loading" />;
  }

  return (
    <Table
      rowKey={call => call.id.toString()}
      pagination={{ pageSize: 25 }}
      dataSource={functionCalls}
      columns={columns}
    />
  );
}
