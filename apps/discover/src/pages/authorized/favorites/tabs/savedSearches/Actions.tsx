import { SavedSearchItem } from 'domain/savedSearches/types';

import React from 'react';
import { Row } from 'react-table';

import styled from 'styled-components/macro';

import { CommentButton } from 'components/Buttons';
import { FlexRow, sizes } from 'styles/layout';

export const ActionPadding = styled(FlexRow)`
  margin-right: ${sizes.small};
`;
export const Actions: React.FC<{
  row: Row<SavedSearchItem>;
  handleComment: (original: SavedSearchItem) => void;
}> = ({ row, handleComment }) => (
  <ActionPadding>
    <CommentButton onClick={() => handleComment(row.original)} />
  </ActionPadding>
);
