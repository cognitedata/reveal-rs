import { useSDK } from '@cognite/sdk-provider';
import { Toast } from 'components/Toast';
import { useMutation, useQueryClient } from 'react-query';
import {
  createDocumentClassifier,
  deleteDocumentClassifier,
} from 'services/api';
import { DOCUMENTS_QUERY_KEYS } from 'services/constants';
import { ApiError } from 'services/types';

export const useClassifierCreateMutate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    (classifierName: string) => createDocumentClassifier(sdk, classifierName),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(DOCUMENTS_QUERY_KEYS.trainingSet);
      },
      onError: (error: ApiError) => {
        Toast.error({
          title: `Failed while creating a classifier model`,
          status: error?.status || 400,
          message: error?.message,
        });
      },
    }
  );
};

export const useClassifierDeleteMutate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    (classifierId: number) => deleteDocumentClassifier(sdk, classifierId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(DOCUMENTS_QUERY_KEYS.classifier);
      },
      onError: (error: ApiError) => {
        Toast.error({
          title: `Failed while deleting a classifier model`,
          status: error?.status || 400,
          message: error?.message,
        });
      },
    }
  );
};
