import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { FeatureCollection } from '@turf/helpers';

import { getTenantInfo } from '@cognite/react-container';
import { reportException } from '@cognite/react-errors';

import {
  CancellablePromise,
  convertToCancellablePromise,
} from '_helpers/cancellablePromise';
import { log } from '_helpers/log';
import { fetchTenantFile } from 'hooks/useTenantConfig';
import { setSources, patchSource, setAssets } from 'modules/map/actions';
import { useMap } from 'modules/map/selectors';
import { mapService } from 'modules/map/service';
import { MapDataSource } from 'modules/map/types';
import { RemoteServiceResponse } from 'tenants/types';

import { getAssetFilter, getAssetData } from '../utils';

import { useLayers } from './useLayers';

export const useMapContent = () => {
  const { layers, layersReady } = useLayers();
  const [tenant] = getTenantInfo();
  const { sources } = useMap();
  const dispatch = useDispatch();

  const startLazyLoad = (lazyIds: [string, string][]) => {
    lazyIds.forEach(async (lazyId) => {
      const [id, cursor] = lazyId;
      const service = layers[id].remoteService;
      let nextCursor: string | undefined = cursor;
      while (nextCursor && service) {
        // eslint-disable-next-line no-await-in-loop
        const response: RemoteServiceResponse = await service(
          tenant,
          nextCursor
        );
        dispatch(
          patchSource({
            id,
            data: response,
          })
        );
        nextCursor = response.nextCursor;
      }
    });
  };

  useEffect(() => {
    const tempSources: MapDataSource[] = [];
    const promises: Promise<void>[] = [];
    let cancellablePromise: CancellablePromise | undefined;
    const lazyIds: [string, string][] = [];

    if (layersReady && !sources) {
      Object.keys(layers).forEach((id) => {
        const { remote, remoteService, local, asset } = layers[id];

        const pushResponse = (content: FeatureCollection) => {
          tempSources.push({ id, data: content });
          if (asset) {
            const filter = getAssetFilter(asset.filter);
            const assetData = getAssetData(content, asset.displayField, filter);
            dispatch(setAssets(assetData));
          }
        };

        if (local) {
          promises.push(
            fetchTenantFile(tenant, local).then((content) => {
              pushResponse(content);
            })
          );
        }
        if (remote) {
          promises.push(
            mapService.getMapContent(remote).then((content) => {
              pushResponse(content);
            })
          );
        }

        if (remoteService) {
          promises.push(
            remoteService(tenant).then((content) => {
              pushResponse(content);
              if (content.nextCursor) {
                lazyIds.push([id, content.nextCursor]);
              }
            })
          );
        }
      });

      if (promises.length > 0) {
        cancellablePromise = convertToCancellablePromise(Promise.all(promises));
        cancellablePromise.promise
          .then(() => {
            dispatch(setSources(tempSources));
            startLazyLoad(lazyIds);
          })
          .catch((error) => {
            log('Some layers failed to load');
            reportException(error);
          });
      } else {
        dispatch(setSources([]));
      }
    }
    return () => {
      cancellablePromise?.cancel();
    };
  }, [layers, layersReady]);

  return sources;
};
