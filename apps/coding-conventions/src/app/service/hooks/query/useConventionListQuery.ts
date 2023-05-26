import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { Database } from '../../storage/Database';

export const useConventionListQuery = () => {
  const { systemId } = useParams();

  return useQuery(
    ['convention', systemId],
    ({ queryKey: [_, id] }) => {
      return Database.listConventions(id!);
    },
    {
      enabled: !!systemId,
    }
  );
};
