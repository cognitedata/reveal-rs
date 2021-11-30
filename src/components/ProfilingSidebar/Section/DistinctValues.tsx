import React from 'react';
import { Body, Flex, Label } from '@cognite/cogs.js';
import { Section } from '.';

type Props = {
  allCount: number;
  distinctCount: number;
  title?: string;
};

export const DistinctValues = ({
  allCount,
  distinctCount,
  title,
}: Props): JSX.Element => {
  const percentage =
    allCount !== 0 ? Math.ceil((distinctCount / allCount) * 100) : 0;
  const variant = percentage === 100 ? 'success' : 'default';
  return (
    <Section title={title ?? 'Distinct values'}>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ width: '100%' }}
      >
        <Body level={2}>{distinctCount}</Body>
        <Label size="small" variant={variant}>
          {percentage}% unique values
        </Label>
      </Flex>
    </Section>
  );
};
