import { useEffect } from 'react';
import styled from 'styled-components/macro';
import { useScreenshot } from 'use-screenshot-hook';
import { Button, Popconfirm, toast, Tooltip, TopBar } from '@cognite/cogs.js';
import { useNavigate } from 'hooks';
import { useDeleteChart, useUpdateChart } from 'hooks/firebase';
import {
  duplicate,
  downloadImage,
  toggleDownloadChartElements,
} from 'utils/charts';
import SharingDropdown from 'components/SharingDropdown/SharingDropdown';
import { trackUsage } from 'utils/metrics';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useRecoilState } from 'recoil';
import { chartState } from 'atoms/chart';

export const ChartActions = () => {
  const { takeScreenshot } = useScreenshot();
  const move = useNavigate();
  const [chart] = useRecoilState(chartState);
  const { data: login } = useUserInfo();

  const {
    mutateAsync: updateChart,
    isError: updateError,
    error: updateErrorMsg,
  } = useUpdateChart();

  const {
    mutate: deleteChart,
    isError: deleteError,
    error: deleteErrorMsg,
  } = useDeleteChart();

  const isOwner = login?.id === chart?.user;

  useEffect(() => {
    if (deleteError) {
      toast.error('Chart could not be deleted!', { toastId: 'delete-error' });
    }
    if (deleteError && deleteErrorMsg) {
      toast.error(JSON.stringify(deleteErrorMsg, null, 2), {
        toastId: 'delete-error-body',
      });
    }
  }, [deleteError, deleteErrorMsg]);

  useEffect(() => {
    if (updateError) {
      toast.error('Chart could not be saved!', { toastId: 'chart-update' });
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2), {
        toastId: 'chart-update-body',
      });
    }
  }, [updateError, updateErrorMsg]);

  const handleDuplicateChart = async () => {
    if (chart && login?.id) {
      const newChart = duplicate(chart, login);
      await updateChart(newChart);
      trackUsage('ChartView.DuplicateChart', { isOwner });
      move(`/${newChart.id}`);
    }
  };

  const handleDeleteChart = async () => {
    if (chart) {
      deleteChart(chart.id, {
        onSuccess: onDeleteSuccess,
        onError: onDeleteError,
      });
    }
  };

  const onDeleteSuccess = () => {
    move('/');
  };

  const onDeleteError = () => {
    toast.error('There was a problem deleting the chart. Try again!', {
      toastId: 'chart-delete',
    });
  };

  if (!chart) {
    return <></>;
  }

  return (
    <TopBar.Item className="downloadChartHide" style={{ padding: '0 3px' }}>
      <Tooltip content="Share">
        <SharingDropdown chart={chart} disabled={!isOwner} />
      </Tooltip>
      <Tooltip content="Download chart">
        <Button
          icon="Download"
          type="ghost"
          aria-label="download"
          onClick={() => {
            const height = toggleDownloadChartElements(true);
            takeScreenshot('png').then((image) => {
              toggleDownloadChartElements(false, height);
              downloadImage(image, chart.name);
            });
          }}
        />
      </Tooltip>
      <Tooltip content="Duplicate">
        <Button
          icon="Copy"
          type="ghost"
          onClick={handleDuplicateChart}
          aria-label="copy"
        />
      </Tooltip>
      <Divider />
      <Tooltip content="Delete">
        <Popconfirm
          content={<div>Are you sure you want to delete this chart?</div>}
          onConfirm={handleDeleteChart}
          disabled={!isOwner}
        >
          <Button
            icon="Trash"
            type="ghost"
            disabled={!isOwner}
            aria-label="delete"
          />
        </Popconfirm>
      </Tooltip>
      <Divider />
      <Tooltip content="Settings">
        <Button icon="Settings" type="ghost" disabled aria-label="settings" />
      </Tooltip>
    </TopBar.Item>
  );
};

const Divider = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey3);
  height: 24px;
  margin: 0 3px;
`;
