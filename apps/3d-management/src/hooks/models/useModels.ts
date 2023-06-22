import { useQuery, useQueryClient } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { HttpError, Model3D } from '@cognite/sdk';

import { fireErrorNotification, QUERY_KEY } from '../../utils';

const fetchModels = (): Promise<Model3D[]> => {
  return sdk.models3D.list().autoPagingToArray({ limit: Infinity });
};

export function useModels() {
  const queryClient = useQueryClient();
  const queryKey = QUERY_KEY.MODELS;

  return useQuery<Model3D[], HttpError>(queryKey, fetchModels, {
    refetchOnMount: false,
    initialData: () => queryClient.getQueryData(queryKey),
    onError: (error) => {
      fireErrorNotification({ error, message: 'Could not fetch the models' });
    },
  });
}
