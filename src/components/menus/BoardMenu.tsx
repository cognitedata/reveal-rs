/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Button, Menu } from '@cognite/cogs.js';
import { useClickAwayListener } from 'hooks';
import { useDispatch, useSelector } from 'react-redux';
import { isAdmin } from 'store/groups/selectors';
import { RootDispatcher } from 'store/types';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { Board, Suite } from 'store/suites/types';
import { ActionsContainer, MenuContainer, MenuItemContent } from './elements';

interface Props {
  board: Board;
  suite: Suite;
}
export const BoardMenu: React.FC<Props> = ({ board, suite }) => {
  const dispatch = useDispatch<RootDispatcher>();
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible,
  } = useClickAwayListener(false);
  const admin = useSelector(isAdmin);

  const handleMenuOpen = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsComponentVisible(() => !isComponentVisible);
  };

  const handleOpenModal = (
    event: React.MouseEvent,
    modalType: ModalType,
    // TODO(dtc-215) change type
    modalProps: any
  ) => {
    event.preventDefault();
    setIsComponentVisible(() => !isComponentVisible);
    dispatch(modalOpen({ modalType, modalProps }));
  };

  return (
    <MenuContainer ref={ref}>
      <Button
        variant="ghost"
        icon="MoreOverflowEllipsisHorizontal"
        onClick={handleMenuOpen}
      />
      <ActionsContainer>
        {isComponentVisible && (
          <Menu>
            {admin && (
              <>
                <Menu.Item>
                  <MenuItemContent
                    role="button"
                    tabIndex={0}
                    // TODO(dtc-215) avoid using callbacks with passed modal type and data
                    onClick={(event) =>
                      handleOpenModal(event, 'EditBoard', {
                        boardItem: board,
                        suiteItem: suite,
                      })
                    }
                  >
                    Edit board
                  </MenuItemContent>
                </Menu.Item>
                <Menu.Item>
                  <MenuItemContent
                    role="button"
                    tabIndex={0}
                    onClick={(event) =>
                      handleOpenModal(event, 'DeleteBoard', { board, suite })
                    }
                  >
                    Remove board
                  </MenuItemContent>
                </Menu.Item>
              </>
            )}
            <Menu.Item>
              <MenuItemContent
                role="button"
                tabIndex={0}
                // will be fixed when feature implemented
                onClick={(event) => event.preventDefault()}
              >
                Share board
              </MenuItemContent>
            </Menu.Item>
          </Menu>
        )}
      </ActionsContainer>
    </MenuContainer>
  );
};
