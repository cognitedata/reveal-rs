import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { Loader } from '@cognite/cogs.js';
import {
  AuthWrapper,
  SubAppWrapper,
  getProject,
  getEnv,
} from '@cognite/cdf-utilities';

import { createBrowserHistory } from 'history';
import debounce from 'lodash/debounce';

import { LS_KEY_PREFIX, setItemInStorage } from 'hooks/useLocalStorage';
import store, { persistedState, loadLocalStorage } from 'store';
import { AppStateProvider } from 'context';
import { root } from 'routes/paths';

import { AntStyles, GlobalStyles } from 'styles';
import RootApp from 'pages/App';

const App = () => {
  const history = createBrowserHistory();
  const project = getProject();
  const env = getEnv();
  const LS_KEY = `${LS_KEY_PREFIX}${project}`;

  const updateLocalStorage = debounce(() => {
    const localStorageContent = persistedState(store.getState());
    setItemInStorage(LS_KEY, localStorageContent);
  }, 333);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  store.subscribe(updateLocalStorage);

  useEffect(() => {
    loadLocalStorage(LS_KEY, store);
  }, [LS_KEY]);

  useEffect(() => {
    if (cogsStyles?.use) cogsStyles.use();
    return () => {
      if (cogsStyles?.unuse) cogsStyles.unuse();
    };
  }, []);

  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <GlobalStyles>
      <AntStyles>
        <AuthWrapper
          loadingScreen={<Loader darkMode={false} />}
          login={() => loginAndAuthIfNeeded(project, env)}
        >
          <SDKProvider sdk={sdk}>
            <QueryClientProvider client={queryClient}>
              <AppStateProvider>
                <Provider store={store}>
                  <SubAppWrapper title="Interactive Engineering Diagrams">
                    <Router history={history}>
                      <Switch>
                        <Route path={`/:project/${root}`} component={RootApp} />
                      </Switch>
                    </Router>
                  </SubAppWrapper>
                </Provider>
              </AppStateProvider>
            </QueryClientProvider>
          </SDKProvider>
        </AuthWrapper>
      </AntStyles>
    </GlobalStyles>
  );
};

export default App;
