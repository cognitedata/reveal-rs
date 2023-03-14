import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { MaxDepthData } from 'domain/wells/trajectory/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import React from 'react';

import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { DepthMeasurementUnit } from 'constants/units';
import { FullWidth } from 'styles/layout';

import {
  BodyColumnBody,
  BodyColumnMainHeader,
} from '../../../common/Events/elements';
import { Column } from '../../components/Column';
import { ColumnEmptyState } from '../../components/ColumnEmptyState';
import { ColumnOptionsSelector } from '../../components/ColumnOptionsSelector';
import { DepthScaleLines } from '../../components/DepthScaleLines';
import { DetailPageOption } from '../../components/DetailPageOption';
import {
  ColumnVisibilityProps,
  CasingAssemblyView,
  ChartColumn,
  HoleSectionView,
} from '../../types';
import { ColumnHeaderWrapper } from '../elements';
import { HoleSectionsColumn } from '../HoleSectionsColumn';

import { DatumType } from './components/DatumType';
import { DepthIndicators } from './components/DepthIndicators';
import { DepthLimits } from './components/DepthLimits';
import { Legend } from './components/Legend';
import { TopContent } from './components/TopContent';
import { CasingsColumnContentWrapper, DepthTagsContainer } from './elements';

export interface CasingsColumnProps extends ColumnVisibilityProps {
  data?: CasingAssemblyView[];
  isLoading: boolean;
  holeSections?: HoleSectionView[];
  mudWeightData?: DepthMeasurementWithData[];
  scaleBlocks: number[];
  datum: WellboreInternal['datum'];
  wellWaterDepth: WellboreInternal['wellWaterDepth'];
  maxDepth?: MaxDepthData;
  depthMeasurementType: DepthMeasurementUnit;
  showBothSides?: boolean;
  onClickDetailsButton?: () => void;
}

export const CasingsColumn: React.FC<WithDragHandleProps<CasingsColumnProps>> =
  React.memo(
    ({
      data,
      isLoading,
      holeSections,
      mudWeightData,
      datum,
      wellWaterDepth,
      maxDepth,
      scaleBlocks,
      showBothSides = false,
      depthMeasurementType,
      onClickDetailsButton = noop,
      isVisible = true,
      ...dragHandleProps
    }) => {
      const renderCasingsColumnContent = () => {
        if (isLoading || !data || isEmpty(data)) {
          return <ColumnEmptyState isLoading={isLoading} />;
        }

        return (
          <>
            <DepthTagsContainer />

            <FullWidth>
              <BodyColumnBody>
                <DepthScaleLines scaleBlocks={scaleBlocks} />

                <TopContent
                  datum={datum}
                  waterDepth={wellWaterDepth}
                  scaleBlocks={scaleBlocks}
                />

                <DatumType datum={datum} scaleBlocks={scaleBlocks} />

                <HoleSectionsColumn
                  data={holeSections}
                  mudWeightData={mudWeightData}
                  scaleBlocks={scaleBlocks}
                  depthMeasurementType={depthMeasurementType}
                />

                <DepthIndicators
                  casingAssemblies={data}
                  scaleBlocks={scaleBlocks}
                  showBothSides={showBothSides}
                  depthMeasurementType={depthMeasurementType}
                />

                <DepthLimits
                  scaleBlocks={scaleBlocks}
                  maxDepth={maxDepth}
                  depthMeasurementType={depthMeasurementType}
                />
              </BodyColumnBody>
            </FullWidth>
          </>
        );
      };

      return (
        <Column id="casings-column" isVisible={isVisible} {...dragHandleProps}>
          <ColumnHeaderWrapper>
            <ColumnOptionsSelector
              displayValue={ChartColumn.CASINGS}
              Footer={<DetailPageOption onClick={onClickDetailsButton} />}
              disabled={isEmpty(data)}
            />
            <BodyColumnMainHeader>Schema</BodyColumnMainHeader>
            <Legend />
          </ColumnHeaderWrapper>

          <CasingsColumnContentWrapper>
            {renderCasingsColumnContent()}
          </CasingsColumnContentWrapper>
        </Column>
      );
    }
  );
