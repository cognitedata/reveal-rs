/*!
 * Copyright 2023 Cognite AS
 */

import { Body, Flex } from '@cognite/cogs.js';
import React, { forwardRef, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Thumbnail } from '../utils/Thumbnail';
import { type DataSourceType, type Cognite3DViewer, type Image360 } from '@cognite/reveal';
// Using named import to avoid react component creation error when default import is used.
import { uniqueId } from 'lodash';
import { useTranslation } from '../../i18n/I18n';

export type Image360RevisionDetails = {
  date?: string;
  imageUrl?: string;
  index: number;
  image360Entity: Image360<DataSourceType> | undefined;
};

export type Image360HistoricalSummaryProps = {
  stationId?: string;
  stationName?: string;
  viewer?: Cognite3DViewer<DataSourceType>;
  revisionCollection: Image360RevisionDetails[];
  activeRevision: number;
  setActiveRevision: (index: number) => void;
  fallbackLanguage?: string;
};

export const Image360HistoricalSummary = forwardRef(
  (
    {
      stationId,
      stationName,
      revisionCollection,
      activeRevision,
      setActiveRevision,
      viewer,
      fallbackLanguage
    }: Image360HistoricalSummaryProps,
    ref: React.ForwardedRef<number>
  ) => {
    const { t } = useTranslation(fallbackLanguage);
    const gridContainerRef = useRef<HTMLDivElement>(null);

    const onRevisionChanged = async (
      revisionDetails: Image360RevisionDetails,
      index: number
    ): Promise<void> => {
      if (viewer !== undefined && revisionDetails.image360Entity !== undefined) {
        setActiveRevision(index);
        const revisions = revisionDetails.image360Entity.getRevisions();
        const revisionIndex = revisionDetails.index;
        if (revisionIndex >= 0 && revisionIndex < revisions.length) {
          await viewer.enter360Image(revisionDetails.image360Entity, revisions[revisionIndex]);
        }
      }
    };

    function isMutableRefObject<T>(ref: React.ForwardedRef<T>): ref is React.MutableRefObject<T> {
      return (ref as React.MutableRefObject<T>).current !== undefined;
    }

    function onScroll(e: React.UIEvent<HTMLDivElement, UIEvent>): void {
      if (isMutableRefObject(ref)) {
        ref.current = e.currentTarget.scrollLeft;
      }
    }

    useEffect(() => {
      if (gridContainerRef.current !== null && isMutableRefObject(ref)) {
        gridContainerRef.current.scrollLeft = ref.current;
      }
    }, []);

    return (
      <OverviewContainer>
        <StyledFlex direction="column">
          <StyledSubFlex>{stationName}</StyledSubFlex>
          <StyledDetail>
            {t({ key: 'IMAGES_360_STATION' })} {stationId}
          </StyledDetail>
        </StyledFlex>

        <StyledLayoutGridContainer onScroll={onScroll} ref={gridContainerRef}>
          <StyledLayoutGrid>
            {revisionCollection.map((revisionDetails, index) => (
              <RevisionItem
                key={uniqueId()}
                onClick={() => {
                  void onRevisionChanged(revisionDetails, index);
                }}>
                <Thumbnail
                  key={index}
                  isActive={activeRevision === index}
                  imageUrl={revisionDetails.imageUrl}
                  isLoading={false}
                />
                <Body size="x-small" style={{ height: '16px' }}>
                  {revisionDetails.date}
                </Body>
              </RevisionItem>
            ))}
          </StyledLayoutGrid>
        </StyledLayoutGridContainer>
      </OverviewContainer>
    );
  }
);

Image360HistoricalSummary.displayName = 'Image360HistoricalSummary';

const StyledSubFlex = styled(Flex)`
  align-items: flex-start;
  margin-bottom: 10px;

  //Restrict text length
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledFlex = styled(Flex)`
  max-width: 25%;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  letter-spacing: -0.014em;
  font-feature-settings: 'cv05' on;
  color: rgba(0, 0, 0, 0.9);
`;

const StyledDetail = styled(Body).attrs({
  size: 'x-small'
})`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.006em;
  font-feature-settings: 'ss04' on;
  color: rgba(0, 0, 0, 0.9);

  //Restrict text length
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLayoutGridContainer = styled.div`
  width: 70%;
  height: fit-content;
  overflow-x: auto;
  padding: 0 0 5px 0;

  /* Customize scrollbar styles */
  scrollbar-width: thin;
  scrollbar-color: #999999 #d9d9d9;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background-color: #d9d9d9;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #999999;
    border-radius: 2px;
  }
`;

const StyledLayoutGrid = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
  min-width: fit-content;
`;

const RevisionItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.8;
  gap: 10px;
`;

const OverviewContainer = styled.div`
  display: flex;
  height: fit-content;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 16px 8px 16px;
  background: #ffffff;
  box-shadow: 0px -4px 12px rgba(0, 0, 0, 0.25);
`;
