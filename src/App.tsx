import React, { useEffect } from 'react';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { Provider } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ThemeProvider } from 'styled-components';

import { ClientSDKProvider } from '@cognite/gearbox/dist/components/ClientSDKProvider';
import GlobalStyle from 'styles/global-styles';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import sdk from 'sdk-singleton';
import { SubAppWrapper, AuthWrapper } from '@cognite/cdf-utilities';
// import Routes from './routes';
import RootApp from 'containers/App';
import AntStyles from 'components/AntStyles';
import { Loader } from 'components/Common';
import store from './store';
import theme from './styles/theme';
import { setupSentry } from './utils/sentry';
import rootStyles from './styles/index.css';

export default () => {
  const tenant = window.location.pathname.split('/')[1];
  const history = createBrowserHistory();

  const defaultQueryFn = async (key: string) => {
    const { data } = await sdk.get(
      `/api/playground/projects/${sdk.project}${key}`
    );
    return data;
  };

  const queryCache = new QueryCache({
    defaultConfig: {
      queries: {
        staleTime: 0, // 5 * 60 * 1000,
        cacheTime: 5 * 60 * 1000,
        queryFn: defaultQueryFn,
      },
    },
  });

  if (!tenant) {
    throw new Error('tenant missing');
  }

  useEffect(() => {
    cogsStyles.use();
    rootStyles.use();
    setupSentry();
    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
    };
  }, []);

  return (
    <AntStyles>
      <SubAppWrapper>
        <AuthWrapper
          subAppName="functions-ui"
          showLoader
          loadingScreen={<Loader />}
        >
          <ClientSDKProvider client={sdk}>
            <ThemeProvider theme={theme}>
              <Provider store={store}>
                <Router history={history}>
                  <ReactQueryCacheProvider queryCache={queryCache}>
                    <Switch>
                      <Route path="/:tenant" component={RootApp} />
                    </Switch>
                    <ReactQueryDevtools initialIsOpen={false} />
                  </ReactQueryCacheProvider>
                </Router>
              </Provider>
            </ThemeProvider>
            <GlobalStyle theme={theme} />
          </ClientSDKProvider>
        </AuthWrapper>
      </SubAppWrapper>
    </AntStyles>
  );
};
