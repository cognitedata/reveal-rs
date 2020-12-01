import React from 'react';
import { Avatar, Menu, TopBar, Button } from '@cognite/cogs.js';
import sidecar from 'config/sidecar';

import logoSvg from 'assets/logo.svg';
import useSelector from 'hooks/useSelector';
import { selectUser } from 'reducers/environment';
import { useHistory } from 'react-router-dom';
import useDispatch from 'hooks/useDispatch';
import { createNewChart } from 'reducers/charts/api';

const TopBarWrapper = () => {
  const user = useSelector(selectUser);
  const history = useHistory();
  const dispatch = useDispatch();

  const handleClickNewChart = () => {
    dispatch(createNewChart());
  };

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo
          title="Cognite Charts"
          logo={
            <Button unstyled onClick={() => history.push('/')}>
              <img
                src={logoSvg}
                alt="Cognite Charts Logo"
                style={{ margin: '0 12px 0 16px' }}
              />
            </Button>
          }
        />
        <TopBar.Action
          icon="ChartMergedView"
          text="New chart"
          onClick={() => handleClickNewChart()}
        />
        <TopBar.Navigation links={[]} />
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Actions
          actions={[
            {
              key: 'help',
              icon: 'Help',
              name: 'Help',
              menu: (
                <Menu>
                  <Menu.Item
                    onClick={() => window.open(sidecar.privacyPolicyUrl)}
                  >
                    Privacy policy
                  </Menu.Item>
                  <Menu.Footer>
                    v. {process.env.REACT_APP_VERSION_NAME || 'local'}
                  </Menu.Footer>
                </Menu>
              ),
            },
            {
              key: 'avatar',
              component: <Avatar text={user.email || 'Unknown'} />,
            },
          ]}
        />
      </TopBar.Right>
    </TopBar>
  );
};

export default TopBarWrapper;
