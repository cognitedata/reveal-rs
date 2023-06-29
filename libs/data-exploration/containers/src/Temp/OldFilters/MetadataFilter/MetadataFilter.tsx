import React, { useMemo } from 'react';

import styled from 'styled-components';

import { Body, Button } from '@cognite/cogs.js';

import {
  DATA_EXPLORATION_COMPONENT,
  useMetrics,
  useTranslation,
} from '@data-exploration-lib/core';

import { FilterFormV2 } from '../../FilterFormV2/FilterFormV2';

import { mergeUniqueMetadataKeys } from './utils';

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  align-items: center;
`;

export const MetadataFilterV2 = <
  T extends { metadata?: { [key: string]: string } }
>({
  items,
  keys,
  value,
  setValue,
  useAggregateMetadataValues,
}: {
  items: T[];
  keys?: { value: string; count: number }[];
  value: { key: string; value: string }[] | undefined;
  setValue: (newValue: { key: string; value: string }[] | undefined) => void;
  useAggregateMetadataValues?: (key?: string | null) => {
    data: any;
    isFetching: boolean;
    isFetched: boolean;
  };
}) => {
  const { t } = useTranslation();
  const trackUsage = useMetrics();
  const metadata = useMemo(() => {
    if (!useAggregateMetadataValues) {
      return mergeUniqueMetadataKeys(items);
    }
    return {};
  }, [useAggregateMetadataValues, items]);

  const setFilter = (newFilters: { key: string; value: string }[]) => {
    setValue(newFilters);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.METADATA_FILTER, newFilters);
  };

  const clearFilters = () => {
    setValue(undefined);
  };

  const showClearFiltersButton = (value || []).length > 0;

  return (
    <>
      <FilterHeader>
        <Body level={2} strong style={{ marginBottom: 5 }} className="title">
          {t('METADATA', 'Metadata')}
        </Body>
        {showClearFiltersButton && (
          <Button type="ghost" onClick={clearFilters}>
            {t('CLEAR_ALL', 'Clear all')}
          </Button>
        )}
      </FilterHeader>

      <FilterFormV2
        metadata={metadata}
        keys={keys}
        filters={value}
        setFilters={setFilter}
        useAggregateMetadataValues={useAggregateMetadataValues}
      />
    </>
  );
};
