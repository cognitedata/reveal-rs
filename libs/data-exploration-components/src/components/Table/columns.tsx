import {
  Body,
  Button,
  Dropdown,
  Flex,
  Label,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';
import { DataSet, Asset } from '@cognite/sdk';
import { useCdfItem, useCdfItems } from '@cognite/sdk-react-query-hooks';
import capitalize from 'lodash/capitalize';
import uniqueId from 'lodash/uniqueId';
import React from 'react';

import styled, { css } from 'styled-components';

import { HighlightCell, TimeDisplay } from 'components';

import { DASH, isNumber, mapFileType, METADATA_KEY_SEPARATOR } from 'utils';
import { createLink } from '@cognite/cdf-utilities';
import { useGetRootAsset } from 'hooks';
import { RootAssetCell } from './RootAssetCell';
import { ResourceTableHashMap } from './types';

// TODO: this whole approach needs to be refactored a bit, especially the usage of hooks and stuff
export const ResourceTableColumns: ResourceTableHashMap = {
  name: (query?: string) => {
    return {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
          />
        );
      },
    };
  },
  description: (query?: string) => {
    return {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
          />
        );
      },
    };
  },
  // [Product Decision]: We are highlighting type and external id fields according to the query
  // even though search has nothing to do with these fields.
  // https://docs.google.com/document/d/1NealpKxykyosTPul9695oX_njJjwyIlEhqYoDAsCLIg
  externalId: (query?: string) => {
    return {
      header: 'External ID',
      accessorKey: 'externalId',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
          />
        );
      },
    };
  },
  type: (query?: string) => {
    return {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ getValue }) => {
        return (
          <HighlightCell
            query={query}
            text={getValue<string>() || DASH}
            lines={1}
          />
        );
      },
    };
  },
  id: (query?: string) => {
    return {
      header: 'ID',
      accessorKey: 'id',
      cell: ({ getValue }) => {
        const text = isNumber(getValue<number>())
          ? `${getValue<number>()}`
          : DASH;
        return <HighlightCell query={query} text={text} lines={1} />;
      },
    };
  },
  subtype: {
    accessorKey: 'subtype',
    header: 'Subtype',
    cell: ({ getValue }) => {
      return <HighlightCell lines={1} text={getValue<string>() || DASH} />;
    },
  },
  created: {
    header: 'Created',
    accessorKey: 'createdTime',
    cell: ({ getValue }) => (
      <Body level={2}>
        <TimeDisplay value={getValue<number | Date>()} />
      </Body>
    ),
  },
  relation: {
    header: 'Relationship description(Source/Target)',
    accessorKey: 'relation',
  },
  labels: {
    header: 'Labels',
    accessorKey: 'labels',
    cell: ({ getValue }) => (
      <Flex gap={2} wrap="wrap">
        {getValue<{ externalId: string }[]>()?.map(label => (
          <Tooltip content={label.externalId} key={uniqueId()}>
            <StyledLabel variant="unknown" size="small">
              {label.externalId}
            </StyledLabel>
          </Tooltip>
        ))}
      </Flex>
    ),
    size: 200,
  },
  lastUpdatedTime: {
    accessorKey: 'lastUpdatedTime',
    header: 'Last updated',
    cell: ({ getValue }) => (
      <Body level={2}>
        <TimeDisplay value={getValue<number | Date>()} relative withTooltip />
      </Body>
    ),
  },
  parentExternalId: {
    header: 'Parent external ID',
    accessorKey: 'parentExternalId',
    cell: ({ getValue }) => (
      <HighlightCell text={getValue<string>() || DASH} lines={1} />
    ),
  },
  unit: {
    header: 'Unit',
    accessorKey: 'unit',
    cell: ({ getValue }) => (
      <HighlightCell text={getValue<string>() || DASH} lines={1} />
    ),
  },
  isString: {
    header: 'Is string',
    accessorKey: 'isString',
    cell: ({ getValue }) => (
      <Body level={2}>{capitalize(getValue<boolean>().toString())}</Body>
    ),
  },
  isStep: {
    header: 'Is step',
    accessorKey: 'isStep',
    cell: ({ getValue }) => (
      <Body level={2}>{capitalize(getValue<boolean>().toString())}</Body>
    ),
  },
  dataSet: {
    header: 'Dataset',
    accessorKey: 'dataSetId',
    cell: ({ getValue }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: ds } = useCdfItem<DataSet>(
        'datasets',
        { id: getValue<number>()! },
        {
          enabled: Number.isFinite(getValue()),
        }
      );
      return <Body level={2}>{(ds && ds?.name) || DASH}</Body>;
    },
  },
  assets: {
    header: 'Asset(s)',
    accessorKey: 'assetId',
    cell: ({ getValue, row }) => {
      const data = row.original;
      const ids = getValue()
        ? [{ id: getValue<number>() }]
        : data.assetIds?.map(val => ({ id: val }));

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: items, isFetched } = useCdfItems<Asset>(
        'assets',
        ids || [],
        true,
        { enabled: Boolean(data.assetIds) || Boolean(data.assetId) }
      );

      const hasData = items && items?.length > 0 && isFetched;

      if (!hasData) {
        return null;
      }

      if (items.length === 1) {
        const rootAsset = items[0];
        return (
          <Button
            onClick={e => e.stopPropagation()}
            type="link"
            target="_blank"
            href={createLink(`/explore/asset/${rootAsset.id}`)}
            icon="ArrowUpRight"
            iconPlacement="right"
          >
            <StyledButton>{rootAsset.name}</StyledButton>
          </Button>
        );
      }

      return (
        <Dropdown
          openOnHover
          content={
            <Menu>
              {items?.map(item => (
                <Menu.Item
                  onClick={e => e.stopPropagation()}
                  href={createLink(`/explore/asset/${item.id}`)}
                  target="_blank"
                  key={item.id}
                >
                  {item.name}
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button icon="ChevronDown" iconPlacement="right">
            {items?.length} Asset(s)
          </Button>
        </Dropdown>
      );
    },
  },
  startTime: {
    accessorKey: 'startTime',
    header: 'Start time',
    cell: ({ getValue }) => (
      <Body level={2}>
        {getValue() ? <TimeDisplay value={getValue<number | Date>()} /> : DASH}
      </Body>
    ),
  },
  endTime: {
    accessorKey: 'endTime',
    header: 'End time',
    cell: ({ getValue }) => (
      <Body level={2}>
        {getValue() ? <TimeDisplay value={getValue<number | Date>()} /> : DASH}
      </Body>
    ),
  },
  mimeType: {
    accessorKey: 'mimeType',
    header: 'Type',
    cell: ({ getValue }) => (
      <Body level={2}>
        <Tooltip interactive content={getValue<string>()}>
          <>{mapFileType(getValue<string>() || '')}</>
        </Tooltip>
      </Body>
    ),
  },
  uploadedTime: {
    accessorKey: 'uploadedTime',
    header: 'Uploaded',
    cell: ({ row: { original: file } }) => (
      <Body level={2}>
        {file && file.uploaded ? (
          <TimeDisplay value={file.uploadedTime} relative withTooltip />
        ) : (
          DASH
        )}
      </Body>
    ),
  },
  source: {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ getValue }) => (
      <HighlightCell text={getValue<string>() || DASH} lines={1} />
    ),
  },
  columns: {
    accessorKey: 'columns',
    header: '№ of Columns',
    cell: ({ getValue }) => (
      <Body level={2}>
        {getValue() ? getValue<Array<unknown>>().length : 0}
      </Body>
    ),
  },
  asset: {
    accessorKey: 'assetId',
    header: 'Root asset',
    cell: ({ getValue }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: rootAsset, isLoading } = useGetRootAsset(
        getValue<number>()!
      );

      return isLoading || rootAsset?.name ? (
        <Button
          type="link"
          onClick={e => e.stopPropagation()}
          target="_blank"
          href={createLink(`/explore/asset/${getValue()}`)}
          icon="ArrowUpRight"
          iconPlacement="right"
        >
          <StyledButton>{rootAsset?.name}</StyledButton>
        </Button>
      ) : (
        DASH
      );
    },
  },
  rootAsset: {
    accessorKey: 'rootId',
    header: 'Root asset',
    cell: ({ getValue }) => {
      const value = getValue<number | undefined>();
      if (!value) return <>{DASH}</>;
      return <RootAssetCell value={value} />;
    },
  },
  relationshipLabels: {
    accessorKey: 'relationshipLabels',
    header: 'Relationship labels',
    size: 250,
    cell: ({ getValue }) => (
      <Flex gap={2} wrap="wrap">
        {getValue<string[]>()?.map((label: string) => (
          <Tooltip content={label} key={uniqueId()}>
            <StyledLabel variant="unknown" size="small">
              {label}
            </StyledLabel>
          </Tooltip>
        ))}
      </Flex>
    ),
  },
  metadata: (key: string, accessorFn?: (row: any) => string) => {
    return {
      id: `metadata${METADATA_KEY_SEPARATOR}${key}`,
      accessorFn: row =>
        accessorFn ? accessorFn(row) : row?.metadata?.[key] || DASH,
      header: key,
      meta: {
        isMetadata: true,
      },
    };
  },
};

const ellipsistyles = css`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLabel = styled(Label)`
  display: block;
  ${ellipsistyles};
`;

export const StyledButton = styled.div`
  ${ellipsistyles};
  max-width: 80px;
`;
