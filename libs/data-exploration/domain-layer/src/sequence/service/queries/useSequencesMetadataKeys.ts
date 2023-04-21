import { useMemo } from 'react';

import { useSequencesMetadataKeysAggregateQuery } from './useSequenceMetadataKeysAggregateQuery';

interface Props {
  query?: string;
  enabled?: boolean;
}

export const useSequencesMetadataKeys = ({ query, enabled }: Props = {}) => {
  const { data, ...rest } = useSequencesMetadataKeysAggregateQuery({
    prefix: query,
  });

  const metadataKeys = useMemo(() => {
    return data?.map(({ value }) => value);
  }, [data]);

  return {
    data: metadataKeys,
    ...rest,
  };
};
