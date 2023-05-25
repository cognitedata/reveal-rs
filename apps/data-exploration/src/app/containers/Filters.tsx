import React from 'react';

import styled from 'styled-components';
import { ResourceType } from '@cognite/data-exploration';
import { DocumentFilter } from '@data-exploration-app/containers/Document/DocumentFilters';
import { BaseFilterCollapse } from '../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';

import { AssetFilters } from './Asset/AssetFilters';
import { EventFilters } from './Event/EventFilters';
import { CommonFilter } from './Common/CommonFilter';
import { FileFilters } from './File/FileFilters';
import { TimeseriesFilters } from './Timeseries/TimeseriesFilters';
import { SequenceFilters } from './Sequence/SequenceFilters';

export interface Props {
  resourceType?: ResourceType;
  enableAdvancedFilters?: boolean;
}

export const Filters: React.FC<Props> = ({
  resourceType,
  enableAdvancedFilters,
}) => {
  const renderCustomResourceTypeFilter = () => {
    switch (resourceType) {
      case 'asset': {
        return <AssetFilters />;
      }
      case 'event': {
        return <EventFilters />;
      }
      case 'timeSeries': {
        return <TimeseriesFilters />;
      }
      case 'file': {
        if (enableAdvancedFilters) {
          return <DocumentFilter />;
        }
        return <FileFilters />;
      }
      case 'sequence': {
        return <SequenceFilters />;
      }
      default: {
        return null;
      }
    }
  };

  return (
    <Container>
      <BaseFilterCollapse>
        <CommonFilter resourceType={resourceType} />
        {renderCustomResourceTypeFilter()}
      </BaseFilterCollapse>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  padding: 8px 0;
  flex-direction: column;
  overflow-y: auto;
`;
