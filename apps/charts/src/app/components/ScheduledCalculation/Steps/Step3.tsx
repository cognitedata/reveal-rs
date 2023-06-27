import { useTranslations } from '@charts-app/hooks/translations';
import { makeDefaultTranslations } from '@charts-app/utils/translations';

import { Flex, Button, Title, Body } from '@cognite/cogs.js';

import { ErrorIcon } from './elements';

const defaultTranslations = makeDefaultTranslations(
  'Error occured',
  'Cancel',
  'Retry',
  'Process failed due to a critical error. Please retry action using button below or start over. If the problem will continue contact our support.'
);

export const Step3Header = () => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ScheduledCalculation')
      .t,
  };

  return (
    <Flex gap={8} alignItems="center">
      <ErrorIcon type="WarningFilled" />
      <Title level={5}>{t['Error occured']}</Title>
    </Flex>
  );
};

export const Step3Body = () => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ScheduledCalculation')
      .t,
  };

  return (
    <Flex gap={8}>
      <Body level={2}>
        {
          t[
            'Process failed due to a critical error. Please retry action using button below or start over. If the problem will continue contact our support.'
          ]
        }
      </Body>
    </Flex>
  );
};

type FooterProps = {
  onNext: () => void;
  onCancel: () => void;
  loading: boolean;
};

export const Step3Footer = ({ onNext, onCancel, loading }: FooterProps) => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ScheduledCalculation')
      .t,
  };

  return (
    <Flex alignItems="center" justifyContent="end" gap={8}>
      <Button onClick={onCancel} type="ghost">
        {t.Cancel}
      </Button>
      <Button onClick={onNext} type="primary" icon="Restore" loading={loading}>
        {t.Retry}
      </Button>
    </Flex>
  );
};
