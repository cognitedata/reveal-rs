/*!
 * Copyright 2025 Cognite AS
 */
import { type DataSourceType, type Image360 } from '@cognite/reveal';

export function getStationIdentifier<T extends DataSourceType>(station: Image360<T>): string {
  const id = station.id;
  if (typeof id === 'string') {
    return id;
  } else {
    return id.externalId;
  }
}
