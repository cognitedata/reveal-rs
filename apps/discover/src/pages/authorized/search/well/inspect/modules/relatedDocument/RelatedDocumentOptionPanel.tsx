import { useDispatch } from 'react-redux';

import { AvailableColumn } from 'modules/documentSearch/types';
import { getAvailableColumns } from 'modules/documentSearch/utils/columns';
import { wellInspectActions } from 'modules/wellInspect/actions';
import { useWellInspect } from 'modules/wellInspect/selectors';
// import { toBooleanMap } from 'modules/wellSearch/utils';
import OptionsPanel from 'pages/authorized/search/document/header/options/OptionsPanel';

import { columns } from './constant';

export const RelatedDocumentOptionPanel: React.FC = () => {
  const availableColumns = getAvailableColumns(columns);
  const { selectedRelatedDocumentsColumns } = useWellInspect();
  const dispatch = useDispatch();

  const handleColumnSelection = (column: AvailableColumn) => {
    dispatch(
      wellInspectActions.setSelectedRelatedDocumentColumns({
        [column.field]: !column.selected,
      })
    );
  };

  // const handleSelectAllColumns = (value: boolean) => {
  //   dispatch(
  //     setSelectedRelatedDocumentColumns(
  //       toBooleanMap(Object.keys(columns), value)
  //     )
  //   );
  // };

  const filteredColumns = availableColumns.map((availableColumn) => {
    return {
      ...availableColumn,
      selected: selectedRelatedDocumentsColumns[availableColumn.field],
    };
  });

  return (
    <OptionsPanel
      handleColumnSelection={handleColumnSelection}
      // handleSelectAllColumns={handleSelectAllColumns}
      columns={filteredColumns}
    />
  );
};
