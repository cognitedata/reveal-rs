import React, { useState } from 'react';

import groupBy from 'lodash/groupBy';

import { Dropdown } from '@cognite/cogs.js';

import { NPTEvent } from 'modules/wellSearch/types';

import {
  EventsCountBadge,
  EventsCountBadgeWrapper,
  EventsCodesWrapper,
  EventsCodesHeader,
  EventsCodeRow,
  EventsCodeName,
  EventsCodeCount,
} from './elements';

export type Props = {
  events: NPTEvent[];
};

const MIN_SIZE_PERCENTAGE = 70;
const MAX_SIZE_PERCENTAGE = 100;

const EventsBadge: React.FC<Props> = ({ events }: Props) => {
  /**
   * Visibility state of events badge hover content.
   *
   * Don't use the `openOnHover` prop in `Dropdown`.
   * When two badges are in their maximum size, the space between the badges gets almost none.
   * So, when moving the cursor towards the next badge across the centric line of the badges
   * does not let the previous badge content hide. [PP-2796]
   * Seems the hide event is not triggering itself (This is an issue with Tippy).
   *
   * In addition to the above issue,
   * When passed `openOnHover` prop and the user clicks on the badge, the content keeps opened
   * unless the user clicks again on the badge.
   *
   * Hence, handling the visibility state manually.
   */
  const [isVisible, setVisible] = useState<boolean>(false);

  const groupedEvents = groupBy(events, 'nptCode');

  let badgeSize = MAX_SIZE_PERCENTAGE;

  if (events.length < 6) {
    badgeSize = MIN_SIZE_PERCENTAGE;
  } else if (events.length < 11) {
    badgeSize = MIN_SIZE_PERCENTAGE + 15;
  }

  return (
    <Dropdown
      placement="left-start"
      appendTo={document.body}
      visible={isVisible}
      content={
        <EventsCodesWrapper>
          <EventsCodesHeader>NPT events codes</EventsCodesHeader>
          {Object.keys(groupedEvents).map((code) => (
            <EventsCodeRow key={code}>
              <EventsCodeName>{code}</EventsCodeName>
              <EventsCodeCount>{groupedEvents[code].length}</EventsCodeCount>
            </EventsCodeRow>
          ))}
        </EventsCodesWrapper>
      }
    >
      <EventsCountBadgeWrapper
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        <EventsCountBadge size={badgeSize}>
          <span>{events.length}</span>
        </EventsCountBadge>
      </EventsCountBadgeWrapper>
    </Dropdown>
  );
};

export default EventsBadge;
