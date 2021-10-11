import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';

import { Button, Icon, Menu, Tabs } from '@cognite/cogs.js';

import { TabsHoverDropdown } from 'components/tabs-hover-dropdown/TabsHoverDropdown';
import navigation from 'constants/navigation';
import { useHorizontalScroll } from 'hooks/useHorizontalScroll';
import { setInspectSidebarWidth } from 'modules/wellInspect/actions';
import { useInspectSidebarWidth } from 'modules/wellInspect/selectors';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { useActiveWellsWellboresCount } from 'modules/wellSearch/selectors';

import { TAB_ITEMS } from './constants';
import {
  InspectContainer,
  InspectContent,
  LinkNode,
  LinksMenu,
  TabsContent,
  TabsScrollWrapper,
  TabsWrapper,
} from './elements';
import InspectRouter from './InspectRouter';
import { ScrollButtons } from './ScrollButtons';
import { SIDEBAR_SIZE } from './Sidebar/constants';
import { InspectSidebar } from './Sidebar/InspectSidebar';
import StandaloneHeader from './StandaloneHeader';

export const WellInspect: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const { data: config } = useWellConfig();
  const { wells } = useActiveWellsWellboresCount();
  const inspectSidebarWidth = useInspectSidebarWidth();

  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useHorizontalScroll();
  const [isVisible, setIsVisible] = useState(false);

  const handleBackToSearch = () => history.push(navigation.SEARCH_WELLS);

  React.useEffect(() => {
    /**
     * This will redirect the app to well search screen if there are no selected wellbores.
     * This Usable when user directly access the inspection screen
     */
    if (wells === 0) {
      handleBackToSearch();
    }
  }, [wells]);

  const items = useMemo(
    () => TAB_ITEMS.filter((item) => config?.[item.key]?.enabled),
    []
  );

  const selectedItem = useMemo(
    () => items.find((y) => y.path === location.pathname),
    [location.pathname]
  );

  const standalone = selectedItem?.standalone || false;

  const handleNavigation = (tabKey: string) => {
    const tabItem = items.find((item) => item.key === tabKey);
    if (tabItem) {
      history.push(tabItem.path);
    }
  };

  const handleSidebarToggle = () => {
    setIsOpen((state) => !state);
    // This is to rerender 'Other' links dropdown in correct position
    // Better solution would be extending cog.js to support hover events
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1000);
  };

  // Standard tabs
  const tabs = useMemo(
    () =>
      items
        .filter((item) => !item.standalone)
        .map((item) => <Tabs.TabPane key={item.key} tab={t(item.name)} />),
    [items]
  );

  const standaloneItems = items.filter((item) => item.standalone);

  // Other links (Multiple ppfgs, 3d etc)
  const links = useMemo(
    () => (
      <LinksMenu>
        {standaloneItems.map((item) => (
          <Menu.Item
            key={item.key}
            onClick={() => {
              handleNavigation(item.key);
            }}
          >
            <LinkNode>
              <span>{t(item.name)}</span>
              <Icon type="OpenExternal" size={16} />
            </LinkNode>
          </Menu.Item>
        ))}
      </LinksMenu>
    ),
    [standaloneItems]
  );

  const width = `calc(100% - ${
    isOpen ? inspectSidebarWidth : SIDEBAR_SIZE.closed
  }px)`;

  const handleOnResizeInspectSidebar = useCallback(
    (width: number) => dispatch(setInspectSidebarWidth(width)),
    []
  );

  return (
    <InspectContainer>
      <InspectSidebar
        hidden={standalone}
        isOpen={isOpen}
        width={inspectSidebarWidth}
        onToggle={handleSidebarToggle}
        onResize={handleOnResizeInspectSidebar}
      />

      <InspectContent standalone={standalone} fullWidth={!isOpen} width={width}>
        <ScrollButtons scrollRef={scrollRef}>
          <TabsWrapper>
            <TabsScrollWrapper ref={scrollRef}>
              <Tabs
                hidden={standalone}
                activeKey={selectedItem?.key}
                onChange={handleNavigation}
                data-testid="well-inspect-navigation-tabs"
              >
                {tabs}
              </Tabs>
              {!standalone && standaloneItems.length > 0 && (
                <TabsHoverDropdown content={links} onHoverChange={setIsVisible}>
                  <Button
                    type="ghost"
                    size="small"
                    id="link-tabs"
                    aria-label="Other"
                  >
                    <span>{t('Other')}</span>
                    {!isVisible && <Icon type="ChevronDownCompact" size={16} />}
                    {isVisible && <Icon type="ChevronUpCompact" size={16} />}
                  </Button>
                </TabsHoverDropdown>
              )}
            </TabsScrollWrapper>
            <StandaloneHeader
              title={selectedItem?.name || ''}
              hidden={!standalone}
            />
          </TabsWrapper>
        </ScrollButtons>
        <TabsContent>
          <InspectRouter />
        </TabsContent>
      </InspectContent>
    </InspectContainer>
  );
};

export default WellInspect;
