import React from 'react';
import styled from 'styled-components';
import { Graphic, Tooltip } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { Flex, IconButton, Popover } from 'components/Common';
import DetectedTags from 'components/DetectedTags';
import { dateSorter, stringCompare } from 'modules/contextualization/utils';
import { PERMISSIONS_STRINGS, TOOLTIP_STRINGS } from 'stringConstants';
import { FileSmallPreview } from 'components/FileSmallPreview';
import { trackUsage, PNID_METRICS } from '../../utils/Metrics';

const SettingButtons = styled(Flex)`
  & > * {
    margin: 0 4px;
  }
`;

export const getColumns = (
  onFileEdit: (file: FileInfo) => void,
  onFileView: (file: FileInfo) => void,
  onClearAnnotations: (file: FileInfo) => void,
  writeAccess: boolean
) => [
  {
    title: 'Preview',
    key: 'preview',
    width: 80,
    align: 'center' as 'center',
    render: (file: FileInfo) => (
      <Flex row align justify>
        <Popover
          content={<FileSmallPreview fileId={file.id} />}
          onVisibleChange={(visible) =>
            visible && trackUsage(PNID_METRICS.landingPage.previewFile)
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
    render: (name: string) => <div>{name}</div>,
    sorter: (a: any, b: any) => stringCompare(a?.name, b?.name),
  },
  {
    title: 'Detected tags',
    key: 'tags',
    render: (row: FileInfo) => <DetectedTags fileId={row.id} />,
  },
  {
    title: 'Last modified',
    dataIndex: 'lastUpdatedTime',
    key: 'lastUpdatedTime',
    render: (date: string) => {
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
    sorter: dateSorter((x: any) => x?.lastUpdatedTime!),
    defaultSortOrder: 'descend',
  },
  {
    title: 'Settings',
    key: 'settings',
    width: '100px',
    align: 'center' as 'center',
    render: (file: FileInfo) => {
      return (
        <SettingButtons row align>
          <Tooltip content={TOOLTIP_STRINGS.EDIT_FILE_TOOLTIP}>
            <IconButton
              $square
              icon="Edit"
              onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => {
                event.stopPropagation();
                onFileEdit(file);
              }}
            />
          </Tooltip>
          <Tooltip content={TOOLTIP_STRINGS.VIEW_FILE_TOOLTIP}>
            <IconButton
              $square
              icon="Eye"
              onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => {
                event.stopPropagation();
                onFileView(file);
              }}
            />
          </Tooltip>
          <Tooltip
            content={
              writeAccess
                ? TOOLTIP_STRINGS.CLEAR_TAGS_TOOLTIP
                : PERMISSIONS_STRINGS.FILES_WRITE_PERMISSIONS
            }
          >
            <IconButton
              $square
              icon="Trash"
              onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => {
                event.stopPropagation();
                onClearAnnotations(file);
              }}
              disabled={!writeAccess}
            />
          </Tooltip>
        </SettingButtons>
      );
    },
  },
];
