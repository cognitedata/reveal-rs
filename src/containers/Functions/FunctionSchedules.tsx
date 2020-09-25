import React from 'react';
import moment from 'moment';
import cronstrue from 'cronstrue';
import { Table, Alert, List, Popover } from 'antd';
import { Icon, Button } from '@cognite/cogs.js';

import { Schedule } from 'types';
import { useQuery } from 'react-query';

import DeleteScheduleButton from 'components/DeleteScheduleButton';
import FunctionCalls from './FunctionCalls';

const scheduleTableColumns = [
  {
    title: 'Schedule Info',
    key: 'scheduleInfo',
    render: (s: Schedule) => {
      return (
        <List.Item>
          <List.Item.Meta title={s.name} description={s.description} />
        </List.Item>
      );
    },
  },
  {
    title: 'Cron Expression',
    key: 'cronExpression',
    render: (s: Schedule) => {
      return s.cronExpression;
    },
  },
  {
    title: 'Occurs',
    key: 'cronExpressionDescription',
    render: (s: Schedule) => {
      return cronstrue.toString(s.cronExpression);
    },
  },
  {
    title: 'Created Time',
    key: 'createdTime',
    render: (s: Schedule) => {
      return moment(s.createdTime).format('MM-DD-YYYY HH:mm');
    },
  },
  {
    title: 'Input Data',
    key: 'inputData',
    render: (s: Schedule) => {
      if (Object.keys(s.data || {}).length !== 0) {
        const dataDisplay = <pre>{JSON.stringify(s.data, null, 2)}</pre>;
        return (
          <Popover content={dataDisplay}>
            <Button type="link">View Input Data</Button>
          </Popover>
        );
      }
      return null;
    },
  },
  {
    title: 'Delete',
    key: 'deleteSchedule',
    render: (s: Schedule) => {
      return <DeleteScheduleButton id={s.id} />;
      // if (
      //   errorInDeletingSchedule // &&
      //   // scheduleToDelete &&
      //   // s.id === scheduleToDelete
      // ) {
      //   message.error('Unable to delete schedule');
      // }

      // if (
      //   deleting // &&
      //   // scheduleToDelete &&
      //   // s.id === scheduleToDelete
      // ) {
      //   return <Button icon="Loading">Delete</Button>;
      // }
      // return (
      //   <Button
      //     icon="Delete"
      //     onClick={() => {
      //       Modal.confirm({
      //         title: 'Are you sure?',
      //         content: 'Are you sure you want to delete this schedule?',
      //         onOk: () => {
      //           //                  dispatch(deleteSchedule(s.schedule));
      //         },
      //         onCancel: () => {},
      //         okText: 'Delete',
      //       });
      //     }}
      //   />
      // );
    },
  },
];

type Props = {
  externalId: string;
  id: number;
};

export default function FunctionSchedules({ externalId, id }: Props) {
  const { data, isFetched, error } = useQuery<{ items: Schedule[] }>(
    `/functions/schedules`
  );
  const schedules =
    data?.items
      ?.filter(s => s.functionExternalId === externalId)
      ?.sort((a: any, b: any) => {
        if (a.schedule.createdTime > b.schedule.createdTime) {
          return -1;
        }
        if (a.schedule.createdTime < b.schedule.createdTime) {
          return 1;
        }
        return 0;
      }) || [];

  if (error) {
    return (
      <Alert
        type="error"
        message={`Something went wrong when getting the schedule details for ${externalId}`}
      />
    );
  }
  if (!isFetched) {
    return <Icon type="Loading" />;
  }

  console.log({ schedules });

  return (
    <Table
      rowKey={s => s.id.toString()}
      pagination={{ pageSize: 25 }}
      dataSource={schedules}
      columns={scheduleTableColumns}
      expandedRowRender={(s: Schedule) => {
        return <FunctionCalls id={id} name="" scheduleId={s.id} />;

        // return (
        //   <Table
        //     rowKey={(call: Call) => call.id.toString()}
        //     pagination={{ pageSize: 5 }}
        //     dataSource={[]}
        //     columns={callTableColumns({})}
        //   />
        // );
      }}
    />
  );
}
