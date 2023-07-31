import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';
import { log } from 'utils/log';

import { GeospatialFeatureResponse } from '@cognite/sdk';

import { adaptGeospatialToGeoJSON } from '../../internal/adapters/adaptGeospatialToGeoJSON';

export const getGeoJSON = (featureTypeId: string) => {
  return getCogniteSDKClient()
    .geospatial.feature.searchStream(featureTypeId, {
      output: {
        geometryFormat: 'GEOJSON',
        jsonStreamFormat: 'NEW_LINE_DELIMITED',
      },
    })
    .then((response) => {
      try {
        return adaptGeospatialToGeoJSON(
          response
            .split('\n')
            .map<GeospatialFeatureResponse>((feature) => JSON.parse(feature))
        );
      } catch (e) {
        log('Could not parse feature search stream');
        throw new Error('Could not parse feature search stream');
      }
    });
};
