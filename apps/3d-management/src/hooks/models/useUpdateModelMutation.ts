import sdk from '@cognite/cdf-sdk-singleton';
import { HttpError, Model3D } from '@cognite/sdk';
import { useMutation, useQueryCache } from 'react-query';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';

type UpdateArgs = { id: number; name: string };

const updateModel = async ({ id, name }: UpdateArgs): Promise<Model3D> => {
  const items = await sdk.models3D.update([
    {
      id,
      update: { name: { set: name } },
    },
  ]);
  return items[0];
};

export function useUpdateModelMutation() {
  const queryCache = useQueryCache();
  return useMutation<Model3D, HttpError, UpdateArgs, Model3D[]>(updateModel, {
    onMutate: ({ id, name }: UpdateArgs) => {
      const snapshot = queryCache.getQueryData<Model3D[]>(QUERY_KEY.MODELS);

      queryCache.setQueryData<Model3D[]>(QUERY_KEY.MODELS, (old) => {
        return (old || []).map((model) => {
          return model.id === id ? { ...model, name } : model;
        });
      });

      return snapshot || [];
    },
    onError: (error, _, snapshotValue) => {
      queryCache.setQueryData(QUERY_KEY.MODELS, snapshotValue);
      fireErrorNotification({
        error,
        message: 'Error: Could not rename a model',
      });
    },
  });
}
