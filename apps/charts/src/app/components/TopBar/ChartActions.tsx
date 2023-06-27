import { ComponentProps, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CSVModal from '@charts-app/components/CSVModal/CSVModal';
import DownloadDropdown from '@charts-app/components/DownloadDropdown/DownloadDropdown';
import ConnectedSharingDropdown from '@charts-app/components/SharingDropdown/ConnectedSharingDropdown';
import { currentDateRangeLocale } from '@charts-app/config/locale';
import {
  useDeleteChart,
  useUpdateChart,
} from '@charts-app/hooks/charts-storage';
import { useTranslations } from '@charts-app/hooks/translations';
import { useIsChartOwner } from '@charts-app/hooks/user';
import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import chartAtom from '@charts-app/models/chart/atom';
import { duplicateChart } from '@charts-app/models/chart/helpers';
import { updateChartDateRange } from '@charts-app/models/chart/updates';
import { trackUsage } from '@charts-app/services/metrics';
import {
  downloadCalculations,
  downloadImage,
  toggleDownloadChartElements,
} from '@charts-app/utils/charts';
import { createInternalLink } from '@charts-app/utils/link';
import { useRecoilState } from 'recoil';
import useScreenshot from 'use-screenshot-hook';

import { Button, Dropdown, Popconfirm, toast } from '@cognite/cogs.js';

import {
  StyledMenu,
  HorizontalDivider,
  StyledMenuButton,
  StyledMenuButtonDelete,
  StyledMenuDuplicate,
  PopupText,
  PopupContainer,
} from './elements';

export const ChartActions = () => {
  const { t } = useTranslations(
    [
      'Chart could not be deleted!',
      'Chart could not be saved!',
      'There was a problem deleting the chart. Try again!',
      'Share',
      'Download Chart',
      'Duplicate',
      'Delete',
      'Delete chart',
      'Are you sure you want to delete this chart?',
    ],
    'ChartActions'
  );
  const { t: dropdownTranslations } = useTranslations(
    DownloadDropdown.translationKeys,
    'DownloadDropdown'
  );
  const { t: CSVModalTranslations } = useTranslations(
    CSVModal.translationKeys,
    'DownloadCSVModal'
  );

  const move = useNavigate();
  const [chart, setChart] = useRecoilState(chartAtom);
  const { data: login } = useUserInfo();
  const { takeScreenshot } = useScreenshot();
  const [isCSVModalVisible, setIsCSVModalVisible] = useState(false);

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

  const isOwner = useIsChartOwner(chart);

  const deleteErrorText = t['Chart could not be deleted!'];
  const saveErrorText = t['Chart could not be saved!'];

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteErrorText, {
        toastId: 'delete-error',
      });
    }
    if (deleteError && deleteErrorMsg) {
      toast.error(JSON.stringify(deleteErrorMsg, null, 2), {
        toastId: 'delete-error-body',
      });
    }
  }, [deleteError, deleteErrorMsg, deleteErrorText]);

  useEffect(() => {
    if (updateError) {
      toast.error(saveErrorText, { toastId: 'chart-update' });
    }
    if (updateError && updateErrorMsg) {
      toast.error(JSON.stringify(updateErrorMsg, null, 2), {
        toastId: 'chart-update-body',
      });
    }
  }, [updateError, updateErrorMsg, saveErrorText]);

  const handleDuplicateChart = async () => {
    if (chart && login?.id) {
      const newChart = duplicateChart(chart, login);
      await updateChart(newChart);
      trackUsage('ChartView.DuplicateChart', { isOwner });
      move(createInternalLink(newChart.id));
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
    move(createInternalLink());
  };

  const onDeleteError = () => {
    toast.error(t['There was a problem deleting the chart. Try again!'], {
      toastId: 'chart-delete',
    });
  };

  const handleDownloadCalculations = () => {
    const calculations = chart?.workflowCollection || [];
    downloadCalculations(calculations, chart?.name);
  };

  const handleDownloadImage = () => {
    const height = toggleDownloadChartElements(true);
    takeScreenshot('png').then((image) => {
      toggleDownloadChartElements(false, height);
      downloadImage(image, chart?.name);
    });
  };

  const handleDateChange: ComponentProps<typeof CSVModal>['onDateChange'] = ({
    startDate,
    endDate,
  }) => {
    if (startDate || endDate) {
      setChart((oldChart: any) =>
        updateChartDateRange(oldChart!, startDate, endDate)
      );
      trackUsage('ChartView.DateChange', { source: 'daterange' });
    }
  };

  if (!chart) {
    return <></>;
  }

  const popperOptions = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [-550, 10],
        },
      },
    ],
  };
  return (
    <>
      <Dropdown
        content={
          <StyledMenu className="downloadChartHide">
            <StyledMenuButton type="ghost">
              <ConnectedSharingDropdown
                label={t.Share}
                popperOptions={popperOptions}
              />
            </StyledMenuButton>
            <StyledMenuButton type="ghost">
              <DownloadDropdown
                label={t['Download Chart']}
                translations={dropdownTranslations}
                onDownloadCalculations={handleDownloadCalculations}
                onDownloadImage={handleDownloadImage}
                onCsvDownload={() => setIsCSVModalVisible(true)}
              />
            </StyledMenuButton>
            <StyledMenuDuplicate
              icon="Duplicate"
              type="ghost"
              onClick={handleDuplicateChart}
            >
              {t.Duplicate}
            </StyledMenuDuplicate>
            <HorizontalDivider />
            <PopupContainer>
              <Popconfirm
                content={
                  <PopupText>
                    {t['Are you sure you want to delete this chart?']}
                  </PopupText>
                }
                onConfirm={handleDeleteChart}
                disabled={!isOwner}
              >
                <StyledMenuButtonDelete
                  icon="Delete"
                  type="ghost"
                  onClick={() => {}}
                >
                  {t['Delete chart']}
                </StyledMenuButtonDelete>
              </Popconfirm>
            </PopupContainer>
          </StyledMenu>
        }
      >
        <Button icon="EllipsisHorizontal" iconPlacement="right">
          Actions
        </Button>
      </Dropdown>
      <CSVModal
        isOpen={isCSVModalVisible}
        onClose={() => setIsCSVModalVisible(false)}
        translations={CSVModalTranslations}
        dateFrom={new Date(chart.dateFrom)}
        dateTo={new Date(chart.dateTo)}
        onDateChange={handleDateChange}
        locale={currentDateRangeLocale()}
      />
    </>
  );
};
