import { FileInfo, Asset } from 'cognite-sdk-v3';
import { dateSorter, stringCompare } from 'modules/contextualization/utils';
import { ResourceType } from 'modules/types';
import DetectedTags from 'components/DetectedTags';
import React from 'react';
import { Flex, Popover } from 'components/Common';
import { AssetSmallPreview, FileSmallPreview } from '@cognite/data-exploration';
import { Graphic } from '@cognite/cogs.js';

export const getColumns = (resourceType: ResourceType) => {
  const isAsset = resourceType === 'assets';

  const descriptionColumn = {
    title: 'Description',
    key: 'description',
    dataIndex: 'description',
    sorter: (a: any, b: any) => stringCompare(a?.description, b?.description),
    render: (description: string) => description ?? '-',
  };

  const detectedTagsColumn = {
    title: 'Detected tags',
    key: 'tags',
    render: (row: FileInfo) => <DetectedTags fileId={row.id} />,
  };

  return [
    {
      title: 'Preview',
      key: 'preview',
      width: 80,
      align: 'center' as 'center',
      render: (resource: any) => (
        <Flex row align justify>
          <Popover
            content={
              isAsset ? (
                <AssetSmallPreview assetId={(resource as Asset).id} />
              ) : (
                <FileSmallPreview fileId={(resource as FileInfo).id} />
              )
            }
          >
            <Graphic type="Image" />
          </Popover>
        </Flex>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
      render: (name: string) => name ?? '-',
    },
    isAsset ? descriptionColumn : detectedTagsColumn,
    {
      title: 'Last modified',
      key: 'lastUpdatedTime',
      dataIndex: 'lastUpdatedTime',
      sorter: (item: any) => dateSorter(item?.lastUpdatedTime),
      render: (lastUpdatedTime: Date) =>
        lastUpdatedTime ? new Date(lastUpdatedTime).toLocaleDateString() : '-',
    },
  ];
};
