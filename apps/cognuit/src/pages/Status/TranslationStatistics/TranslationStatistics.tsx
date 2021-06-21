import { useState, useEffect, useContext, useCallback } from 'react';
import { Tabs } from 'antd';
import { Line } from 'react-chartjs-2';
import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { TranslationStatisticsObject } from 'typings/interfaces';
import { CustomError } from 'services/CustomError';

import { Container, ChartContainer } from '../Heartbeats/elements';
import { DATE_RANGE_VALUES, DateRangeValueType } from '../utils';
import EmptyTableMessage from '../../../components/Molecules/EmptyTableMessage/EmptyTableMessage';

type Props = {
  dateRange: DateRangeValueType;
};

const { TabPane } = Tabs;
const TranslationStatistics = ({ dateRange }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<string>('psToOw');
  const [psData, setPsData] = useState<TranslationStatisticsObject[]>([]);
  const [owData, setOwData] = useState<TranslationStatisticsObject[]>([]);
  const { api } = useContext(ApiContext);
  const { addError } = useContext(APIErrorContext);

  const setData = useCallback(
    (response: TranslationStatisticsObject[], source: string) => {
      if (response && Array.isArray(response)) {
        if (response.length === 0 || response.length > 0) {
          if (source === 'ps') {
            setPsData(response as TranslationStatisticsObject[]);
          } else {
            setOwData(response as TranslationStatisticsObject[]);
          }
        }
      }
      setIsLoading(false);
    },
    [setPsData, setOwData]
  );

  const fetchData = useCallback(() => {
    let timeRange = 'month';
    if (dateRange === DATE_RANGE_VALUES.lastDay) {
      timeRange = 'day';
    }
    if (dateRange === DATE_RANGE_VALUES.lastHour) {
      timeRange = 'hour';
    }
    setIsLoading(true);
    if (activeTabKey === 'psToOw') {
      api!.sources
        .getTranslationStatistics('Studio', timeRange)
        .then((response: TranslationStatisticsObject[]) => {
          setData(response, 'ps');
        })
        .catch((err: CustomError) => {
          addError(err.message, err.status);
        });
    } else {
      api!.sources
        .getTranslationStatistics('Openworks', timeRange)
        .then((owResponse: TranslationStatisticsObject[]) => {
          setData(owResponse, 'ow');
        })
        .catch((err: CustomError) => {
          addError(err.message, err.status);
        });
    }
  }, [api, setData, activeTabKey, dateRange]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [activeTabKey, dateRange]);

  function onTabChange(key: string) {
    setActiveTabKey(key);
  }

  const renderChart = (type: string, data: TranslationStatisticsObject[]) => {
    const getFormattedData = () => ({
      labels: data.map((item) => item.timestamp),
      datasets: [
        {
          label: 'Total objects',
          fill: true,
          lineTension: 0.5,
          backgroundColor: 'rgba(74, 103, 251, 0.03)',
          borderColor: 'rgba(74, 103, 251, 1)',
          pointBorderColor: 'rgba(255,255,255,1)',
          pointBackgroundColor: 'rgba(74, 103, 251, 1)',
          pointBorderWidth: 2,
          pointRadius: 5,
          data: data.map((item) => item.total_objects),
        },
        {
          label: 'Successfully Translated',
          fill: false,
          lineTension: 0.5,
          backgroundColor: 'rgb(164, 178, 252)',
          borderColor: 'rgb(164, 178, 252)',
          pointBorderColor: 'rgba(255,255,255,1)',
          pointBackgroundColor: 'rgb(164, 178, 252)',
          pointBorderWidth: 2,
          pointRadius: 5,
          data: data.map((item) => item.successful),
        },
      ],
    });

    return (
      <ChartContainer key={type} xScroll={false}>
        {isLoading ? (
          <EmptyTableMessage isLoading text="Loading" />
        ) : (
          <>
            {data.length > 0 ? (
              <Line
                data={getFormattedData()}
                options={{
                  scales: { xAxes: [{ type: 'time' }] },
                  yAxes: [{ ticks: { beginAtZero: true } }],
                }}
                height={90}
              />
            ) : (
              <EmptyTableMessage text="No data" />
            )}
          </>
        )}
      </ChartContainer>
    );
  };

  return (
    <Container>
      <Tabs defaultActiveKey="psToOw" onChange={onTabChange}>
        <TabPane tab="Petrel to OpenWorks" key="psToOw">
          {renderChart('ps', psData)}
        </TabPane>
        <TabPane tab="OpenWorks to Petrel" key="owToPs">
          {renderChart('ow', owData)}
        </TabPane>
      </Tabs>
    </Container>
  );
};

export default TranslationStatistics;
