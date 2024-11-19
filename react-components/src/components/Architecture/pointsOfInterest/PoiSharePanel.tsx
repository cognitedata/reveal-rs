/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactNode, useState } from 'react';
import { type PointsOfInterestDomainObject } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestDomainObject';
import { useTranslation } from '../../i18n/I18n';
import { Button, Flex, Infobox, LinkIcon, ShareIcon, Switch, TextLabel } from '@cognite/cogs.js';
import { Changes } from '../../../architecture';
import styled from 'styled-components';
import { useOnUpdateDomainObject } from '../useOnUpdate';
import { usePoiDomainObject } from './usePoiDomainObject';

export const PoiSharePanel = (): ReactNode => {
  const { t } = useTranslation();

  const poiDomainObject = usePoiDomainObject();

  const selectedPointOfInterest = poiDomainObject?.selectedPointsOfInterest;
  const [poiVisibility, setPoiVisibility] = useState<'PUBLIC' | 'PRIVATE'>(
    selectedPointOfInterest?.properties.visibility ?? 'PRIVATE'
  );

  const handleShare = async (): Promise<void> => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
  };

  useOnUpdateDomainObject(poiDomainObject, () => {
    const visibility = selectedPointOfInterest?.properties.visibility ?? 'PRIVATE';
    setPoiVisibility(visibility);
  });

  return (
    <StyledShareContainer>
      <Flex direction="column" gap={8}>
        <Flex direction="row" gap={16}>
          <ShareIcon />
          <TextLabel text={t('SHARE', 'Share')} />
        </Flex>
        <PoiVisibilityInfobox poiDomainObject={poiDomainObject} poiVisibility={poiVisibility} />
        <Button icon=<LinkIcon /> disabled={poiVisibility === 'PRIVATE'} onClick={handleShare}>
          {t('COPY_URL_TO_SHARE', 'Copy URL to share')}
        </Button>
      </Flex>
    </StyledShareContainer>
  );
};

const PoiVisibilityInfobox = ({
  poiDomainObject,
  poiVisibility
}: {
  poiDomainObject?: PointsOfInterestDomainObject<any>;
  poiVisibility: 'PUBLIC' | 'PRIVATE';
}): ReactNode => {
  const { t } = useTranslation();

  const selectedPointOfInterest = poiDomainObject?.selectedPointsOfInterest;
  const markedPublic = poiVisibility === 'PUBLIC';
  const header = markedPublic
    ? t('POINT_OF_INTEREST_IS_PUBLIC', 'Point of interest is public')
    : t('POINT_OF_INTEREST_IS_PRIVATE', 'Point of interest is private');
  const content = markedPublic
    ? t('POINT_OF_INTEREST_PUBLIC_DESCRIPTION', 'Point of interest is public and visible to anyone')
    : t(
        'POINT_OF_INTEREST_PRIVATE_DESCRIPTION',
        'Point of interest is private and only visible to you'
      );

  if (poiDomainObject === undefined || selectedPointOfInterest === undefined) {
    return null;
  }

  return (
    <Infobox status="neutral" icon={false}>
      <Flex direction="row" gap={16} alignItems="center">
        <Switch
          checked={markedPublic}
          onChange={(_: InputEvent, checked: boolean) => {
            selectedPointOfInterest.properties.visibility = checked ? 'PUBLIC' : 'PRIVATE';
            void poiDomainObject.updatePointsOfInterest([selectedPointOfInterest]);
            poiDomainObject.notify(Changes.geometry);
          }}
        />
        <Flex direction="column">
          <h3>{header}</h3>
          <TextLabel text={content} />
        </Flex>
      </Flex>
    </Infobox>
  );
};

const StyledShareContainer = styled.div`
  background-color: white;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 16px;
  width: fit-content;
  max-width: fit-content;
  min-width: 400px;
  box-shadow: var(--cogs-elevation--overlay);
`;
