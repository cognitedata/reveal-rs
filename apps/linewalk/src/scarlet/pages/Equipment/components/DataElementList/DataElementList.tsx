import { Button } from '@cognite/cogs.js';
import { useMemo, useState } from 'react';
import { useAppState } from 'scarlet/hooks';
import { DataElement } from 'scarlet/types';
import { getDataElementConfig, getDataElementValue } from 'scarlet/utils';

import {
  DataElement as DataElementComponent,
  DataElementListSkeleton,
} from '..';

import { sortDataElements } from './utils';

const DATA_ELEMENT_HEIGHT = 64;
const SIDE_OFFSET = 350;
let PARTIAL_AMOUNT =
  Math.floor((window.innerHeight - SIDE_OFFSET) / DATA_ELEMENT_HEIGHT) - 1;
if (PARTIAL_AMOUNT < 6) {
  PARTIAL_AMOUNT = 6;
}

type DataElementListProps = {
  data?: DataElement[];
  loading: boolean;
  skeletonAmount: number;
  partial?: boolean;
};

export const DataElementList = ({
  data,
  loading,
  skeletonAmount,
  partial = false,
}: DataElementListProps) => {
  const { equipmentConfig } = useAppState();
  const sortedList = useMemo(
    () =>
      (data &&
        [...data]
          .map((dataElement) => ({
            dataElement,
            value: getDataElementValue(dataElement),
            label:
              getDataElementConfig(equipmentConfig.data, dataElement)?.label ||
              dataElement.key,
          }))
          .sort(sortDataElements)
          .map((item) => item.dataElement)) ||
      [],
    [data]
  );
  const isPartialActive = partial && sortedList.length - PARTIAL_AMOUNT > 4;
  const [isPartial, setIsPartial] = useState(isPartialActive);
  const visibleDataElements = useMemo(() => {
    if (!isPartial) return sortedList;
    return sortedList?.slice(0, PARTIAL_AMOUNT);
  }, [isPartial, sortedList]);

  if (loading) {
    return <DataElementListSkeleton amount={skeletonAmount} />;
  }

  return (
    <>
      {visibleDataElements?.map((item) => (
        <DataElementComponent key={item.id} dataElement={item} />
      ))}
      {isPartialActive && (
        <Button
          type="tertiary"
          onClick={() => setIsPartial((isPartial) => !isPartial)}
          block
        >
          {isPartial
            ? `Show more (${sortedList.length - visibleDataElements.length})`
            : `Show less`}
        </Button>
      )}
    </>
  );
};
