import React from 'react';
import { MonitoringJob } from 'components/MonitoringSidebar/types';
import { makeDefaultTranslations } from 'utils/translations';
import { customFormatDuration } from 'utils/date';

const defaultTranslations = makeDefaultTranslations('Condition');

type Props = {
  job: MonitoringJob;
  translations?: typeof defaultTranslations;
};
const JobCondition = ({ job, translations }: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };
  let thresholdCondition = '>';
  if (job.model.externalId === 'double_threshold') {
    if (job.model.upperThreshold) {
      thresholdCondition = '>';
    } else {
      thresholdCondition = '<';
    }
  }

  let { threshold } = job.model;

  if (job.model.externalId === 'double_threshold') {
    if (job.model.upperThreshold) {
      threshold = job.model.upperThreshold;
    } else {
      threshold = job.model.lowerThreshold;
    }
  }

  const alertEvery = customFormatDuration({ start: 0, end: job.interval });

  return (
    <>
      {t.Condition} : {`[is ${thresholdCondition} ${threshold}]`}
      {`[every > ${alertEvery}]`}
    </>
  );
};

export default JobCondition;
