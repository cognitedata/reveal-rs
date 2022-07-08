import { WellInternal } from 'domain/wells/well/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import intersection from 'lodash/intersection';

import { ColumnType } from 'components/Tablev3/types';
import { ColumnMap } from 'modules/documentSearch/utils/getAvailableColumns';

export const getVisibleWellboreColumns = (
  selectedColumns: string[],
  wellColumns: ColumnMap<WellInternal>,
  wellboreColumns: ColumnMap<WellboreInternal>
) => {
  const wellColumnNames = Object.keys(wellColumns);
  const wellboreColumnsNames = Object.keys(wellboreColumns);

  // getting common columns in well and wellbore table
  const commonColumnsNames = intersection(
    wellColumnNames,
    wellboreColumnsNames
  );

  return Object.keys(wellboreColumns).reduce(
    (resultColumns: ColumnType<WellboreInternal>[], currentColumnName) => {
      // if a key includes in intersection array and not include in selected columns.
      if (
        commonColumnsNames.includes(currentColumnName) &&
        !selectedColumns.includes(currentColumnName)
      )
        return resultColumns;

      return [...resultColumns, wellboreColumns[currentColumnName]];
    },
    []
  );
};
