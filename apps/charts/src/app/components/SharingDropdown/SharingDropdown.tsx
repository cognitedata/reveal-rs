import { ComponentProps } from 'react';

import styled from 'styled-components/macro';

import {
  Dropdown,
  Switch,
  Title,
  Menu,
  Body,
  Input,
  Colors,
  MiddleEllipsis,
  DropdownProps,
} from '@cognite/cogs.js';

import {
  makeDefaultTranslations,
  translationKeys,
} from '../../utils/translations';
import CopyButton from '../CopyButton/CopyButton';

interface SharingDropdownProps extends Omit<DropdownProps, 'children'> {
  chart: {
    name: string;
    public: boolean;
  };
  onToggleChartAccess: ComponentProps<typeof Switch>['onChange'];
  disabled?: boolean;
  translations?: typeof defaultTranslations;
  popperOptions?: ComponentProps<typeof Dropdown>['popperOptions'];
}

const defaultTranslations = makeDefaultTranslations(
  'This is a public chart. Copy the link to share it. Viewers will have to duplicate the chart in order to make changes.',
  'This is a private chart. Make it public if you want to share it.',
  'Sharing on',
  'Sharing off',
  'Copy link'
);

const SharingDropdown = ({
  chart,
  disabled = false,
  onToggleChartAccess,
  translations,
  popperOptions = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [-260, 10],
        },
      },
    ],
  },
  ...rest
}: SharingDropdownProps) => {
  const shareableLink = window.location.href;
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  return (
    <StyledDropdown
      disabled={disabled}
      popperOptions={popperOptions}
      content={
        <SharingMenu>
          <SharingMenuContent>
            <MiddleEllipsis>
              <Title level={3}>{chart.name}</Title>
            </MiddleEllipsis>
            <SharingMenuBody level={1}>
              {chart.public
                ? t[
                    'This is a public chart. Copy the link to share it. Viewers will have to duplicate the chart in order to make changes.'
                  ]
                : t[
                    'This is a private chart. Make it public if you want to share it.'
                  ]}
            </SharingMenuBody>
            <SharingSwitchContainer>
              <Switch
                name="toggleChartAccess"
                label={chart.public ? t['Sharing on'] : t['Sharing off']}
                checked={chart.public}
                onChange={onToggleChartAccess}
              />
            </SharingSwitchContainer>
            <ShareLinkContainer>
              <ShareLink
                fullWidth
                variant="default"
                value={shareableLink}
                disabled={!chart.public}
                htmlSize={32}
              />
              <CopyButton
                value={shareableLink}
                type="primary"
                iconPlacement="right"
                style={{
                  color: chart.public
                    ? Colors['decorative--grayscale--white']
                    : Colors['decorative--grayscale--600'],
                  flexShrink: 0,
                }}
                disabled={!chart.public}
              >
                {t['Copy link']}
              </CopyButton>
            </ShareLinkContainer>
          </SharingMenuContent>
        </SharingMenu>
      }
      {...rest}
    />
  );
};

const SharingMenu = styled(Menu)`
  min-width: 500px;
`;

const SharingSwitchContainer = styled.div`
  margin: 16px 0 0 0;
`;

const SharingMenuContent = styled.div`
  margin: 16px;
  text-align: left;
`;

const SharingMenuBody = styled(Body)`
  margin: 8px 0 0;
  min-height: 40px;
  white-space: normal;
`;

const ShareLinkContainer = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 1em;
`;

const ShareLink = styled(Input)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledDropdown = styled(Dropdown)`
  width: 100%;
`;

SharingDropdown.defaultTranslations = defaultTranslations;
SharingDropdown.translationKeys = translationKeys(defaultTranslations);
SharingDropdown.translationNamespace = 'SharingDropdown';

export default SharingDropdown;
