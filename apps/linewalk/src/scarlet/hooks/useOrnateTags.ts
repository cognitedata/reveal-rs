import { useMemo } from 'react';
import { v5 as uuid } from 'uuid';
import {
  DataElement,
  DataElementState,
  Detection,
  DetectionState,
  OrnateTag,
} from 'scarlet/types';
import { isSameAnnotation } from 'scarlet/utils';

import { useAppState, useDataPanelState } from '.';

export const useOrnateTags = (): {
  tags: OrnateTag[];
  activeTag?: OrnateTag;
} => {
  const { equipment } = useAppState();
  const { visibleDataElement, newDetection, activeDetection } =
    useDataPanelState();

  const dataElements = useMemo(
    () =>
      [
        ...(equipment.data?.equipmentElements || []),
        ...(equipment.data?.components.map(
          (component) => component.componentElements
        ) || []),
      ]
        .flat()
        .filter((item) => {
          // filter by state and number of detections
          if (
            item.state === DataElementState.OMITTED &&
            !item.detections?.length
          ) {
            return false;
          }

          return true;
        }),
    [equipment.data, visibleDataElement]
  );

  const { tags, activeTag }: { tags: OrnateTag[]; activeTag?: OrnateTag } =
    useMemo(() => {
      const allTags: OrnateTag[] = [];

      dataElements?.forEach((dataElement) => {
        dataElement.detections
          ?.filter(
            (detection) =>
              detection.boundingBox &&
              detection.documentExternalId &&
              detection.state !== DetectionState.OMITTED
          )
          .forEach((detection) => {
            const tag = getOrnateTag({
              detection,
              dataElement,
              activeDetection,
            });
            allTags.push(tag);
          });
      });

      if (newDetection && visibleDataElement) {
        const tag = getOrnateTag({
          detection: newDetection,
          dataElement: visibleDataElement,
          activeDetection,
        });
        allTags.push(tag);
      }

      const activeTagNode = allTags.find(
        (tag) => tag.isActive && tag.dataElement.id === visibleDataElement?.id
      );
      const activeTag =
        activeTagNode &&
        (JSON.parse(JSON.stringify(activeTagNode)) as OrnateTag);

      allTags.sort((a) => (!a.detection.state ? -1 : 1));

      const tags = [activeTag, ...allTags].filter(
        (tag, index, self) =>
          tag &&
          self.findIndex((item) =>
            isSameAnnotation(
              item?.detection.boundingBox,
              tag.detection.boundingBox
            )
          ) === index
      ) as OrnateTag[];

      return {
        tags,
        activeTag,
      };
    }, [dataElements, activeDetection, newDetection]);

  return { tags, activeTag };
};

const getOrnateTag = ({
  detection,
  dataElement,
  activeDetection,
}: {
  detection: Detection;
  dataElement: DataElement;
  activeDetection?: Detection;
}): OrnateTag => {
  const isActive =
    (activeDetection && activeDetection.id === detection.id) || false;

  const id = uuid(
    dataElement.id +
      detection.id +
      detection.state +
      detection.value +
      isActive,
    '00000000-0000-0000-0000-000000000000'
  );

  return {
    id,
    detection,
    dataElement,
    isActive,
  };
};
