import { useCallback, useEffect, useRef, useState } from 'react';

import styled from 'styled-components';

import { useDebounce } from 'use-debounce';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

import { CopilotAction } from '../../../../lib/types';
import {
  sendFromCopilotEvent,
  sendToCopilotEvent,
} from '../../../../lib/utils';
import { getContainer } from '../../../utils/getContainer';

const getButtonWidth = (text: string) => text.length * 8 + 20;

type Action = CopilotAction;

export const ResponsiveActions = ({ actions }: { actions: Action[] }) => {
  const [priorityItems, setPriorityItems] = useState<Action[]>(actions);
  const [moreItems, setMoreItems] = useState<Action[]>([]);

  const navigationOuter = useRef<HTMLDivElement>(null);
  //Add resize listener but throttle for smoother experience

  const updateNavigation = useCallback(() => {
    //Get width of all items in navigation menu
    const widthsArray = actions.map((item) => getButtonWidth(item.content));
    const outerWidth =
      navigationOuter.current?.getBoundingClientRect().width || 0;

    const arrayAmount = howManyItemsInMenuArray(widthsArray, outerWidth);
    const navItemsCopy = actions.slice(0, actions.length);
    const newPriorityItems = navItemsCopy.slice(0, arrayAmount);

    setPriorityItems(newPriorityItems);
    setMoreItems(
      priorityItems.length !== navItemsCopy.length
        ? navItemsCopy.slice(arrayAmount, navItemsCopy.length)
        : []
    );
  }, [actions, priorityItems.length]);

  const [debouncedUpdateNavigation] = useDebounce(updateNavigation, 200);

  useEffect(() => {
    debouncedUpdateNavigation();
    const callback = () => debouncedUpdateNavigation();
    window.addEventListener('resize', callback);
    window.addEventListener('small-resize', callback);
    return () => {
      window.removeEventListener('resize', callback);
      window.removeEventListener('small-resize', callback);
    };
  }, [debouncedUpdateNavigation]);

  const howManyItemsInMenuArray = (array: any[], outerWidth: number) => {
    let total = getButtonWidth('More') + 16;
    for (let i = 0; i < array.length; i++) {
      if (total + array[i] > outerWidth) {
        return i;
      } else {
        total += array[i];
      }
    }
    return Infinity;
  };

  return (
    <Wrapper ref={navigationOuter}>
      {priorityItems.map((item) => (
        <Button
          size="small"
          key={item.content}
          icon={item.icon}
          onClick={() => {
            if ('onClick' in item && item.onClick) {
              item.onClick();
            } else if ('fromCopilotEvent' in item) {
              sendFromCopilotEvent(...item.fromCopilotEvent);
            } else if ('toCopilotEvent' in item) {
              sendToCopilotEvent(...item.toCopilotEvent);
            }
          }}
          className="ai"
        >
          {item.content}
        </Button>
      ))}
      {moreItems.length > 0 && (
        <Dropdown
          appendTo={getContainer() || document.body}
          content={
            <Menu>
              {moreItems.map((item) => (
                <Menu.Item
                  key={item.content}
                  onClick={() => {
                    if ('onClick' in item && item.onClick) {
                      item.onClick();
                    } else if ('fromCopilotEvent' in item) {
                      sendFromCopilotEvent(...item.fromCopilotEvent);
                    } else if ('toCopilotEvent' in item) {
                      sendToCopilotEvent(...item.toCopilotEvent);
                    }
                  }}
                >
                  {item.content}
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button
            size="small"
            icon="ChevronDown"
            iconPlacement="right"
            className="ai"
          >
            More
          </Button>
        </Dropdown>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  width: 100%;
  position: relative;
`;
