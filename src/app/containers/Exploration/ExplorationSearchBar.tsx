import React, { useState, useEffect } from 'react';
import { Input } from '@cognite/cogs.js';
import { debounce } from 'lodash';
import { useQueryString } from 'app/hooks/hooks';
import { SEARCH_KEY } from 'app/utils/constants';
import { trackUsage } from 'app/utils/Metrics';
import { EXPLORATION } from 'app/constants/metrics';
import styled from 'styled-components';
import { useFlagAdvancedFilters } from 'app/hooks/flags/useFlagAdvancedFilters';

export const ExplorationSearchBar = () => {
  const [urlQuery, setUrlQuery] = useQueryString(SEARCH_KEY);
  const debouncedSetUrlQuery = debounce(setUrlQuery, 200);
  const [localQuery, setLocalQuery] = useState(urlQuery);
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  useEffect(() => {
    if (localQuery !== urlQuery) {
      debouncedSetUrlQuery(localQuery);
    }
    return () => debouncedSetUrlQuery.cancel();
  }, [debouncedSetUrlQuery, localQuery, urlQuery]);

  useEffect(() => {
    if (localQuery !== urlQuery) {
      setLocalQuery(urlQuery);
    }
    // Disabeling react-hooks/exhaustive-deps because this should /not/ be
    // triggered when localQuery changes.
    // eslint-disable-next-line
  }, [urlQuery, setLocalQuery]);

  const track = debounce((value: string) => {
    trackUsage(EXPLORATION.SEARCH.GLOBAL, { query: value });
  }, 500);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(event.target.value);
    track(event.target.value);
  };

  return (
    <StyledInput
      size="large"
      variant="noBorder"
      autoFocus
      fullWidth
      clearable={{ callback: () => setLocalQuery('') }}
      icon="Search"
      placeholder={
        isAdvancedFiltersEnabled
          ? 'Search for name, description, content, ID, and external ID...'
          : 'Search...'
      }
      onChange={handleOnChange}
      value={localQuery}
    />
  );
};

const StyledInput = styled(Input)`
  .btn-reset {
    background: inherit !important;
  }
`;
