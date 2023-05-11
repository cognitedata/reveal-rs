import { ExternalId } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { fetchScheduledCalculationTasks } from '../network/fetchScheduledCalculationTasks';
import { CalculationTaskSchedule } from '../types';

export const useScheduledCalculationTasks = (externalIds: ExternalId[]) => {
  const sdk = useSDK();

  return useQuery<CalculationTaskSchedule[]>(
    ['scheduled-calculations', externalIds],
    () => {
      return fetchScheduledCalculationTasks(externalIds, sdk).then(
        ({ data }) => data.items
      );
    }
  );
};
