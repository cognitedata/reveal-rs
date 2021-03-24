import React from 'react';
import { Menu } from '@cognite/cogs.js';
import { useChart, useUpdateChart } from 'hooks/firebase';
import { ChartWorkflow } from 'reducers/charts/types';
import {
  updateWorkflow,
  removeWorkflow,
  duplicateWorkflow,
} from 'utils/charts';
import { useLoginStatus } from 'hooks';
import ToolsMenu from './ToolsMenu';

type Props = {
  chartId: string;
  id: string;
  closeMenu?: () => void;
  startRenaming?: () => void;
};

export default function WorkflowMenu({
  id,
  chartId,
  closeMenu,
  startRenaming,
}: Props) {
  const { data: login } = useLoginStatus();
  const { data: chart } = useChart(chartId);
  const { mutate } = useUpdateChart();

  const wf = chart?.workflowCollection?.find((t) => t.id === id);

  if (!chart || !login?.user || !wf) {
    return null;
  }

  const update = (diff: Partial<ChartWorkflow>, close: boolean = true) => {
    mutate({ chart: updateWorkflow(chart, id, diff) });
    if (closeMenu && close) {
      closeMenu();
    }
  };
  const remove = () => mutate({ chart: removeWorkflow(chart, id) });
  const duplicate = () => mutate({ chart: duplicateWorkflow(chart, id) });

  return (
    <Menu>
      <ToolsMenu update={update} />
      <Menu.Item
        onClick={() => {
          if (startRenaming) startRenaming();
          if (closeMenu) closeMenu();
        }}
        appendIcon="Edit"
      >
        <span>Rename</span>
      </Menu.Item>
      <Menu.Item onClick={() => duplicate()} appendIcon="Duplicate">
        <span>Duplicate</span>
      </Menu.Item>
      <Menu.Item onClick={() => remove()} appendIcon="Delete">
        <span>Remove</span>
      </Menu.Item>
    </Menu>
  );
}
