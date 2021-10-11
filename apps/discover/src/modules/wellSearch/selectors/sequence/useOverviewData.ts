import { useMemo, useState } from 'react';

import flatten from 'lodash/flatten';

import { changeUnits } from '_helpers/units/utils';
import { FEET } from 'constants/units';
import { useTrajectoriesQuery } from 'modules/wellSearch/hooks/useTrajectoriesQuery';
import { useSecondarySelectedOrHoveredWells } from 'modules/wellSearch/selectors';
import { convertToFixedDecimal } from 'modules/wellSearch/utils';
import { OverviewModel } from 'pages/authorized/search/well/inspect/modules/overview/types';

export const useOverviewData = () => {
  const wells = useSecondarySelectedOrHoveredWells();
  const { trajectories, isLoading } = useTrajectoriesQuery();
  const [accessorsToFixedDecimal] = useState(['waterDepth.value', 'tvd', 'md']);

  const [unitChangeAcceessors] = useState([
    {
      accessor: 'waterDepth.value',
      fromAccessor: 'waterDepth.unit',
      to: FEET,
    },
  ]);

  return useMemo(() => {
    const overviewData = flatten(
      wells.map((well) =>
        well.wellbores.map((wellbore) => {
          const overView: OverviewModel = { ...wellbore };
          overView.wellName = `${well.description} / ${wellbore.description}`;
          overView.operator = well.operator;
          overView.spudDate = well.spudDate;
          overView.waterDepth = well.waterDepth;
          overView.sources = well.sources;
          overView.field = well.field || wellbore.metadata?.field_name;

          const trajectory = trajectories.find(
            (row) => row.assetId === wellbore.id
          );

          if (trajectory) {
            overView.md = trajectory.metadata?.bh_md;
            overView.tvd = trajectory.metadata?.bh_tvd;
          }

          return convertToFixedDecimal(
            changeUnits(overView, unitChangeAcceessors),
            accessorsToFixedDecimal
          );
        })
      )
    );

    return { overviewData, isLoading };
  }, [wells, trajectories]);
};
