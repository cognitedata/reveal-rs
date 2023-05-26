import { useGetSearchConfigFromLocalStorage } from '@data-exploration-lib/core';
import { useDocumentFilteredAggregateCount } from '@data-exploration-lib/domain-layer';

import { CounterTab } from './elements';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';
import { ResourceTabProps } from './types';

// This is FilesTab with counts when advanced filters are enabled!
export const DocumentsTab = ({
  query,
  filter,

  ...rest
}: ResourceTabProps) => {
  const documentSearchConfig = useGetSearchConfigFromLocalStorage('file');
  const { data: filteredDocumentCount = 0, isLoading } =
    useDocumentFilteredAggregateCount(
      { filters: filter, query },
      documentSearchConfig
    );

  const chipRightProps = getChipRightPropsForResourceCounter(
    filteredDocumentCount,
    isLoading
  );

  return <CounterTab label="Files" {...chipRightProps} {...rest} />;
};
