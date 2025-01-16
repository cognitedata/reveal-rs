/*!
 * Copyright 2024 Cognite AS
 */
import { Button, Input } from '@cognite/cogs.js';
import { isEqual } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { type Source, type NodeItem, type SimpleSource } from '../../src/data-providers/FdmSDK';
import { type AddModelOptions } from '@cognite/reveal';
import {
  useReveal3dResourcesFromScene,
  type AddCadResourceOptions,
  type AddPointCloudResourceOptions,
  useSearchMappedEquipmentFDM,
  useSearchMappedEquipmentAssetMappings,
  useAllMappedEquipmentFDM,
  useAllMappedEquipmentAssetMappings,
  type AddImage360CollectionOptions,
  useSearchAssetsMapped360Annotations,
  useAllAssetsMapped360Annotations,
  useSearchAssetsMappedPointCloudAnnotations,
  useAllAssetsMappedPointCloudAnnotations,
  type AddResourceOptions
} from '../../src';
import { is360ImageAddOptions } from '../../src/components/Reveal3DResources/typeGuards';
import { type CogniteClient } from '@cognite/sdk';
import { matchAssetWithQuery } from '../../src/utilities/instances/matchAssetWithQuery';
import { type AssetInstance } from '../../src/utilities/instances/AssetInstance';
import { isClassicAsset } from '../../src/utilities/instances/typeGuards';

type SearchComponentProps = {
  sdk: CogniteClient;
  sceneExternalId?: string;
  sceneSpaceId?: string;
  resources?: AddResourceOptions[];
  viewsToSearch?: Source[] | SimpleSource[];
};

const defaultViewsToSearch = [
  { externalId: 'CognitePointCloudVolume', space: 'cdf_cdm', version: 'v1', type: 'view' }
];

type Equipment = {
  view: string;
  externalId: string;
  space: string;
  properties?: Record<string, any>;
};

