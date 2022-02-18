import { Request } from 'express';
import { CdfResourceObject } from '../..';
import { CdfDatabaseService } from '../../common/cdf-database.service';
import { Collection } from '../../common/collection';
import { CdfApiConfig, CdfMockDatabase, FilterMode } from '../../types';
import {
  filterCollection,
  flattenNestedObjArray,
  getConfigForUrl,
  mapParamsAsFilter,
  mapRequestBodyToQueryParams,
  findChildrenFromTreeHierarchy,
} from '../../utils';
import uuid from '../../utils/uuid';

/**
 * Modify the initial HTTP request and changes the URL and Method
 * to point to the JsonServer Delete route
 * @param req
 */
export function transformDeleteRequest(
  req: Request<Record<string, unknown>>,
  cdfDb: CdfMockDatabase
) {
  req.method = 'DELETE';
  req.url = req.url.substring(0, req.url.indexOf('/delete'));
  const storeKey = req.url.substring(req.url.lastIndexOf('/') + 1);

  if (storeKey && req.body && req.body.items.length) {
    // quick hack unitl I found a better solution
    const payload = req.body.items[0];
    const objToDelete = CdfDatabaseService.from(cdfDb, storeKey).find(payload);

    if (objToDelete && objToDelete.id) {
      req.url += `/${objToDelete.id}`;
    }
  }
}

/**
 * Modify the initial HTTP request and changes the URL and Method
 * to point to the appropriate JSON server GET route.
 * Used for requests that fetch resources like: List, Search, Filter, ByIds...etc.
 */
export function transformFetchRequest(
  req: Request<Record<string, unknown>>,
  cdfDb: CdfMockDatabase,
  config: CdfApiConfig,
  endpointEnding: string
) {
  const endpointsWithCustomReqLogic = ['timeseries'];

  endpointEnding = endpointEnding.replace('/', '');

  // get endpoint overrides if any
  const endpointConfig = getConfigForUrl(config, req.url);
  req.method = 'GET';

  let body = req.body;

  if (endpointsWithCustomReqLogic.some((entry) => req.url.includes(entry))) {
    convertFiltersWithCustomMappings(body, cdfDb);
  }

  if (endpointEnding === 'byids') {
    body = mapParamsAsFilter(flattenNestedObjArray(req.body.items));
  }

  // Convert POST Body request params as GET params needed for json-server
  req.query = mapRequestBodyToQueryParams(
    body,
    endpointEnding as FilterMode,
    endpointConfig
  );
}

/**
 * Transforms the HTTP POST request and adds
 * id, createdTime, lastUpdatedTime, source if they are missing
 * in the request.
 * They are needed in order the data to be stored
 */
export function transformPostCreateRequest(
  req: Request<Record<string, unknown>>
) {
  // quick hack unitl I found a better solution
  const payload = req.body.items[0];
  const currentTimestamp = Date.now();

  if (!payload.id) {
    payload.id = uuid.generate();
  }

  if (!payload.createdTime) {
    payload.createdTime = currentTimestamp;
  }

  if (!payload.lastUpdatedTime) {
    payload.lastUpdatedTime = currentTimestamp;
  }

  if (!payload.source) {
    payload.source = 'mock';
  }

  req.body = payload;
}

/**
 * Handles cases where the filtering logic is not generic in cdf.
 * Transforms filters params that are not 1-1 mapped with the data model
 * and require additional mapping
 * @param body
 * @param cdfDb
 */
function convertFiltersWithCustomMappings(body, cdfDb): void {
  if (body.filter['assetIds']) {
    const filter = body.filter['assetIds'];
    delete body.filter['assetIds'];
    body.filter.assetId = filter;
  }

  if (body.filter['assetExternalIds']) {
    const filter = body.filter['assetExternalIds'];
    delete body.filter['assetExternalIds'];

    const assets = CdfDatabaseService.from(cdfDb, 'assets').getState();
    const filteredAssets = filterCollection(assets, {
      externalId: {
        eq: filter,
      },
    }) as CdfResourceObject[];

    if (filteredAssets.length) {
      body.filter.assetId = filteredAssets.map((asset) => asset.id);
    }
  }

  if (body.filter['rootAssetIds']) {
    const filter = body.filter['rootAssetIds'];
    delete body.filter['rootAssetIds'];

    const assets = CdfDatabaseService.from(cdfDb, 'assets').getState();
    const rootAssets = filterCollection(assets, {
      id: {
        eq: filter,
      },
    }) as CdfResourceObject[];

    if (rootAssets.length) {
      let collection = Collection.from<CdfResourceObject>([]);
      const rootAssetsIds = rootAssets.map((x) => x.externalId.toString());

      collection = findChildrenFromTreeHierarchy(
        Collection.from<CdfResourceObject>(assets),
        rootAssetsIds,
        'externalId',
        'parentExternalId'
      );

      body.filter.assetId = collection.toArray().map((x) => x.id);
    }
  }
}
