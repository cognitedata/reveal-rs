import React, { useCallback, useState } from 'react';
import { Row } from 'react-table';

import compact from 'lodash/compact';
import isString from 'lodash/isString';
import sortBy from 'lodash/sortBy';

import { SetCommentTarget, CommentTarget } from '@cognite/react-comments';

import { shortDate } from '_helpers/date';
import { sortDates } from '_helpers/dateConversion';
import EmptyState from 'components/emptyState';
import { Table, Options, TableResults } from 'components/tablev3';
import { COMMENT_NAMESPACE } from 'constants/comments';
import {
  useFeedbackUpdateMutate,
  updateFeedbackStatus,
  assignGeneralFeedback,
  deleteGeneralFeedback,
  recoverGeneralFeedback,
  useFeedbackGetAllQuery,
} from 'modules/api/feedback';
import { useUserProfileQuery } from 'modules/api/user/useUserQuery';
import { ColumnMap } from 'modules/documentSearch/utils/columns';
import { FIELDS } from 'modules/feedback/constants';
import { feedbackHelper } from 'modules/feedback/helper';
import { GeneralFeedbackItem } from 'modules/feedback/types';
import { User } from 'modules/user/types';
import { getFullNameOrDefaultText } from 'modules/user/utils';

import { ActionColumn } from '../common/columns/ActionColumn';
import { ScreenshotColumn } from '../common/columns/ScreenshotColumn';
import { StatusColumn } from '../common/columns/StatusColumn';
import { useFeedback } from '../Selector';

import { GeneralFeedbackDetails } from './GeneralFeedbackDetails';
import { GeneralScreenshotModal } from './GeneralScreenshotModal';

