/**
 * Event InfoBox
 */

import { useCallback } from 'react';
import { Col, Row } from 'antd';
import dayjs from 'dayjs';
import { Body } from '@cognite/cogs.js';
import { CogniteEvent } from '@cognite/sdk';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
import { EventDetails } from './elements';

const defaultTranslations = makeDefaultTranslations(
  'Type',
  'Sub type',
  'Updated',
  'Created',
  'Event start and end time are the same, it may not be visible in the chart graph area.',
  'Start',
  'End',
  'External ID',
  'Root asset'
);

type Props = {
  event: Partial<CogniteEvent>;
  onToggleEvent: (id: number | undefined) => void;
  selected?: boolean;
  translations?: typeof defaultTranslations;
};

const EventInfoBox = ({
  event,
  onToggleEvent,
  selected = false,
  translations,
}: Props) => {
  const diff = dayjs(event.endTime).diff(dayjs(event.startTime));
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  const toggleSelection = useCallback(() => {
    onToggleEvent(event.id);
  }, []);

  const { startTime } = event;
  const { endTime } = event;

  return (
    <EventDetails $active={selected} onClick={toggleSelection}>
      <Row>
        <Col span={12}>
          <Body level={2}>{t.Type}:</Body>
          <Body level={2} strong>
            {event.type}
          </Body>
        </Col>
        <Col span={12}>
          <Body level={2}>{t['Sub type']}:</Body>
          <Body level={2} strong>
            {event.subtype}
          </Body>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Body level={2}>{t.Updated}:</Body>
          <Body level={2} strong>
            {dayjs(event.lastUpdatedTime).format('MM.DD.YYYY HH:mm')}
          </Body>
        </Col>
        <Col span={12}>
          <Body level={2}>{t.Created}:</Body>
          <Body level={2} strong>
            {dayjs(event.createdTime).format('MM.DD.YYYY HH:mm')}
          </Body>
        </Col>
      </Row>
      {diff <= 0 ? (
        <p className="hint">
          {
            t[
              'Event start and end time are the same, it may not be visible in the chart graph area.'
            ]
          }
        </p>
      ) : (
        ''
      )}
      <Row>
        <Col span={12}>
          <Body level={2}>{t.Start}:</Body>
          <Body level={2} strong>
            {dayjs(startTime).format('MM.DD.YYYY HH:mm')}
          </Body>
        </Col>
        <Col span={12}>
          <Body level={2}>{t.End}:</Body>
          <Body level={2} strong>
            {dayjs(endTime).format('MM.DD.YYYY HH:mm')}
          </Body>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Body level={2}>{t['External ID']}:</Body>
          <Body level={2} strong>
            {event.externalId}
          </Body>
        </Col>
        <Col span={12}>
          <Body level={2}>{t['Root asset']}:</Body>
          <Body level={2} strong>
            WIP
          </Body>
        </Col>
      </Row>
    </EventDetails>
  );
};

EventInfoBox.translationKeys = translationKeys(defaultTranslations);
EventInfoBox.defaultTranslations = defaultTranslations;
EventInfoBox.translationNamespace = 'EventInfoBox';

export default EventInfoBox;
