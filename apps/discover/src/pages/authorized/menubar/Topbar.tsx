import { useClearAllFilters } from 'domain/savedSearches/internal/hooks/useClearAllFilters';

import { useMemo } from 'react';
import * as React from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { ProductLogo, TopBar } from '@cognite/cogs.js';

import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useTranslation } from 'hooks/useTranslation';
import { useActivePanel } from 'modules/resultPanel/selectors';
import { hideResults } from 'modules/search/actions';

import { useProjectConfigByKey } from '../../../hooks/useProjectConfig';
import { setActivePanel } from '../../../modules/resultPanel/actions';
import { openExternalPage } from '../../../utils/openExternalPage';

import { AdminSettings } from './AdminSettings';
import {
  SEARCH_LINK_TEXT_KEY,
  FAVORITES_LINK_TEXT_KEY,
  PATHNAMES,
  REPORT_MANAGER_TEXT_KEY,
} from './constants';
import { Container, TopBarLogo, TopBarNavigationWrapper } from './elements';
import { Feedback } from './Feedback';
import { TenantLogo } from './TenantLogo';
import { UserProfileButton } from './UserProfileButton';
import { UserSettings } from './userSettings';

export const Topbar: React.FC = () => {
  const metrics = useGlobalMetrics('topbar');
  const [activeTab, setActive] = React.useState<number>(1);
  const { t } = useTranslation('global');
  const history = useHistory();
  const dispatch = useDispatch();
  const clearAllFilters = useClearAllFilters();
  const activePanel = useActivePanel();
  const { pathname } = useLocation();
  const { data: externalLinks } = useProjectConfigByKey('externalLinks');

  const getNavigationHandler =
    (page: string, id = -1) =>
    () => {
      setActive(id);
      history.push(page);
    };

  const handleExternalNavigate = (externalLink: string) => {
    openExternalPage(externalLink, true);
  };

  React.useEffect(() => {
    const mapOfPathNames = Object.entries(PATHNAMES);

    const [, key] = mapOfPathNames.find(([name]) => {
      return pathname
        .toLocaleLowerCase()
        .includes(`/${name.toLocaleLowerCase()}`);
    }) || ['NOT_FOUND', -1];

    setActive(key as number);
  }, [pathname]);

  const handleLogoClick = async () => {
    metrics.track('click-discover-logo-button');
    // make sure to reset the filters
    await clearAllFilters();
    // hide the result panel
    batch(() => {
      dispatch(setActivePanel(undefined));
      dispatch(hideResults());
    });

    getNavigationHandler(navigation.SEARCH, PATHNAMES.SEARCH)();
  };

  const companyLogo = useMemo(() => {
    return (
      <TopBarLogo
        onClick={handleLogoClick}
        title="Cognite Discover"
        data-testid="cognite-logo"
        logo={<ProductLogo type="Discover" />}
      />
    );
  }, []);

  const renderTopBarLeft = React.useMemo(
    () => (
      <TopBar.Left>
        {companyLogo}
        <TopBarNavigationWrapper
          links={[
            {
              name: t(SEARCH_LINK_TEXT_KEY) as string,
              isActive: activeTab === PATHNAMES.SEARCH,
              onClick: getNavigationHandler(
                `${navigation.SEARCH}${activePanel ? `/${activePanel}` : ''}`,
                PATHNAMES.SEARCH
              ),
            },
            {
              name: t(FAVORITES_LINK_TEXT_KEY) as string,
              isActive: activeTab === PATHNAMES.FAVORITES,
              onClick: getNavigationHandler(
                navigation.FAVORITES,
                PATHNAMES.FAVORITES
              ),
            },
            {
              name: REPORT_MANAGER_TEXT_KEY,
              isActive: activeTab === PATHNAMES.REPORTS,
              onClick: getNavigationHandler(
                navigation.REPORT_PANEL,
                PATHNAMES.REPORTS
              ),
            },
          ]
            .concat(
              ((externalLinks as Array<any>) || []).map((externalLink) => {
                return {
                  name: externalLink.title,
                  isActive: false,
                  onClick: () => handleExternalNavigate(externalLink.link),
                };
              })
            )
            .filter((item) => item.name !== REPORT_MANAGER_TEXT_KEY)} // disabled for now
        />
      </TopBar.Left>
    ),
    [activeTab, activePanel, externalLinks]
  );

  const renderTopBarRight = React.useMemo(
    () => (
      <TopBar.Right>
        <AdminSettings
          handleNavigation={(navigation: string, path: number) => {
            getNavigationHandler(navigation, path)();
          }}
          activeTab={activeTab}
        />

        <UserSettings />
        <Feedback />
        <UserProfileButton />

        <TenantLogo />
      </TopBar.Right>
    ),
    [activeTab]
  );

  return (
    <>
      <Container data-testid="top-bar">
        <TopBar>
          {renderTopBarLeft}
          {renderTopBarRight}
        </TopBar>
      </Container>
    </>
  );
};
