import { CogniteClient } from '@cognite/sdk';
import { EquipmentElementKey, Facility, MSData } from 'scarlet/types';

const MS_COLUMNS = {
  [EquipmentElementKey.UNIT_ID]: 'Unit',
  [EquipmentElementKey.EQUIP_ID]: 'Equipment',
  [EquipmentElementKey.SYSTEM]: 'System #',
  [EquipmentElementKey.P_ID_DRAWING_NO]: 'PID #',
  [EquipmentElementKey.OPERATING_TEMP]: 'OP TEMP\n(Modeled In RBI)',
  [EquipmentElementKey.OPERATING_PRESSURE]: 'OP PRESS\n(Modeled In DB)',
} as Record<EquipmentElementKey, string>;

const msEquipmentElementKeys = (
  Object.keys(MS_COLUMNS) as EquipmentElementKey[]
)
  // skip help columns
  .filter(
    (key) =>
      ![EquipmentElementKey.UNIT_ID, EquipmentElementKey.EQUIP_ID].includes(key)
  );

export const getEquipmentMS = async (
  client: CogniteClient,
  {
    facility,
    unitId,
    equipmentId,
  }: { facility: Facility; unitId: string; equipmentId: string }
): Promise<MSData | undefined> => {
  if (!facility) throw Error('Facility is not set');
  if (!unitId) throw Error('Unit id is not set');
  if (!equipmentId) throw Error('Equipment id is not set');

  const tableNames = [`${unitId}_MS2_MS3`, `${unitId}_MS3`, `${unitId}_MS2`];

  // eslint-disable-next-line no-restricted-syntax
  for (const tableName of tableNames) {
    // eslint-disable-next-line no-await-in-loop
    const msData = await getEquipmentMSDocument(
      client,
      unitId,
      equipmentId,
      tableName
    ).catch(() => undefined);
    if (msData) return msData;
  }

  return undefined;
};

const getEquipmentMSDocument = async (
  client: CogniteClient,
  unitId: string,
  equipmentId: string,
  tableName: string
): Promise<MSData | undefined> => {
  let data = await client.raw.listRows('PCMS', tableName, {
    // columns: Object.values(MS_COLUMNS),
    limit: 1000,
  });

  let next;

  do {
    if (next) data = await next(); // eslint-disable-line no-await-in-loop

    const equipmentRow = data.items.find(
      (row) =>
        row.columns[MS_COLUMNS[EquipmentElementKey.UNIT_ID]] === unitId &&
        row.columns[MS_COLUMNS[EquipmentElementKey.EQUIP_ID]] === equipmentId
    );

    if (equipmentRow) {
      return msEquipmentElementKeys.reduce(
        (result, key) => ({
          ...result,
          [key]: equipmentRow.columns[MS_COLUMNS[key]],
        }),
        {}
      );
    }

    next = data.next;
  } while (data.next);

  return undefined;
};