interface Props {
  setCommentTarget: SetCommentTarget;
  commentTarget?: CommentTarget;
}
export const GeneralFeedbackTable: React.FC<Props> = ({
  setCommentTarget,
  commentTarget,
}) => {
  const { data, isLoading, isError } =
    useFeedbackGetAllQuery<GeneralFeedbackItem[]>('general');
  const { mutateAsync: updateGeneralFeedback } =
    useFeedbackUpdateMutate('general');
  const { generalFeedbackShowDeleted } = useFeedback();
  const [isOpen, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<GeneralFeedbackItem>();
  const [expandedIds, setExpandedIds] = useState<TableResults>({});
  const { data: user } = useUserProfileQuery();
  const [highlightedIds, setHighlightedIds] = useState<TableResults>();

  const feedbackColumns: ColumnMap<GeneralFeedbackItem> = {
    screenshot: {
      Header: '',
      accessor: 'screenshotB64',
      width: '100px',
      maxWidth: '0.1fr',
      order: 0,
      disableSorting: true,
      Cell: (cell) => (
        <ScreenshotColumn
          feedbackRow={cell.row.original}
          setSelectedFeedback={setFeedback}
          setOpen={setOpen}
        />
      ),
    },
    status: {
      Header: FIELDS.status.display,
      accessor: 'statusVal',
      width: '100px',
      maxWidth: '0.1fr',
      order: 1,
      Cell: ({ row }) => (
        <StatusColumn
          status={row.original.status}
          handleChangeFeedbackStatus={(status: number) =>
            handleUpdateFeedbackStatus(row.original.id, status)
          }
        />
      ),
      sortType: (row1, row2) =>
        (row1.original.status || 0) - (row2.original.status || 0),
    },
    assignedTo: {
      Header: FIELDS.assignedTo.display,
      accessor: 'assignedTo',
      width: '140px',
      maxWidth: '0.1fr',
      order: 2,
      Cell: (cell) => (
        <span>{getFullNameOrDefaultText(cell.row.original.assignee)}</span>
      ),
      sortType: (row1, row2) =>
        getFullNameOrDefaultText(row1.original.assignee).localeCompare(
          getFullNameOrDefaultText(row2.original.assignee)
        ),
    },
    user: {
      Header: FIELDS.user.display,
      accessor: 'user',
      width: '140px',
      maxWidth: '0.1fr',
      order: 3,
      Cell: (cell) => (
        <span>{getFullNameOrDefaultText(cell.row.original.user)}</span>
      ),
      sortType: (row1, row2) =>
        getFullNameOrDefaultText(row1.original.user).localeCompare(
          getFullNameOrDefaultText(row2.original.user)
        ),
    },
    createdOn: {
      Header: FIELDS.date.display,
      accessor: 'createdTime',
      width: '140px',
      order: 4,
      Cell: (cell) => <span>{shortDate(cell.row.original.createdTime)}</span>,
      sortType: (row1, row2) =>
        sortDates(
          new Date(row1.original.createdTime),
          new Date(row2.original.createdTime)
        ),
    },
    comment: {
      Header: 'Comment',
      accessor: 'comment',
      width: '250px',
      maxWidth: '1fr',
      order: 5,
      Cell: (cell) => (
        <span>
          {feedbackHelper.shortCommentText(cell.row.original.comment, 65, 75)}
        </span>
      ),
    },
    actions: {
      Header: 'Actions',
      accessor: 'actions',
      width: '180px',
      maxWidth: '0.2fr',
      order: 6,
      Cell: (cell) => (
        <ActionColumn
          feedbackRow={cell.row.original}
          showDeleted={generalFeedbackShowDeleted}
          setSelectedFeedback={setFeedback}
          setCommentOpen={() => {
            setHighlightedIds({ [cell.row.original.id]: true });
            setCommentTarget({
              id: cell.row.original.id,
              targetType: COMMENT_NAMESPACE.feedbackGeneral,
            });
          }}
          recoverFeedback={recoverFeedback}
          assignFeedback={(feedback: GeneralFeedbackItem) =>
            assignFeedback(feedback, user)
          }
          deleteGeneralFeedback={handleDeleteGeneralFeedback}
        />
      ),
      disableSorting: true,
    },
  };

  const selectedColumns: string[] = [
    'screenshot',
    'status',
    'assignedTo',
    'user',
    'createdOn',
    'comment',
    'actions',
  ];

  const columns = React.useMemo(
    () =>
      sortBy(
        compact(selectedColumns.map((column) => feedbackColumns[column])),
        'order'
      ),
    [selectedColumns]
  );

  const [options] = useState<Options>({
    checkable: false,
    expandable: true,
    flex: false,
    hideScrollbars: true,
    pagination: {
      enabled: true,
      pageSize: 50,
    },
  });

  React.useEffect(() => {
    setHighlightedIds(commentTarget ? { [commentTarget.id]: true } : {});
  }, [commentTarget]);

  const handleUpdateFeedbackStatus = (feedbackId: string, status: number) =>
    updateFeedbackStatus(feedbackId, status, updateGeneralFeedback);

  const recoverFeedback = (feedback: GeneralFeedbackItem) => {
    recoverGeneralFeedback(feedback.id, updateGeneralFeedback);
  };
  const assignFeedback = (
    feedback: GeneralFeedbackItem,
    user: User | undefined
  ) => {
    return assignGeneralFeedback(feedback.id, user, updateGeneralFeedback);
  };

  const handleDeleteGeneralFeedback = (feedback: GeneralFeedbackItem) =>
    deleteGeneralFeedback(feedback.id, updateGeneralFeedback);

  const renderRowSubComponent = useCallback(
    ({ row }) => {
      return (
        <GeneralFeedbackDetails
          deleted={generalFeedbackShowDeleted}
          feedback={row.original as GeneralFeedbackItem}
        />
      );
    },
    [generalFeedbackShowDeleted]
  );

  const handleRowClick = useCallback((row: Row & { isSelected: boolean }) => {
    const feedback = row.original as GeneralFeedbackItem;
    setExpandedIds((state) => ({
      ...state,
      [feedback.id]: !state[feedback.id],
    }));
  }, []);

  const toggleGeneralFeedbackData = React.useMemo(() => {
    if (!data || isString(data)) {
      return [];
    }
    return data.filter((item) => item.deleted === generalFeedbackShowDeleted);
  }, [data, generalFeedbackShowDeleted]);

  if (isLoading) {
    return (
      <EmptyState
        isLoading
        img="Recent"
        emptyTitle="No feedback has been submitted"
      />
    );
  }

  if (!data?.length) {
    return <EmptyState img="Recent" />;
  }

  if (isError) {
    return (
      <EmptyState
        img="Recent"
        emptyTitle="Something went wrong. Try refreshing the page."
      />
    );
  }

  return (
    <>
      {feedback && isOpen && (
        <GeneralScreenshotModal setOpen={setOpen} feedbackId={feedback?.id} />
      )}

      <Table<GeneralFeedbackItem>
        id="feedback-result-table"
        data={toggleGeneralFeedbackData}
        columns={columns}
        handleRowClick={handleRowClick}
        renderRowSubComponent={renderRowSubComponent}
        options={options}
        expandedIds={expandedIds}
        highlightedIds={highlightedIds}
      />
    </>
  );
};

export default GeneralFeedbackTable;
