/*!
 * Copyright 2023 Cognite AS
 */

import { type DataSourceType, type Cognite3DViewer, type Image360 } from '@cognite/reveal';
import { type ReactElement, useEffect, useRef, useState } from 'react';
import { Image360HistoricalPanel } from './Panel/Image360HistoricalPanel';
import {
  Image360HistoricalSummary,
  type Image360RevisionDetails
} from './Toolbar/Image360HistoricalSummary';
import { formatDate } from './utils/FormatDate';
import styled from 'styled-components';
import { uniqueId } from 'lodash';
import { getStationIdentifier } from './utils/getStationIdentifier';

export type Image360HistoricalDetailsProps = {
  viewer: Cognite3DViewer<DataSourceType>;
  image360Entity?: Image360<DataSourceType>;
  onExpand?: (isExpanded: boolean) => void;
  fallbackLanguage?: string;
};

export const Image360HistoricalDetails = ({
  viewer,
  image360Entity,
  onExpand,
  fallbackLanguage
}: Image360HistoricalDetailsProps): ReactElement => {
  const [revisionDetailsExpanded, setRevisionDetailsExpanded] = useState<boolean>(false);
  const [activeRevision, setActiveRevision] = useState<number>(0);
  const [revisionCollection, setRevisionCollection] = useState<Image360RevisionDetails[]>([]);
  const [imageUrls, setImageUrls] = useState<Array<string | undefined>>([]);
  const [minWidth, setMinWidth] = useState('100px');
  const newScrollPosition = useRef(0);

  useEffect(() => {
    const fetchRevisionCollection = async (): Promise<void> => {
      if (image360Entity !== undefined) {
        const revisions = image360Entity.getRevisions();
        const revisionDates = revisions.map((revision) => revision.date);
        const imageDatas = await Promise.all(
          revisions.map(async (revision) => await revision.getPreviewThumbnailUrl())
        );
        setImageUrls(imageDatas);

        const collection = revisionDates.map((date, index) => {
          return {
            date: formatDate(date),
            imageUrl: imageDatas[index],
            index,
            image360Entity
          };
        });

        newScrollPosition.current = 0;
        setRevisionCollection(collection);
        setActiveRevision(0);
      }
    };

    void fetchRevisionCollection();

    return () => {
      // Remove image URLs
      imageUrls.forEach((url) => {
        if (url !== undefined) {
          URL.revokeObjectURL(url);
        }
      });
      setImageUrls([]);
    };
  }, [image360Entity]);

  useEffect(() => {
    const newMinWidth = revisionDetailsExpanded ? '100%' : '100px';
    setMinWidth(newMinWidth);
    if (onExpand !== undefined) {
      onExpand(revisionDetailsExpanded);
    }
  }, [revisionDetailsExpanded]);

  return (
    <DetailsContainer style={{ minWidth }}>
      {
        <>
          <Image360HistoricalPanel
            key={uniqueId()}
            revisionCount={revisionCollection.length}
            revisionDetailsExpanded={revisionDetailsExpanded}
            setRevisionDetailsExpanded={setRevisionDetailsExpanded}
            fallbackLanguage={fallbackLanguage}
          />
          {revisionDetailsExpanded && (
            <Image360HistoricalSummary
              ref={newScrollPosition}
              key={uniqueId()}
              viewer={viewer}
              stationId={
                image360Entity !== undefined ? getStationIdentifier(image360Entity) : undefined
              }
              stationName={image360Entity?.label}
              activeRevision={activeRevision}
              setActiveRevision={setActiveRevision}
              revisionCollection={revisionCollection}
              fallbackLanguage={fallbackLanguage}
            />
          )}
        </>
      }
    </DetailsContainer>
  );
};

const DetailsContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: fit-content;
  width: 100%;
`;
