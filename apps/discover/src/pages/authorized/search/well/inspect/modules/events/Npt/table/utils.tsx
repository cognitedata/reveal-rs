import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';

import { sortObjectsAscending, sortObjectsDecending } from '_helpers/sort';
import { NPTEvent } from 'modules/wellSearch/types';
import { SortBy } from 'pages/types';

import { accessors, colors, DEFAULT_NPT_COLOR } from '../constants';
import { NptCodeAvatar } from '../elements';

import { Body, NptCodeContainer } from './elements';

export const processAccessor = (row: NPTEvent, accessor: string) => {
  const value = get(row, accessor);

  if (isNumber(value) || !isEmpty(value)) return value;
  return null;
};

export const renderAsBody2DefaultStrongText = (text: string) => (
  <Body level={2} strong>
    {text}
  </Body>
);

export const renderNPTCodeWithColor = (nptEvent: NPTEvent) => {
  const nptCode = get(nptEvent, accessors.NPT_CODE);

  return (
    <NptCodeContainer>
      <NptCodeAvatar color={get(colors, nptCode, DEFAULT_NPT_COLOR)} />
      {nptCode}
    </NptCodeContainer>
  );
};

export const sortEvents = (events: NPTEvent[], sortBy: SortBy[]) => {
  const { id: accessor, desc } = sortBy[0];

  if (desc) {
    return sortObjectsDecending<NPTEvent>(events, accessor as keyof NPTEvent);
  }

  return sortObjectsAscending<NPTEvent>(events, accessor as keyof NPTEvent);
};
