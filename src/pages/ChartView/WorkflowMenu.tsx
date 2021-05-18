import React, { ReactNode } from 'react';
import { Menu } from '@cognite/cogs.js';
import { useUpdateChart } from 'hooks/firebase';
import { Chart } from 'reducers/charts/types';
import { duplicateWorkflow } from 'utils/charts';
import { useLoginStatus } from 'hooks';
import { trackUsage } from 'utils/metrics';

type Props = {
  chart: Chart;
  id: string;
  children?: ReactNode;
};

export default function WorkflowMenu({ id, chart, children }: Props) {
  const { data: login } = useLoginStatus();
  const { mutate } = useUpdateChart();

  const wf = chart?.workflowCollection?.find((t) => t.id === id);

  if (!login?.user || !wf) {
    return null;
  }
  const duplicate = () => {
    mutate(duplicateWorkflow(chart, id));
    trackUsage('ChartView.DuplicateCalculation');
  };

  return (
    <Menu>
      <Menu.Item onClick={() => duplicate()} appendIcon="Duplicate">
        <span>Duplicate</span>
      </Menu.Item>
      {children}
    </Menu>
  );
}
