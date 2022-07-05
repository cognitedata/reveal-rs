import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import {
  AppActionType,
  DataElement,
  DataElementOrigin,
  DataElementState,
  EquipmentComponent,
  EquipmentComponentType,
} from 'types';
import { getDataElementConfig } from 'utils';

import { useAppDispatch, useAppState } from '.';

export const useAddComponent = () => {
  const { equipment, equipmentId, equipmentConfig } = useAppState();
  const appDispatch = useAppDispatch();
  const equipmentType = equipment.data?.type;

  const addEquipmentComponent = useCallback(
    (componentType: EquipmentComponentType) => {
      if (!equipmentConfig.data) throw Error('Equipment config is missing');
      if (!equipmentType) throw Error('Equipment type is missing');
      const { componentElementKeys } =
        equipmentConfig.data.equipmentTypes[equipmentType].componentTypes[
          componentType
        ] || {};

      if (!componentElementKeys?.length) {
        throw Error('Component config is missing');
      }

      const componentId = uuid();
      const componentElements = componentElementKeys
        .map((dataElementKey): DataElement | undefined => {
          const dataElementConfig = getDataElementConfig(
            equipmentConfig.data!,
            dataElementKey,
            equipmentType,
            componentType
          );

          if (!dataElementConfig) return;

          const dataElement: DataElement = {
            id: uuid(),
            key: dataElementKey,
            origin: DataElementOrigin.COMPONENT,
            state: DataElementState.PENDING,
            detections: [],
            componentId,
            config: dataElementConfig,
          };

          // eslint-disable-next-line consistent-return
          return dataElement;
        })
        .filter((item) => item) as DataElement[];

      const component: EquipmentComponent = {
        id: componentId,
        name: `${equipmentId}-${componentId.substring(0, 7)}`,
        type: componentType,
        componentElements,
      };

      appDispatch({
        type: AppActionType.ADD_COMPONENT,
        component,
      });
    },
    [equipmentType, equipmentConfig.data]
  );

  return addEquipmentComponent;
};
