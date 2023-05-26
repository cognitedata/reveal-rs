import { useMemo } from 'react';

import styled from 'styled-components';

import { Button, InputExp, ToolBar, Tooltip } from '@cognite/cogs.js';

import { UseCurrentSearchResultState } from './hooks/useCurrentSearchResult';
import { UseSearchBarState } from './hooks/useSearchBarState';

const getStatusAndStatusText = (
  value: string,
  hasOcrData: boolean,
  numberOfPages: number
): { status: 'critical' | 'warning'; statusText: string } | undefined => {
  if (!hasOcrData && value.length > 0) {
    return {
      status: 'critical',
      statusText: 'This document is not searchable',
    };
  }

  if (numberOfPages > 50) {
    return {
      status: 'warning',
      statusText: 'Only first 50 pages are searchable',
    };
  }

  return undefined;
};

export type SearchBarProps = {
  isOpen: boolean;
  value: string;
  numberOfSearchResults: number;
  onChange: (value: string) => void;
  hasOcrData: boolean;
  numberOfPages: number;
} & UseCurrentSearchResultState &
  Pick<
    UseSearchBarState,
    'onSearchOpen' | 'onSearchClose' | 'searchBarInputRef'
  >;

export const SearchBar = ({
  isOpen,
  value,
  onChange,
  onSearchOpen,
  onSearchClose,
  searchBarInputRef,
  currentSearchResultIndex,
  numberOfSearchResults,
  onNextResult,
  onPreviousResult,
  hasOcrData,
  numberOfPages,
}: SearchBarProps) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onSearchClose();
      return;
    }

    if (event.key === 'Enter') {
      if (event.shiftKey) {
        onPreviousResult();
        return;
      }
      onNextResult();
    }

    // We don't want the browser's find-in-page to open when the user presses cmd/ctrl+f when the search bar is in focus
    if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSearchOpen(); // This selects all the text in the input field
    }
  };

  const NextPrevActions = [
    {
      icon: 'ArrowUp',
      onClick: onPreviousResult,
      description: 'Previous search result',
      'aria-label': 'Previous search result',
    },
    {
      icon: 'ArrowDown',
      onClick: onNextResult,
      description: 'Next search result',
      'aria-label': 'Next search result',
    },
  ];

  // We only want to show the error message after the user has typed something in the search bar.
  // This is to gather "as real" metrics as possible (e.g. how many users are trying to search in documents that don't have OCR data).
  // In the future we probably want to disable or hide the search bar for documents that don't have OCR data.
  const statusAndStatusText = useMemo(
    () => getStatusAndStatusText(value, hasOcrData, numberOfPages),
    [value, hasOcrData, numberOfPages]
  );

  if (isOpen) {
    return (
      <ToolBar direction="horizontal" style={{ gap: '4px' }}>
        <>
          <RelativeWrapper>
            <AbsoluteWrapper>
              <InputExp
                ref={searchBarInputRef as any}
                icon="Search"
                placeholder="Find in document..."
                suffix={`${currentSearchResultIndex}/${numberOfSearchResults}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                status={statusAndStatusText?.status}
                statusText={statusAndStatusText?.statusText}
              />
            </AbsoluteWrapper>
          </RelativeWrapper>
          <ToolBar.ButtonGroup buttonGroup={NextPrevActions} />
        </>
        <Button
          icon="Close"
          type="ghost"
          aria-label="Close"
          onClick={onSearchClose}
        />
      </ToolBar>
    );
  }

  return (
    <ToolBar>
      <Tooltip content="Find in document">
        <Button
          icon="Search"
          aria-label="Find in document"
          type="ghost"
          onClick={onSearchOpen}
        />
      </Tooltip>
    </ToolBar>
  );
};

const RelativeWrapper = styled.div`
  position: relative;
  min-width: 220px;
  min-height: 36px;
`;

const AbsoluteWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`;
