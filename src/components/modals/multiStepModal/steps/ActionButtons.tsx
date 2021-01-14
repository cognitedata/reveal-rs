import React from 'react';
import { Button } from '@cognite/cogs.js';
import { ActionButtonsContainer } from 'components/modals/elements';
import { key } from 'utils/generateKey';
import { useSelector } from 'react-redux';
import { isErrorListEmpty } from 'store/forms/selectors';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { Board, Suite } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';

interface Props {
  board: Board;
  suite: Suite;
  setBoard: TS_FIX_ME;
  setSuite: TS_FIX_ME;
}

const ActionButtons: React.FC<Props> = ({
  suite,
  board,
  setSuite,
  setBoard,
}: Props) => {
  const isValid =
    !isEmpty(board.title) && !isEmpty(board.type) && !isEmpty(board.url);
  const hasErrors = !useSelector(isErrorListEmpty) || !isValid;

  const addNewBoard = () => {
    if (hasErrors) return;
    setSuite((prevState: Suite) => ({
      ...prevState,
      boards: suite.boards.concat({ ...board, key: key() }),
    }));
    setBoard({});
  };

  const updateBoard = () => {
    if (hasErrors) return;
    const boardIndex = suite.boards.findIndex((element: Board) =>
      isEqual(element.key, board.key)
    );
    // TODO(dtc-215) Delegate data manipulation part to reducer
    const boardsCopy = cloneDeep(suite.boards);
    boardsCopy[boardIndex] = merge(boardsCopy[boardIndex], board);
    setSuite((prevState: Suite) => {
      return omit(
        {
          ...prevState,
          boards: boardsCopy,
        },
        'lastUpdatedTime'
      );
    });
  };

  const clearForm = () => {
    setBoard({});
  };
  return (
    <ActionButtonsContainer>
      {board.key && !isEmpty(suite?.boards) ? (
        <>
          <Button variant="ghost" onClick={clearForm}>
            Cancel
          </Button>
          <Button type="primary" onClick={updateBoard} disabled={hasErrors}>
            Update board
          </Button>
        </>
      ) : (
        <Button type="primary" onClick={addNewBoard} disabled={hasErrors}>
          Add board
        </Button>
      )}
    </ActionButtonsContainer>
  );
};

export default ActionButtons;
