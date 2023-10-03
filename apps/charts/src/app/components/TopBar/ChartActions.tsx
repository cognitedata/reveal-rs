import { ComponentProps, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useRecoilState } from 'recoil';

import { Button, Dropdown, toast, Divider } from '@cognite/cogs.js';

import { currentDateRangeLocale } from '../../config/locale';
import { useDeleteChart, useUpdateChart } from '../../hooks/charts-storage';
import { useTranslations } from '../../hooks/translations';
import { useIsChartOwner } from '../../hooks/user';
import { useUserInfo } from '../../hooks/useUserInfo';
import chartAtom from '../../models/chart/atom';
import { duplicateChart } from '../../models/chart/helpers';
import { updateChartDateRange } from '../../models/chart/updates';
import { trackUsage } from '../../services/metrics';
import {
  downloadCalculations,
  downloadImage,
  toggleDownloadChartElements,
} from '../../utils/charts';
import { wait } from '../../utils/helpers';
import { createInternalLink } from '../../utils/link';
import { makeDefaultTranslations } from '../../utils/translations';
import CSVModal from '../CSVModal/CSVModal';
import { DeleteModal } from '../DeleteModal/DeleteModal';
import DownloadDropdown from '../DownloadDropdown/DownloadDropdown';
import ConnectedSharingDropdown from '../SharingDropdown/ConnectedSharingDropdown';

import { StyledMenu, StyledMenuButton } from './elements';

const defaultTranslations = makeDefaultTranslations(
  'Actions',
  'Chart could not be deleted!',
  'Chart could not be saved!',
  'There was a problem deleting the chart. Try again!',
  'Share',
  'Download Chart',
  'Duplicate',
  'Delete',
  'Delete chart',
  'Are you sure you want to delete this chart?',
  'Please wait while we take a screenshot.'
);

type Props = {
  takeScreenshot: (
    imageType: 'png' | 'jpg' | undefined
  ) => Promise<string | undefined>;
};

export const ChartActions = ({ takeScreenshot }: Props) => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ChartActions').t,
  };
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
  const [isCSVModalVisible, setIsCSVModalVisible] = useState(false);
  const [isDeleteModalVisisble, setIsDeleteModalVisisble] = useState(false);

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
    toast.info(t['Please wait while we take a screenshot.'], {
      toastId: 'download-image',
    });
    const height = toggleDownloadChartElements(true);
    wait(500).then(() => {
      takeScreenshot('png').then((image) => {
        toggleDownloadChartElements(false, height);
        downloadImage(image, chart?.name);
      });
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
          offset: [-400, 15],
        },
      },
    ],
  };
  return (
    <>
      <Dropdown
        content={
          <StyledMenu className="downloadChartHide">
            <ConnectedSharingDropdown popperOptions={popperOptions}>
              <StyledMenuButton
                icon="Share"
                type="ghost"
                disabled={!isOwner}
                aria-label="share"
              >
                {t.Share}
              </StyledMenuButton>
            </ConnectedSharingDropdown>
            <DownloadDropdown
              label={t['Download Chart']}
              translations={dropdownTranslations}
              onDownloadCalculations={handleDownloadCalculations}
              onDownloadImage={handleDownloadImage}
              onCsvDownload={() => setIsCSVModalVisible(true)}
            />
            <StyledMenuButton
              icon="Duplicate"
              type="ghost"
              onClick={handleDuplicateChart}
            >
              {t.Duplicate}
            </StyledMenuButton>
            <Divider />
            <StyledMenuButton
              icon="Delete"
              type="ghost-destructive"
              onClick={() => setIsDeleteModalVisisble(true)}
            >
              {t['Delete chart']}
            </StyledMenuButton>
          </StyledMenu>
        }
      >
        <Button icon="EllipsisHorizontal" iconPlacement="right">
          {t.Actions}
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
      <DeleteModal
        visible={isDeleteModalVisisble}
        onOk={handleDeleteChart}
        onCancel={() => setIsDeleteModalVisisble(false)}
        title={t['Delete chart']}
      >
        {t['Are you sure you want to delete this chart?']}
      </DeleteModal>
    </>
  );
};
