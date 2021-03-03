import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import {
  CreateIntegrationPageWrapper,
  GridBreadCrumbsWrapper,
  GridH2Wrapper,
  GridMainWrapper,
  GridTitleWrapper,
} from '../../styles/StyledPage';
import { NEXT } from '../../utils/constants';
import { CreateFormWrapper } from '../../styles/StyledForm';
import {
  CONTACTS_PAGE_PATH,
  DATA_SET_PAGE_PATH,
} from '../../routing/CreateRouteConfig';
import CronInput from '../../components/inputs/cron/CronInput';
import { DivFlex } from '../../styles/flex/StyledFlex';
import {
  CRON_REQUIRED,
  cronValidator,
} from '../../utils/validation/cronValidation';

const CronWrapper = styled(DivFlex)`
  margin: 1rem 2rem;
  padding: 1rem 0 0 0;
  border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
  border-bottom: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
`;
const StyledRadioGroup = styled.fieldset`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  legend {
    font-weight: bold;
    font-size: initial;
    margin-bottom: 0;
  }
`;
const RadioInputsWrapper = styled.div`
  display: grid;
  input[type='radio'] {
    opacity: 0;
    &:checked {
      + label::after {
        background: ${Colors.primary.hex()};
      }
      + label::before {
        border: 0.125rem solid ${Colors.primary.hex()};
      }
    }
    &:focus {
      + label::before {
        box-shadow: 0 0 0.5rem ${Colors.primary.hex()};
      }
    }
    + label {
      position: relative;
      display: inline-block;
      cursor: pointer;
      margin-left: 1.875rem;
      &:hover {
        &::before {
          border: 0.125rem solid ${Colors.primary.hex()};
        }
      }

      &::before {
        content: '';
        position: absolute;
        display: inline-block;
        left: -1.875rem;
        top: -0.1875rem;
        border-radius: 50%;
        border: 0.125rem solid ${Colors.black.hex()};
        width: 1.5625rem;
        height: 1.5625rem;
        background: transparent;
      }
      &::after {
        content: '';
        position: absolute;
        display: inline-block;
        left: -1.5625rem;
        top: 0.125rem;
        border-radius: 50%;
        width: 0.9375rem;
        height: 0.9375rem;
        background: transparent;
      }
    }
  }
`;
interface SchedulePageProps {}

interface ScheduleFormInput {
  schedule: string;
}

export const INTEGRATION_SCHEDULE_HEADING: Readonly<string> =
  'Integration schedule';
const SCHEDULE_REQUIRED: Readonly<string> = 'Schedule is required';
const scheduleSchema = yup.object().shape({
  schedule: yup.string().required(SCHEDULE_REQUIRED),
  cron: yup.string().when('schedule', {
    is: (val: SupportedScheduleStrings) =>
      val === SupportedScheduleStrings.SCHEDULED, // alternatively: (val) => val == true
    then: yup
      .string()
      .required(CRON_REQUIRED)
      .test('cron-expression', 'Cron not valid', cronValidator),
  }),
});
const SchedulePage: FunctionComponent<SchedulePageProps> = () => {
  const history = useHistory();
  const [showCron, setShowCron] = useState(false);
  const methods = useForm<ScheduleFormInput>({
    resolver: yupResolver(scheduleSchema),
    defaultValues: {},
    reValidateMode: 'onSubmit',
  });
  const { register, handleSubmit, errors, watch } = methods;
  const scheduleValue = watch('schedule');
  useEffect(() => {
    if (scheduleValue === SupportedScheduleStrings.SCHEDULED) {
      setShowCron(true);
    } else {
      setShowCron(false);
    }
  }, [scheduleValue]);
  const handleNext = () => {
    history.push(createLink(DATA_SET_PAGE_PATH));
  };
  const v = watch('schedule');
  return (
    <CreateIntegrationPageWrapper>
      <GridBreadCrumbsWrapper to={createLink(CONTACTS_PAGE_PATH)}>
        Back
      </GridBreadCrumbsWrapper>
      <GridTitleWrapper>Create integration</GridTitleWrapper>
      <GridMainWrapper>
        <GridH2Wrapper>{INTEGRATION_SCHEDULE_HEADING}</GridH2Wrapper>
        <FormProvider {...methods}>
          <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
            <StyledRadioGroup>
              <legend>Schedule</legend>
              <span id="schedule-hint" className="input-hint">
                Select whether your integration runs according to a defined
                schedule, is triggered by some irregular automatic or manual
                event, or pushes data continuously, such as streaming or
                continuous polling for new data.
              </span>
              <ErrorMessage
                errors={errors}
                name="schedule"
                render={({ message }) => (
                  <span id="schedule-error" className="error-message">
                    {message}
                  </span>
                )}
              />
              <RadioInputsWrapper>
                {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
                <input
                  type="radio"
                  id="scheduled"
                  name="schedule"
                  aria-checked={SupportedScheduleStrings.SCHEDULED === v}
                  ref={register}
                  value={SupportedScheduleStrings.SCHEDULED}
                  aria-controls="cron-expression"
                  aria-expanded={showCron}
                />
                <label id="scheduled-label" htmlFor="scheduled">
                  {SupportedScheduleStrings.SCHEDULED}
                </label>
                {showCron && (
                  <CronWrapper
                    id="cron-expression"
                    role="region"
                    direction="column"
                    align="flex-start"
                  >
                    <CronInput />
                  </CronWrapper>
                )}

                <input
                  type="radio"
                  id="continuous"
                  name="schedule"
                  aria-checked={SupportedScheduleStrings.CONTINUOUS === v}
                  ref={register}
                  value={SupportedScheduleStrings.CONTINUOUS}
                />
                <label htmlFor="continuous">
                  {SupportedScheduleStrings.CONTINUOUS}
                </label>
                <input
                  type="radio"
                  id="on-trigger"
                  name="schedule"
                  aria-checked={SupportedScheduleStrings.ON_TRIGGER === v}
                  ref={register}
                  value={SupportedScheduleStrings.ON_TRIGGER}
                />
                <label htmlFor="on-trigger">
                  {SupportedScheduleStrings.ON_TRIGGER}
                </label>
                <input
                  type="radio"
                  id="not-defined"
                  name="schedule"
                  ref={register}
                  aria-checked={SupportedScheduleStrings.NOT_DEFINED === v}
                  value={SupportedScheduleStrings.NOT_DEFINED}
                />
                <label htmlFor="not-defined">
                  {SupportedScheduleStrings.NOT_DEFINED}
                </label>
              </RadioInputsWrapper>
            </StyledRadioGroup>
            <Button type="primary" htmlType="submit">
              {NEXT}
            </Button>
          </CreateFormWrapper>
        </FormProvider>
      </GridMainWrapper>
    </CreateIntegrationPageWrapper>
  );
};
export default SchedulePage;
