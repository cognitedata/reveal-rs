import { groupByRiskType } from 'domain/wells/dataLayer/nds/adapters/groupByRiskType';
import { NdsDataLayer } from 'domain/wells/dataLayer/nds/types';

import isEmpty from 'lodash/isEmpty';
import minBy from 'lodash/minBy';
import sumBy from 'lodash/sumBy';
import { getFixedPercent } from 'utils/number';

import { TreeMapData } from 'components/Treemap';

export const getRiskTypeTreemapData = (
  ndsEvents: NdsDataLayer[],
  maxNodes = 15
): TreeMapData => {
  let children: TreeMapData[];

  const groupedNdsEvents = groupByRiskType(ndsEvents);
  const numberOfRiskTypes = Object.keys(groupedNdsEvents).length;

  if (isEmpty(ndsEvents)) {
    children = [
      {
        title: 'No data',
        value: 100,
      },
    ];
  } else {
    // get as much data from one loop as possible
    const { totalNumberOfEvents, events: eventsMapped } = Object.keys(
      groupedNdsEvents
    ).reduce(
      (previousValue, riskType) => {
        const numberOfEvents = groupedNdsEvents[riskType].length;

        return {
          ...previousValue,
          totalNumberOfEvents:
            previousValue.totalNumberOfEvents + numberOfEvents,
          events: [
            ...previousValue.events,
            {
              name: riskType,
              numberOfEvents,
            },
          ],
        };
      },
      {
        totalNumberOfEvents: 0,
        events: [] as { name: string; numberOfEvents: number }[],
      }
    );

    // sort wellbores by number of events
    const sortedEventsWithRiskType = [...eventsMapped].sort(
      (a, b) => b.numberOfEvents - a.numberOfEvents
    );

    // get the number wellbores to be displayed
    const riskTypesToDisplay = sortedEventsWithRiskType.slice(
      0,
      numberOfRiskTypes > maxNodes ? maxNodes : numberOfRiskTypes
    );
    const numberOfEventsFromDisplayedRiskTypes = sumBy(
      riskTypesToDisplay,
      (data) => data.numberOfEvents
    );

    let OtherNode: TreeMapData | undefined;
    const minEvents = minBy(
      riskTypesToDisplay,
      (data) => data.numberOfEvents
    )?.numberOfEvents;

    if (
      numberOfRiskTypes > riskTypesToDisplay.length ||
      riskTypesToDisplay.length === 0
    ) {
      OtherNode = {
        id: 'more',
        title: `More (${numberOfRiskTypes - riskTypesToDisplay.length})`,
        value: minEvents || 100,
        description: `${
          totalNumberOfEvents - numberOfEventsFromDisplayedRiskTypes
        } events (${getFixedPercent(
          totalNumberOfEvents - numberOfEventsFromDisplayedRiskTypes,
          totalNumberOfEvents
        )}%)`,
        riskTypes: [...sortedEventsWithRiskType].slice(
          riskTypesToDisplay.length,
          sortedEventsWithRiskType.length
        ),
      };
    }

    const realNodes = riskTypesToDisplay.map((data) => ({
      title: data.name,
      description: `${data.numberOfEvents} events (${getFixedPercent(
        data.numberOfEvents,
        totalNumberOfEvents
      )}%)`,
      value: data.numberOfEvents,
      ndsEvents: groupedNdsEvents[data.name],
    }));

    children = OtherNode ? [...realNodes, OtherNode] : realNodes;
  }

  return {
    title: 'NDS Risk type treemap',
    children,
  };
};
