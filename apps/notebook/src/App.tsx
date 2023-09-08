import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

import { translations } from './common/i18n';
import Home from './pages/Home';
import { AppsList } from './pages/StreamLit/AppsList';
import StreamLitApp from './pages/StreamLit/StreamLitApp';
import GlobalStyles from './styles/GlobalStyles';

import './utils/sentry';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000, // Pretty long
    },
  },
});
const env = getEnv();
const project = getProject();

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/:project/">
        <Route>
          <Route path="notebook" element={<Home />} />
          <Route path="streamlit-apps" element={<AppsList />} />
          <Route path="streamlit-apps/:appId" element={<StreamLitApp />} />
          {/** Old URL, remove later */}
          <Route path="notebook/streamlit" element={<AppsList />} />
          <Route path="notebook/streamlit/:appId" element={<StreamLitApp />} />
        </Route>
      </Route>
    )
  );
  return (
    <FlagProvider
      appName="cdf-ui-notebook"
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      projectName={project}
    >
      <I18nWrapper
        translations={translations}
        defaultNamespace="cdf-ui-demo-app"
      >
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <SubAppWrapper title="Fusion Demo App">
              <AuthWrapper
                loadingScreen={<Loader />}
                login={() => loginAndAuthIfNeeded(project, env)}
              >
                <SDKProvider sdk={sdk}>
                  <RouterProvider router={router} />
                </SDKProvider>
              </AuthWrapper>
            </SubAppWrapper>
          </GlobalStyles>
        </QueryClientProvider>
      </I18nWrapper>
    </FlagProvider>
  );
};

export default App;
