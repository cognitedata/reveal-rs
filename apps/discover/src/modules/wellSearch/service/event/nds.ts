import set from 'lodash/set';
import { getWellSDKClient } from 'services/wellSearch/sdk/authenticate';

import { CogniteEvent } from '@cognite/sdk';
import { Nds, NdsItems } from '@cognite/sdk-wells-v3';

import { MetricLogger } from 'hooks/useTimeLog';
import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { WellboreSourceExternalIdMap } from 'modules/wellSearch/types';
import { getTrajectoryInterpolationRequests } from 'modules/wellSearch/utils/nds';

import {
  getTrajectoryInterpolateTVDs,
  getTVDForMD,
} from '../sequence/trajectoryInterpolate';

import { EVENT_PER_PAGE, groupEventsByAssetId } from './common';

export function getNdsEventsByWellboreIds(
  wellboreIds: number[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap,
  metricLogger: MetricLogger,
  cursor?: string
) {
  const [startNetworkTimer, stopNetworkTimer] = metricLogger;

  startNetworkTimer();

  const doFetchNdsEvents = () =>
    fetchNdsEventsUsingWellsSDK(
      wellboreIds,
      wellboreSourceExternalIdMap,
      cursor
    );

  return doFetchNdsEvents().finally(() => {
    stopNetworkTimer({
      noOfWellbores: wellboreIds.length,
    });
  });
}

export const fetchNdsEvents = async (
  wellboreIds: number[],
  cursor?: string
) => {
  return getWellSDKClient().nds.list({
    filter: { wellboreIds: wellboreIds.map(toIdentifier) },
    limit: EVENT_PER_PAGE,
    cursor,
  });
};

export const fetchNdsEventsUsingWellsSDK = async (
  wellboreIds: number[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap,
  cursor?: string
) => {
  const ndsEvents = await fetchNdsEvents(wellboreIds, cursor).then(
    (ndsItems: NdsItems) => {
      return mapNdsItemsToCogniteEvents(
        ndsItems.items,
        wellboreSourceExternalIdMap
      );
    }
  );

  return getGroupedNdsEvents(
    ndsEvents,
    wellboreIds,
    wellboreSourceExternalIdMap
  );
};

export const mapNdsItemsToCogniteEvents = async (
  ndsEvents: Nds[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
) => {
  const tvds = await getTrajectoryInterpolateTVDs(
    ndsEvents,
    getTrajectoryInterpolationRequests(ndsEvents)
  );

  return ndsEvents.map((event) => {
    const tvdsForWellbore = tvds[event.wellboreMatchingId][0];
    const tvdUnit = tvdsForWellbore.trueVerticalDepthUnit.unit;

    return {
      id: wellboreSourceExternalIdMap[event.source.eventExternalId],
      externalId: event.source.eventExternalId,
      type: event.subtype || '',
      subtype: event.riskType || '',
      description: event.description,
      source: event.source.sourceName,
      metadata: {
        name: event.riskType,
        parentExternalId: event.wellboreAssetExternalId,
        diameter_hole: event.holeDiameter?.value,
        diameter_hole_unit: event.holeDiameter?.unit,
        md_hole_start: event.holeStart?.value,
        md_hole_start_unit: event.holeStart?.unit,
        md_hole_end: event.holeEnd?.value,
        md_hole_end_unit: event.holeEnd?.unit,
        risk_sub_category: event.subtype || '',
        severity: String(event?.severity || ''),
        probability: String(event?.probability || ''),
        tvd_offset_hole_start: event.holeStart?.value
          ? getTVDForMD(tvdsForWellbore, event.holeStart.value)
          : undefined,
        tvd_offset_hole_start_unit: tvdUnit,
        tvd_offset_hole_end: event.holeEnd?.value
          ? getTVDForMD(tvdsForWellbore, event.holeEnd.value)
          : undefined,
        tvd_offset_hole_end_unit: tvdUnit,
      },
      assetIds: [event.wellboreAssetExternalId],
    } as unknown as CogniteEvent;
  });
};

export const getGroupedNdsEvents = (
  response: CogniteEvent[],
  wellboreIds: number[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap
): Record<string, CogniteEvent[]> => {
  const events: CogniteEvent[] = response
    .filter((event) => (event.assetIds || []).length)
    .map((event) => ({
      ...event,
      assetIds: [
        wellboreSourceExternalIdMap[event.metadata?.parentExternalId || ''],
      ],
    }));

  const groupedEvents = groupEventsByAssetId(events);

  wellboreIds.forEach((wellboreId) => {
    if (!groupedEvents[wellboreId]) {
      set(groupedEvents, wellboreId, []);
    }
  });

  return groupedEvents;
};
