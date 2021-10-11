import React, { useEffect } from 'react';

import {
  useFilterBarIsOpen,
  useFilterCategory,
} from 'modules/sidebar/selectors';

import { MS_TRANSITION_TIME } from './constants';
import { FilterBarContainer } from './elements';
import {
  LandingFilter,
  DocumentFilter,
  SeismicFilter,
  WellsFilter,
} from './filters';

export const FilterBar: React.FC = () => {
  // const { isOpen, category } = useFilterState();
  const isOpen = useFilterBarIsOpen();
  const category = useFilterCategory();

  useEffect(() => {
    setTimeout(() => {
      // Trigger a resize for the map to change width after transition has finished
      window.dispatchEvent(new Event('resize'));
    }, MS_TRANSITION_TIME);
  }, [isOpen]);

  const CategoryPage = () => {
    if (category === 'documents') {
      return <DocumentFilter />;
    }
    if (category === 'seismic') {
      return <SeismicFilter />;
    }
    if (category === 'wells') {
      return <WellsFilter />;
    }
    return <LandingFilter />;
  };

  return (
    <FilterBarContainer isOpen={isOpen}>{CategoryPage()}</FilterBarContainer>
  );
};
