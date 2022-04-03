import { CogniteOrnate, Drawing } from '@cognite/ornate';
import { KonvaEventObject } from 'konva/lib/Node';

import isNotUndefined from '../../utils/isNotUndefined';

import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import { Discrepancy } from './LineReviewViewer';

const RADIUS = 10;
const getDiscrepancyCircleMarkers = (
  line: string,
  discrepancies: Discrepancy[],
  ornateRef: CogniteOrnate | undefined,
  onMarkerClick?: (event: MouseEvent, discrepancy: Discrepancy) => void
): Drawing[] => {
  if (ornateRef === undefined) {
    return [];
  }

  return discrepancies
    .map((discrepancy, index) => {
      const node = ornateRef.stage.findOne(
        `#${getKonvaSelectorSlugByExternalId(discrepancy.id)}`
      );

      if (node === undefined) {
        console.log('Discrepancy node wasnt loaded yet');
        return undefined;
      }

      const boundingBox = node.getClientRect({
        relativeTo: node.parent ? node.parent : undefined,
      });

      return {
        groupId: node.parent?.id(),
        discrepancy,
        boundingBox,
        number: index + 1,
      };
    })
    .filter(isNotUndefined)
    .filter(({ discrepancy }) => discrepancy.status === 'approved')
    .filter(({ boundingBox }) => isNotUndefined(boundingBox))
    .map(({ groupId, discrepancy, boundingBox, number }, index) => ({
      groupId,
      id: `circle-marker-${index}`,
      type: 'circleMarker',
      onClick: ({ evt }: KonvaEventObject<MouseEvent>) =>
        onMarkerClick?.(evt, discrepancy),
      attrs: {
        inGroup: groupId,
        id: `circle-marker-${index}`,
        draggable: false,
        unselectable: true,
        pinnedTo: {
          x: boundingBox!.x + boundingBox!.width / 2,
          y: boundingBox!.y + boundingBox!.height / 2,
        },
        radius: RADIUS,
        color: '#CF1A17',
        number,
      },
    }));
};

export default getDiscrepancyCircleMarkers;
