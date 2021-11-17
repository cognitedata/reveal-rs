import {
  Body,
  Button,
  Detail,
  Graphic,
  Label,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useState } from 'react';
import { PlaceholderWrapper } from './elements';

export const Placeholder = ({
  componentName,
  componentDescription,
  votingHandler,
}: {
  componentName: string;
  componentDescription: string;
  votingHandler: (response: string) => void;
}) => {
  const [showVotingResponse, setShowVotingResponse] = useState(false);
  const { t } = useTranslation('placeholder');

  const onVote = (vote: string) => {
    setShowVotingResponse(true);
    votingHandler(vote);
  };

  return (
    <PlaceholderWrapper>
      <div className="content">
        <div className="placeholder-text">
          <Title level={3}>{t('placeholder_title', 'Coming soon')}</Title>
          <Tooltip
            content={
              <Body level={3} strong style={{ color: 'var(--cogs-white)' }}>
                {componentDescription}
              </Body>
            }
            placement="bottom"
            arrow={false}
            delay={250}
          >
            <Label
              icon="Help"
              iconPlacement="right"
              size="medium"
              variant="unknown"
            >
              {componentName}
            </Label>
          </Tooltip>
          <Body level={1}>
            {t(
              'placeholder_text_part_1',
              'is on our roadmap. You can vote to help us prioritize the development, or contact the team'
            )}{' '}
            <a href="mailto:devx@cognite.com">devx@cognite.com</a>{' '}
            {t('placeholder_text_part_2', 'if you want to share more ideas.')}
          </Body>
        </div>
        <div className="placeholder-actions">
          <Body level={1}>
            {t('vote_question', 'When should we start working on that?')}
          </Body>
          <Button icon="ThumbsUp" onClick={() => onVote('ASAP')}>
            {t('vote_option_asap', 'ASAP')}
          </Button>
          <Button icon="ThumbsUp" onClick={() => onVote('Later')}>
            {t('vote_option_later', 'Later')}
          </Button>
          <Body level={1}>{t('or', 'or')}</Body>
          <Button icon="ThumbsDown" onClick={() => onVote('No need')}>
            {t('vote_option_no_need', "Don't need it")}
          </Button>
          {showVotingResponse && (
            <Detail>{t('vote_response', 'Thanks for voting!')}</Detail>
          )}
        </div>
      </div>
      <Graphic type="Search" style={{ width: 147, height: 147 }}></Graphic>
    </PlaceholderWrapper>
  );
};
