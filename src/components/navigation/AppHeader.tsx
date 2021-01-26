import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Icon, TopBar, Menu, Graphic, Tooltip } from '@cognite/cogs.js';
import { useSelector } from 'react-redux';
import { isAdmin } from 'store/groups/selectors';
import { getUserId } from 'store/auth/selectors';
import isEqual from 'lodash/isEqual';
import customerLogo from 'images/NOC_logo.png';
import { CustomLink } from 'styles/common';
import { startIntercomTour } from 'utils/intercom';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { logout } from 'utils/logout';
import { LogoWrapper } from './elements';

const AppHeader: React.FC = () => {
  const admin = useSelector(isAdmin);
  const email = useSelector(getUserId);

  const handleOnSupportClick = () => {
    if (window.Intercom) {
      window.Intercom('show');
    }
  };
  const client = useContext(CdfClientContext);

  const performLogout = async () => {
    await logout(client);
  };

  const actions = [
    {
      key: 'view',
      component: (
        <Tooltip content="View what other groups has access to">
          <Icon type="Public" />
        </Tooltip>
      ),
      menu: (
        <Menu>
          <Menu.Header>Select Group Access to View:</Menu.Header>
          <Menu.Item>Operations Control Managers</Menu.Item>
          <Menu.Item>Testing team</Menu.Item>
          <Menu.Item>Management team</Menu.Item>
        </Menu>
      ),
    },
    {
      key: 'feedback',
      component: (
        <Tooltip content="Support">
          <Icon type="Feedback" />
        </Tooltip>
      ),
      onClick: handleOnSupportClick,
    },
    {
      key: 'help',
      component: (
        <Tooltip content="Help">
          <Icon type="Help" />
        </Tooltip>
      ),
      menu: (
        <Menu>
          <Menu.Header>Cognite documentation</Menu.Header>
          <Menu.Item>
            <CustomLink
              // TODO(DTC-224) replace with stable link as soon as it is available
              href="https://pr-567.docs.preview.cogniteapp.com/cockpit/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Getting Started
            </CustomLink>
          </Menu.Item>
          <Menu.Item>FAQs</Menu.Item>
          <Menu.Divider />
          <Menu.Item>
            <div
              role="button"
              tabIndex={0}
              onClick={startIntercomTour}
              onKeyDown={startIntercomTour}
            >
              Introduction to Digital Cockpit
            </div>
          </Menu.Item>
        </Menu>
      ),
    },
    {
      key: 'user',
      component: <Avatar text={email} />,
      menu: (
        <Menu>
          <Menu.Item>
            <CustomLink
              href="https://www.cognite.com/en/policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy policy
            </CustomLink>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item>
            <div
              role="button"
              tabIndex={0}
              onClick={performLogout}
              onKeyPress={performLogout}
            >
              Log out
            </div>
          </Menu.Item>
        </Menu>
      ),
    },
  ];

  const filteredActions = !admin
    ? actions.filter((action) => !isEqual(action.key, 'view'))
    : actions;

  return (
    <TopBar>
      <TopBar.Left>
        <LogoWrapper>
          <Link to="/">
            <TopBar.Logo
              title="Digital Cockpit"
              logo={
                <Graphic
                  type="Cognite"
                  style={{ width: 32, margin: '6px 8px 0 12px' }}
                />
              }
            />
          </Link>
        </LogoWrapper>
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Actions actions={filteredActions} />
        <TopBar.Item>
          <a href="https://noc.qa/" target="_blank" rel="noopener noreferrer">
            <img
              style={{ padding: 16 }}
              src={customerLogo}
              alt="Customer logo"
            />
          </a>
        </TopBar.Item>
      </TopBar.Right>
    </TopBar>
  );
};

export default AppHeader;
