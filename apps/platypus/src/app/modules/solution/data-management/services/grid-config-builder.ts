/* eslint-disable no-prototype-builtins */
import {
  ColumnConfig,
  ColumnDataType,
  GridConfig,
} from '@cognite/cog-data-grid';
import { KeyValueMap, DataModelTypeDefsType } from '@platypus/platypus-core';
import { CheckboxCellRenderer } from '../components/DataPreviewTable/cell-renderers/CheckboxCellRenderer';
import { IdCellRenderer } from '../components/DataPreviewTable/cell-renderers/IdCellRenderer';

const colTypesMap: KeyValueMap = {
  Boolean: ColumnDataType.Boolean,
  String: ColumnDataType.Text,
  Int: ColumnDataType.Number,
  Float: ColumnDataType.Decimal,
};

export const getInitialGridConfig = () => {
  return {
    columns: [],
    customFunctions: [],
    dataSources: [],
  } as GridConfig;
};

export const buildGridConfig = (
  instanceIdCol: string,
  dataModelType: DataModelTypeDefsType,
  onRowAdd: (row: KeyValueMap) => void
): GridConfig => {
  return {
    ...getInitialGridConfig(),
    columns: [
      {
        label: '',
        property: '_isDraftSelected',
        defaultValue: '',
        dataType: ColumnDataType.Text,
        colDef: {
          editable: false,
          sortable: false,
          suppressMovable: true,
          cellRenderer: CheckboxCellRenderer,
          headerComponent: () => '',
          width: 44,
        },
      },
      {
        label: 'Instances',
        property: instanceIdCol,
        defaultValue: '',
        dataType: ColumnDataType.Text,
        colDef: {
          editable: false,
          sortable: false,
          suppressMovable: true,
          cellRenderer: IdCellRenderer,
          cellRendererParams: {
            onRowAdd,
          },
          cellStyle: {
            padding: '0 var(--ag-cell-horizontal-padding)',
          },
        },
      },
      ...dataModelType.fields.map((field) => {
        const colConfig = {
          label: field.name,
          property: field.name,
          dataType: colTypesMap.hasOwnProperty(field.type.name)
            ? colTypesMap[field.type.name]
            : ColumnDataType.Custom,
          optional: field.nonNull,
          defaultValue: '',
          rules: [],
          metadata: {},
          isList: field.type.list || false,
          colDef: {
            headerName: `${field.name}${field.type.nonNull ? '*' : ''}`,
            sortable: false,
            cellEditorParams: {
              isRequired: field.nonNull || field.type.nonNull,
            },
          },
        } as ColumnConfig;

        return colConfig;
      }),
    ],
  };
};
