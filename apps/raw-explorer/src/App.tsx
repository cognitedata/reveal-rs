import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { StyleSheetManager } from 'styled-components';

import { translations } from '@raw-explorer/common/i18n';
import RawExplorer from '@raw-explorer/containers/RawExplorer';
import { RawExplorerProvider } from '@raw-explorer/contexts';
import { AntStyles } from '@raw-explorer/styles/AntStyles';
import GlobalStyles from '@raw-explorer/styles/GlobalStyles';
import { setupMixpanel } from '@raw-explorer/utils/config';
import sdk from '@raw-explorer/utils/sdkSingleton';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

setupMixpanel();

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000,
      },
    },
  });

  // const appName = 'cdf-raw-explorer';
  const projectName = getProject();
  const env = getEnv();

  return (
    <I18nWrapper
      // flagProviderProps={{
      //   apiToken: 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE',
      //   appName,
      //   projectName,
      // }}
      translations={translations}
      defaultNamespace="raw-explorer"
    >
      <StyleSheetManager
        disableVendorPrefixes={process.env.NODE_ENV === 'development'}
      >
        <SDKProvider sdk={sdk}>
          <QueryClientProvider client={queryClient}>
            <GlobalStyles>
              <AntStyles>
                <SubAppWrapper title="RAW Explorer">
                  <AuthWrapper
                    loadingScreen={<Loader />}
                    login={() => loginAndAuthIfNeeded(projectName, env)}
                  >
                    <Router
                      basename={`${projectName}/raw`}
                      children={
                        <RawExplorerProvider>
                          <RawExplorer />
                        </RawExplorerProvider>
                      }
                    />
                  </AuthWrapper>
                </SubAppWrapper>
              </AntStyles>
            </GlobalStyles>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </SDKProvider>
      </StyleSheetManager>
    </I18nWrapper>
  );
};

export default App;
