import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';

import App from '@simint-app/components/app/App';
import { store } from '@simint-app/store';
import GlobalStyles from '@simint-app/styles/GlobalStyles';

import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  SubAppWrapper,
  getEnv,
  getProject,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

const env = getEnv() ?? undefined;
const project = getProject();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000, // Pretty long
    },
  },
});

const cdfApp = () => (
  <FlagProvider
    apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
    appName="cdf-simint-ui"
    projectName={project}
  >
    <QueryClientProvider client={queryClient}>
      <GlobalStyles>
        <SubAppWrapper title="Cognite Simulator Integration">
          <AuthWrapper
            loadingScreen={<Loader />}
            login={async () => loginAndAuthIfNeeded(project, env)}
          >
            <SDKProvider sdk={sdk}>
              <ReduxProvider store={store}>
                <App />
              </ReduxProvider>
            </SDKProvider>
          </AuthWrapper>
        </SubAppWrapper>
      </GlobalStyles>
    </QueryClientProvider>
  </FlagProvider>
);

export default cdfApp;
