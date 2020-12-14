import React from 'react';
import { Detail, Overline, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import {
  TileHeader,
  TileContainer,
  TilePreview,
  TileDescription,
  TileOverline,
} from 'components/tiles/element';
import { SuiteRowDelete } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';

const TilePreviewHeight = '184';
const TilePreviewWidth = '300';

interface Props {
  avatar?: boolean;
  color?: string;
  dataItem: TS_FIX_ME;
  menu: React.ReactElement;
  handleDelete?: (key: SuiteRowDelete[]) => void;
  handleEdit?: (key: SuiteRowDelete[]) => void;
  view?: 'suite' | 'board';
}
// eslint-disable-next-line
// TODO manipulate DOM to change iframe width & height
const adjustIframeTagSize = (tag: string = ''): string =>
  tag
    .replace(/(height=["|']?)(\d*)/, `$1${TilePreviewHeight}`)
    .replace(/(width=["|']?)(\d*)/, `$1${TilePreviewWidth}`);

const renderIframe = (tag: string): JSX.Element | null => {
  if (!tag) {
    return null;
  }
  const elem = (
    // eslint-disable-next-line react/no-danger
    <div dangerouslySetInnerHTML={{ __html: adjustIframeTagSize(tag) }} />
  );
  return elem;
};

export const Tile: React.FC<Props> = ({
  avatar = false,
  color,
  dataItem,
  menu,
  view = 'suite',
}: Props) => {
  const isBoard = view === 'board';
  return (
    <>
      <TileContainer>
        <TileHeader isBoard={isBoard} color={color}>
          {avatar && (
            <SuiteAvatar title={dataItem.title} color={dataItem.color} />
          )}
          <TileDescription>
            <TileOverline isBoard={isBoard}>
              <Overline level={3}>{dataItem?.type}</Overline>
            </TileOverline>
            <Title level={6}>{dataItem.title}</Title>
          </TileDescription>
          {menu}
        </TileHeader>
        {dataItem.embedTag ? (
          renderIframe(dataItem.embedTag)
        ) : (
          <TilePreview>
            <Detail>{dataItem.description}</Detail>
          </TilePreview>
        )}
      </TileContainer>
    </>
  );
};
