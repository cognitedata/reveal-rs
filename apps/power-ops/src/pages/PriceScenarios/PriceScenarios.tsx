import { PriceScenariosChart } from 'components/PriceScenariosChart';
import { SetStateAction, useEffect, useState } from 'react';
import {
  calculateScenarioProduction,
  pickChartColor,
  roundWithDec,
} from 'utils/utils';
import { PriceAreaWithData, TableData } from 'types';
import { Column } from 'react-table';
import { HeadlessTable } from 'components/HeadlessTable';
import { useAuthContext } from '@cognite/react-container';
import { DoubleDatapoint, ExternalId } from '@cognite/sdk';
import dayjs from 'dayjs';
import { CalculatedProduction } from '@cognite/power-ops-api-types';
import { useMetrics } from '@cognite/metrics';

import { getActiveColumns } from './utils';
import {
  Main,
  PriceScenariosContainer,
  StyledIcon,
  StyledTabs,
  StyledTable,
} from './elements';

export const PriceScenarios = ({
  priceArea,
}: {
  priceArea: PriceAreaWithData;
}) => {
  const metrics = useMetrics('price-scenarios');
  const { client } = useAuthContext();

  const bidDate = dayjs(priceArea.bidDate);

  const [priceExternalIds, setPriceExternalIds] = useState<
    { externalId: string }[] | undefined
  >();

  const [activeTab, setActiveTab] = useState<string>('total');

  const handleTabClickEvent = (activeKey: string) => {
    setActiveTab(activeKey);
    if (activeKey === 'total') {
      metrics.track('click-total-tab');
    } else {
      metrics.track('click-price-scenario-tab', {
        priceScenarioExternalId: activeKey,
      });
    }
  };

  const [tableColumns, setTableColumns] = useState<Column<TableData>[]>([]);
  const [tableData, setTableData] = useState<TableData[]>([]);

  const getFormattedProductionColumn = (
    datapoints: DoubleDatapoint[] | CalculatedProduction[],
    accessor: string
  ): { [accesor: string]: string }[] => {
    const formatedData: { [accesor: string]: string }[] = Array(24).fill({
      [accessor]: undefined,
    });
    datapoints.forEach((point) => {
      const hour = point.timestamp.getHours();
      formatedData[hour] = {
        [accessor]: roundWithDec(point.value, 1),
      };
    });
    return formatedData || [];
  };

  const getTableData = async () => {
    const activeScenarioIndex = priceArea?.priceScenarios.findIndex(
      (scenario) => scenario.externalId === activeTab
    );

    const activeColumns = getActiveColumns(activeTab, priceArea);
    setTableColumns(activeColumns as Column<TableData>[]);

    // Create array of column externalids
    const productionTsExternalIds: ExternalId[] = [];
    activeColumns.forEach(async (column, index) => {
      if (column.accessor?.includes('scenario')) {
        const scenario = priceArea?.priceScenarios.find(
          (scenario) => scenario.externalId === column.id
        );
        if (scenario) {
          productionTsExternalIds.push({
            externalId: scenario?.totalProduction.shopProductionExternalId,
          });
        }
      } else {
        // Get Plant from current scenario (activeTab)
        const plant = priceArea?.priceScenarios.find(
          (scenario) => scenario.externalId === activeTab
        )?.plantProduction?.[index - 2];

        if (plant) {
          productionTsExternalIds.push({
            externalId: plant?.production.shopProductionExternalId,
          });
        }
      }
    });

    // Get SHOP production data for the next day
    const shopProductionDatapoints =
      productionTsExternalIds &&
      (await client?.datapoints.retrieve({
        items: productionTsExternalIds.map((externalId) => {
          return externalId;
        }),
        start: bidDate.startOf('day').valueOf(),
        end: bidDate.endOf('day').valueOf(),
      }));

    const shopProductionData = shopProductionDatapoints
      ? await Promise.all(
          shopProductionDatapoints.map(async ({ datapoints }, index) => {
            let accessor = '';
            if (activeTab === 'total') {
              accessor = `shop-${index}`;
            } else {
              accessor =
                index === 0
                  ? `shop-${activeScenarioIndex}`
                  : `shop-plant-${index - 1}`;
            }

            const convertedDatapoints = (datapoints as DoubleDatapoint[]).map(
              (point) => ({
                ...point,
                // Multiply by (-1) all Total SHOP production for presentation (leave Plants unchanged)
                value: accessor.includes('plant')
                  ? point.value
                  : point.value * -1,
              })
            );

            return getFormattedProductionColumn(convertedDatapoints, accessor);
          })
        )
      : [];

    let calcProductionData: { [accessor: string]: string }[][];
    if (activeTab === 'total') {
      const priceTimeseries =
        priceExternalIds &&
        (await client?.datapoints.retrieve({
          items: priceExternalIds.map((externalId) => {
            return externalId;
          }),
          start: bidDate.startOf('day').valueOf(),
          end: bidDate.endOf('day').valueOf(),
        }));

      calcProductionData = priceTimeseries
        ? priceTimeseries.map((scenarioPricePerHour, index) => {
            const { sequenceRows } = priceArea.totalMatrixWithData;
            const accessor = `calc-${index}`;
            const calulatedProduction = calculateScenarioProduction(
              scenarioPricePerHour.datapoints as DoubleDatapoint[],
              sequenceRows
            );
            return getFormattedProductionColumn(calulatedProduction, accessor);
          })
        : [];
    } else {
      const activeScenarioTimeseries =
        priceArea?.priceScenarios[activeScenarioIndex] &&
        (await client?.datapoints.retrieve({
          items: [
            {
              externalId:
                priceArea?.priceScenarios[activeScenarioIndex].externalId,
            },
          ],
          start: bidDate.startOf('day').valueOf(),
          end: bidDate.endOf('day').valueOf(),
        }));

      // Calculate Plant Columns
      calcProductionData =
        activeScenarioTimeseries && priceArea.plantMatrixesWithData
          ? priceArea.plantMatrixesWithData
              .sort((plantA, plantB) =>
                plantA.plantName.localeCompare(plantB.plantName)
              )
              .map((plantMatrix, index) => {
                const { sequenceRows } = plantMatrix.matrixWithData;
                const accessor = `calc-plant-${index}`;

                const calulatedProduction = calculateScenarioProduction(
                  activeScenarioTimeseries[0].datapoints as DoubleDatapoint[],
                  sequenceRows
                );
                return getFormattedProductionColumn(
                  calulatedProduction,
                  accessor
                );
              })
          : [];

      // Calculate Total Column
      const [calcTotalProductionData] = activeScenarioTimeseries
        ? activeScenarioTimeseries.map((scenarioPricePerHour) => {
            const { sequenceRows } = priceArea.totalMatrixWithData;
            const accessor = `calc-${activeScenarioIndex}`;
            const calulatedProduction = calculateScenarioProduction(
              scenarioPricePerHour.datapoints as DoubleDatapoint[],
              sequenceRows
            );
            return getFormattedProductionColumn(calulatedProduction, accessor);
          })
        : [];

      // Append total prod uction column first
      calcProductionData = [calcTotalProductionData, ...calcProductionData];
    }

    // Combine both SHOP and calculated production values
    const combinedData = [...shopProductionData, ...calcProductionData];

    // Transpose rows and columns
    const transposedColumns = combinedData[0].map((_, index: number) =>
      combinedData.map((row) => row[index])
    );
    const priceScenarioTableData = transposedColumns.map(
      (row: any, index: number) => {
        // Convert each row from array of objects to object
        const formattedRow = Object.assign.apply(null, row);
        formattedRow.hour = index + 1;
        return formattedRow;
      }
    );
    setTableData(priceScenarioTableData);
  };

  useEffect(() => {
    if (priceArea) {
      const priceExternalIds = priceArea?.priceScenarios.map((scenario) => {
        return { externalId: scenario.externalId };
      });
      setPriceExternalIds(priceExternalIds);
    }
  }, [activeTab, priceArea]);

  useEffect(() => {
    getTableData();
  }, [priceExternalIds, priceArea]);

  return (
    <Main>
      <PriceScenariosContainer>
        <PriceScenariosChart
          priceArea={priceArea}
          externalIds={priceExternalIds}
          activeTab={activeTab}
          changeTab={(selectedTab: SetStateAction<string>) =>
            setActiveTab(selectedTab)
          }
          tableData={tableData}
        />
        <StyledTabs
          defaultActiveKey="total"
          activeKey={activeTab}
          onChange={(activeKey: string) => handleTabClickEvent(activeKey)}
        >
          <StyledTabs.TabPane key="total" tab="Total" />
          {priceArea?.priceScenarios.map((scenario, index) => {
            return (
              <StyledTabs.TabPane
                key={scenario.externalId}
                tab={
                  <>
                    <StyledIcon type="Stop" color={pickChartColor(index)} />
                    {scenario.name}
                  </>
                }
              />
            );
          })}
        </StyledTabs>
      </PriceScenariosContainer>
      <StyledTable>
        {tableColumns && tableData && (
          <HeadlessTable
            tableHeader={tableColumns}
            tableData={tableData}
            className="price-scenario-table"
            defaultColumnSize={{ min: 70, width: 70, max: 140 }}
          />
        )}
      </StyledTable>
    </Main>
  );
};