const SearchComponent: React.FC<SearchComponentProps> = ({
  resources: propResources,
  sceneExternalId,
  sceneSpaceId,
  sdk,
  viewsToSearch
}) => {
  const fetchedResources =
    sceneExternalId !== undefined && sceneSpaceId !== undefined
      ? useReveal3dResourcesFromScene(sceneExternalId, sceneSpaceId)
      : [];
  const resources = propResources ?? fetchedResources;

  const [tempSearchQuery, setTempSearchQuery] = useState<string>('');
  const [mainSearchQuery, setMainSearchQuery] = useState<string>('');
  const [searchMethod, setSearchMethod] = useState<
    'allFdm' | 'allAssets' | 'fdmSearch' | 'assetSearch'
  >('allFdm');

  const filteredResources = resources.filter(
    (resource): resource is AddCadResourceOptions | AddPointCloudResourceOptions =>
      !is360ImageAddOptions(resource)
  );
  const filteredViewsToSearch = viewsToSearch ?? defaultViewsToSearch;

  const { data: searchData } = useSearchMappedEquipmentFDM(
    mainSearchQuery,
    filteredViewsToSearch,
    filteredResources as AddModelOptions[],
    undefined,
    100
  );

  const {
    data: assetSearchData,
    isFetching: isAssetSearchFetching,
    hasNextPage: assetSearchHasNextPage,
    fetchNextPage: fetchAssetSearchNextPage
  } = useSearchMappedEquipmentAssetMappings(
    mainSearchQuery,
    filteredResources as AddModelOptions[],
    1000,
    sdk
  );

  const { data: allEquipment } = useAllMappedEquipmentFDM(
    filteredResources as AddModelOptions[],
    filteredViewsToSearch
  );

  const {
    data: allAssets,
    isFetching,
    hasNextPage,
    fetchNextPage
  } = useAllMappedEquipmentAssetMappings(filteredResources as AddModelOptions[], sdk, 25);

  const filtered360ImageResources = resources.filter(
    (resource): resource is AddImage360CollectionOptions => 'siteId' in resource
  );
  const siteIds = filtered360ImageResources.map((filteredResource) => {
    return 'siteId' in filteredResource ? filteredResource.siteId : filteredResource.externalId;
  });

  const { data: assetAnnotationImage360SearchData } = useSearchAssetsMapped360Annotations(
    siteIds,
    sdk,
    mainSearchQuery
  );

  const { data: all360ImageAssetAnnotationMappings } = useAllAssetsMapped360Annotations(
    sdk,
    siteIds
  );

  const { data: pointCloudAssetSearchData } = useSearchAssetsMappedPointCloudAnnotations(
    filteredResources as AddModelOptions[],
    sdk,
    mainSearchQuery
  );

  const { data: allPointCloudAssets } = useAllAssetsMappedPointCloudAnnotations(
    sdk,
    filteredResources as AddModelOptions[]
  );

  const fetchNextPageCallback = useCallback(() => {
    if (searchMethod !== 'allAssets' && searchMethod !== 'assetSearch') return;
    if (searchMethod === 'allAssets' && !isFetching && hasNextPage) {
      void fetchNextPage();
    } else if (searchMethod === 'assetSearch' && !isAssetSearchFetching && assetSearchHasNextPage) {
      void fetchAssetSearchNextPage();
    }
  }, [
    searchMethod,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isAssetSearchFetching,
    assetSearchHasNextPage,
    fetchAssetSearchNextPage
  ]);

  const filteredEquipment = useMemo(() => {
    if (searchMethod === 'allFdm') {
      return (
        allEquipment?.filter((equipment) => {
          const isInExternalId = equipment.externalId
            .toLowerCase()
            .includes(mainSearchQuery.toLowerCase());
          const isInProperties = Object.values(equipment.properties).some((viewProperties) =>
            Object.values(viewProperties).some((property) =>
              Object.values(property).some((value) => {
                const valueAsString =
                  typeof value === 'object' ? (value as any)?.externalId : value?.toString();
                return valueAsString?.toLowerCase().includes(mainSearchQuery.toLowerCase());
              })
            )
          );

          return isInExternalId || isInProperties;
        }) ?? []
      );
    } else if (searchMethod === 'allAssets') {
      const transformedAssets =
        allAssets?.pages
          .flat()
          .map((mapping) => mapping.assets)
          .flat() ?? [];

      const all360ImageAssets =
        all360ImageAssetAnnotationMappings?.map((mapping) => mapping.asset) ?? [];
      const combinedAssets = [
        ...transformedAssets,
        ...(all360ImageAssets ?? []),
        ...(allPointCloudAssets ?? [])
      ];

      const filteredAssets =
        combinedAssets.filter((assetMappings) =>
          matchAssetWithQuery(assetMappings, mainSearchQuery)
        ) ?? [];

      const mappedAssets = filteredAssets.map(assetInstanceToEquipment);

      return mappedAssets;
    } else if (searchMethod === 'assetSearch') {
      if (assetSearchData === undefined) {
        return [];
      }

      const transformedAssetsSearch = assetSearchData?.pages
        .flat()
        .map((mapping) => mapping.assets)
        .flat();

      const assetImage360SearchData =
        assetAnnotationImage360SearchData?.map((mapping) => mapping.asset) ?? [];

      const combinedAssetSearchData = [
        ...transformedAssetsSearch,
        ...(assetImage360SearchData ?? []),
        ...(pointCloudAssetSearchData ?? [])
      ];

      const searchedEquipment: Equipment[] = combinedAssetSearchData.map((asset) =>
        assetInstanceToEquipment(asset)
      );

      return searchedEquipment;
    } else if (searchMethod === 'fdmSearch') {
      if (searchData === undefined) {
        return [];
      }

      const searchedEquipment: Equipment[] = searchData
        .map((searchResult) => {
          return searchResult.instances.map((instance) => {
            return {
              view: searchResult.view.externalId,
              externalId: instance.externalId,
              space: instance.space,
              properties: instance.properties
            };
          });
        })
        .flat();

      return searchedEquipment;
    } else {
      return [];
    }
  }, [
    mainSearchQuery,
    allEquipment,
    searchData,
    allAssets,
    all360ImageAssetAnnotationMappings,
    assetSearchData,
    assetAnnotationImage360SearchData,
    searchMethod
  ]);

  return (
    <>
      <h1>Mapped equipment</h1>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, padding: '0 8px 8px 0' }}>
        <Input
          onInput={(event: any) => {
            setTempSearchQuery((event.target as HTMLInputElement).value);
          }}></Input>
        <Button
          size="small"
          onClick={() => {
            setMainSearchQuery(tempSearchQuery);
          }}>
          Search
        </Button>
        <Button
          size="small"
          type={searchMethod === 'allFdm' ? 'primary' : 'secondary'}
          onClick={() => {
            setSearchMethod('allFdm');
          }}>
          All FDM mappings search
        </Button>
        <Button
          size="small"
          type={searchMethod === 'fdmSearch' ? 'primary' : 'secondary'}
          onClick={() => {
            setSearchMethod('fdmSearch');
          }}>
          FDM search hook
        </Button>
        <Button
          size="small"
          type={searchMethod === 'allAssets' ? 'primary' : 'secondary'}
          onClick={() => {
            setSearchMethod('allAssets');
          }}>
          All asset mappings search
        </Button>
        <Button
          size="small"
          type={searchMethod === 'assetSearch' ? 'primary' : 'secondary'}
          onClick={() => {
            setSearchMethod('assetSearch');
          }}>
          Asset search hook
        </Button>
        <Button
          size="small"
          loading={isFetching || isAssetSearchFetching}
          onClick={fetchNextPageCallback}>
          Load More
        </Button>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: 200,
          overflow: 'scroll'
        }}>
        {filteredEquipment.map((equipment, index) => (
          <div key={equipment.externalId + index} style={{ border: '1px solid green' }}>
            <b>
              {((equipment as Equipment)?.view ?? determineViewFromQueryResultNodeItem(equipment)) +
                ' '}
            </b>
            <span>{equipment.externalId + ' '}</span>
            <span>
              <b>Space:</b> {equipment.space + ' '}
            </span>
            {equipment.properties !== undefined && JSON.stringify(equipment.properties)}
          </div>
        ))}
      </div>
    </>
  );
};

function assetInstanceToEquipment(instance: AssetInstance): Equipment {
  if (isClassicAsset(instance)) {
    return {
      view: 'Classic Asset',
      externalId: instance.id + '',
      space: 'Whole project',
      properties: {
        name: instance.name,
        description: instance.description
      }
    };
  } else {
    return {
      view: 'DM asset',
      ...instance
    };
  }
}

function determineViewFromQueryResultNodeItem(nodeItem: NodeItem | Equipment): string {
  return findNonZeroProperty(nodeItem?.properties) ?? 'Unknown';
}

function findNonZeroProperty(properties?: Record<string, any>): string | undefined {
  return Object.keys(properties ?? {}).find((key) => !isEqual(properties?.[key], {}));
}

export default SearchComponent;
