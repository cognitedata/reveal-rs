import React from 'react';
import { LabelFilter } from '@cognite/data-exploration';
import { VisionFilterItemProps } from './types';

export const SelectLabelsFilter = ({
  filter,
  setFilter,
}: VisionFilterItemProps) => (
  <LabelFilter
    resourceType="file"
    value={((filter as any).labels || { containsAny: [] }).containsAny}
    setValue={(newFilters) =>
      setFilter({
        ...filter,
        labels: newFilters ? { containsAny: newFilters } : undefined,
      })
    }
  />
);
