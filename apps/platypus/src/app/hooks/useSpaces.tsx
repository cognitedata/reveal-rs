import { SpaceInstance } from '@platypus/platypus-core';
import { TOKENS } from '@platypus-app/di';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from 'brandi-react';

export const useSpaces = () => {
  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);
  const listSpacesMaxLimit = 1000;

  return useQuery<SpaceInstance[], string | any>(
    QueryKeys.SPACES_LIST,
    async () => {
      const result = await dataModelsHandler.getSpaces({
        limit: listSpacesMaxLimit,
      });
      if (result.isFailure) throw result.error;
      return result.getValue();
    }
  );
};
