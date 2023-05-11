import { useMutation } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import { useCreateSessionNonce, SessionAPIResponse } from 'domain/chart';
import { ComputationStep } from '@cognite/calculation-backend';
import { CogniteError, Timeseries } from '@cognite/sdk';
import { createScheduledCalculation } from '../network/createScheduledCalculation';
import { ScheduleCalculationFieldValues } from '../../internal/types';
import { CalculationTaskSchedule } from '../types';
import { useTimeseriesCreateMutate } from './useTimeseriesCreateMutate';

type MutateProps = {
  calculation: ScheduleCalculationFieldValues;
  workflowSteps: ComputationStep[];
};
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

const PERIOD_MULTIPLIER: Record<string, number> = {
  minutes: ONE_MINUTE,
  hours: ONE_HOUR,
  days: ONE_DAY,
};

export const useScheduledCalculationCreateMutate = () => {
  const sdk = useSDK();
  const { mutateAsync: createNonce } = useCreateSessionNonce();
  const { mutateAsync: createTimeseries } = useTimeseriesCreateMutate();

  return useMutation<CalculationTaskSchedule, CogniteError, MutateProps>(
    ({ calculation, workflowSteps }) => {
      const period =
        calculation.period * PERIOD_MULTIPLIER[calculation.periodType.value!];
      const adaptedNameForExternalId = calculation.name.replaceAll(' ', '_');
      const now = Date.now();

      return createTimeseries([
        {
          name: `ScheduledCalculation: ${calculation.name}`,
          externalId: `${adaptedNameForExternalId}_${now}_TS`,
          unit: calculation.unit.value,
        },
      ])
        .catch(() => {
          throw new Error(
            'Could not create timeseries for scheduled calculation!'
          );
        })
        .then<[Timeseries, SessionAPIResponse]>(async ([timeseries]) => {
          try {
            let nonceResponse;
            if (calculation.cdfCredsMode === 'USER_CREDS') {
              nonceResponse = await createNonce({
                items: [{ tokenExchange: true }],
              });
            } else {
              nonceResponse = await createNonce({
                items: [
                  {
                    clientId: calculation.clientId,
                    clientSecret: calculation.clientSecret,
                  },
                ],
              });
            }
            return [timeseries, nonceResponse];
          } catch {
            throw new Error('Could not create nonce from credentials!');
          }
        })
        .then(([timeseries, nonceResponse]) =>
          createScheduledCalculation(
            {
              items: [
                {
                  name: calculation.name,
                  externalId: `${adaptedNameForExternalId}_${now}`,
                  description: calculation.description,
                  targetTimeseriesExternalId: timeseries.externalId!,
                  period,
                  nonce: nonceResponse.items[0].nonce,
                  graph: {
                    granularity: `${calculation.period}${calculation.periodType.value?.[0]}`,
                    steps: workflowSteps.map(
                      ({ op, inputs, version, step }) => ({
                        op,
                        inputs,
                        version,
                        step,
                        raw: true,
                      })
                    ),
                  },
                },
              ],
            },
            sdk
          )
        )
        .then(({ data }) => {
          return data.items?.[0];
        });
    }
  );
};
