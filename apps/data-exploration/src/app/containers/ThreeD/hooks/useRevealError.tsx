import { useEffect } from 'react';
import { toast } from '@cognite/cogs.js';
import RevealErrorToast from '@data-exploration-app/containers/ThreeD/RevealErrorToast';
import { UseQueryResult } from '@tanstack/react-query';

export const useRevealError = (
  result: UseQueryResult<boolean | undefined, { message: string }>[]
) => {
  useEffect(() => {
    const errors = result
      .filter(({ isError }) => !!isError)
      .map((errorObj) => errorObj.error);

    if (errors.length) {
      errors.forEach((error) => {
        toast.error(
          <RevealErrorToast error={error as { message?: string }} />,
          {
            toastId: 'reveal-model-load-error',
            autoClose: false,
          }
        );
      });
    }
  }, [result]);
};
