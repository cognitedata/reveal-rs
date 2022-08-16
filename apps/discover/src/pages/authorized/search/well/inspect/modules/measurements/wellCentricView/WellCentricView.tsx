import { DepthMeasurementDataColumnInternal } from 'domain/wells/measurements/internal/types';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellbores';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';

import { NoDataAvailable } from 'components/Charts/common/NoDataAvailable';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { Loading } from 'components/Loading';
import { DepthMeasurementUnit, PressureUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { BooleanSelection } from 'modules/wellInspect/types';
import { WellboreId } from 'modules/wellSearch/types';

import { useWellInspectSelectedWellboresChartData } from '../hooks/useWellInspectSelectedWellboresChartData';
import {
  extractChartDataFromProcessedData,
  extractWellboreErrorsFromProcessedData,
} from '../utils';

import { CompareView } from './CompareView/CompareView';
import { BulkActionsWrapper, WellCentricViewWrapper } from './elements';
import { WellCentricBulkActions } from './WellCentricBulkActions';
import WellCentricCard from './WellCentricCard';

export type Props = {
  geomechanicsCurves: DepthMeasurementDataColumnInternal[];
  ppfgCurves: DepthMeasurementDataColumnInternal[];
  otherTypes: DepthMeasurementDataColumnInternal[];
  pressureUnit: PressureUnit;
  measurementReference: DepthMeasurementUnit;
  nptEvents: MultiSelectCategorizedOptionMap;
  ndsEvents: MultiSelectCategorizedOptionMap;
};

export const WellCentricView: React.FC<Props> = ({
  geomechanicsCurves,
  ppfgCurves,
  otherTypes,
  pressureUnit,
  measurementReference,
  nptEvents,
  ndsEvents,
}) => {
  const dispatch = useDispatch();

  const selectedInspectWellbores = useWellInspectSelectedWellbores();

  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const { data: wellboreProcessedData, isLoading } =
    useWellInspectSelectedWellboresChartData({
      geomechanicsCurves,
      ppfgCurves,
      otherTypes,
      pressureUnit,
    });

  const wellboreChartData = React.useMemo(() => {
    if (!wellboreProcessedData) {
      return [];
    }
    return extractChartDataFromProcessedData(wellboreProcessedData);
  }, [wellboreProcessedData]);

  const [selectedWellboresMap, setSelectedWellboresMap] =
    useState<BooleanSelection>({});

  const [compare, setCompare] = useState<boolean>(false);

  const onToggle = (id: WellboreId) => {
    setSelectedWellboresMap((state) => ({
      ...state,
      [id]: !state[id],
    }));
  };

  const handleDeselectAll = () => {
    setSelectedWellboresMap({});
    setCompare(false);
  };

  /**
   * Extract errors from processed data and dispath to state
   */
  useEffect(() => {
    if (!wellboreProcessedData) {
      return;
    }
    dispatch(
      inspectTabsActions.setErrors(
        extractWellboreErrorsFromProcessedData(wellboreProcessedData)
      )
    );
  }, [wellboreProcessedData]);

  const renderWellCards = useMemo(
    () =>
      wellboreChartData.map((row) => (
        <WellCentricCard
          selected={selectedWellboresMap[row.wellbore.id]}
          wellbore={row.wellbore}
          key={row.wellbore.id}
          chartData={row.chartData}
          filters={{ nptEvents, ndsEvents }}
          axisNames={{
            x: `Pressure (${pressureUnit.toLowerCase()})`,
            x2: 'Angle (deg)',
            y: `${measurementReference} (${userPreferredUnit})`,
          }}
          onToggle={onToggle}
        />
      )),
    [
      wellboreChartData,
      selectedWellboresMap,
      nptEvents,
      ndsEvents,
      pressureUnit,
      userPreferredUnit,
    ]
  );

  const selectedWellbores = useMemo(
    () =>
      selectedInspectWellbores.filter(
        (wellbore) => selectedWellboresMap[wellbore.id]
      ),
    [selectedWellboresMap]
  );

  const selectedWellsCounts = useMemo(
    () => uniqBy(selectedWellbores, 'wellId').length,
    [selectedWellbores]
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!isLoading && isEmpty(wellboreChartData)) {
    return <NoDataAvailable />;
  }

  return (
    <>
      <WellCentricViewWrapper visible={!isLoading}>
        {renderWellCards}
      </WellCentricViewWrapper>
      {!isEmpty(selectedWellbores) && (
        <BulkActionsWrapper>
          <WellCentricBulkActions
            wellsCount={selectedWellsCounts}
            wellboresCount={selectedWellbores.length}
            handleDeselectAll={handleDeselectAll}
            compare={() => setCompare(true)}
          />
        </BulkActionsWrapper>
      )}
      {compare && (
        <CompareView
          onBack={() => setCompare(false)}
          wellbores={selectedWellbores}
        />
      )}
    </>
  );
};

export default WellCentricView;
