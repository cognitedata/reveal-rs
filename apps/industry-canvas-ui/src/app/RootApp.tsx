import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Loader } from '@data-exploration/components';
import {
  IndustryCanvasHomePage,
  IndustryCanvasPage,
  UserProfileProvider,
  SpaceProvider,
  IndustryCanvasProvider,
  TrackingContextProvider,
  createTrackUsage,
} from '@fusion/industry-canvas';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { useSDK } from '@cognite/sdk-provider';

import { useUserInformation } from '../hooks/useUserInformation';

import { ICProvider } from './ICProvider';

const trackUsage = createTrackUsage({
  app: 'IC',
});

const Spinner = () => <Loader />;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export default function App() {
  const sdk = useSDK();
  const { flow } = getFlow();
  const { data: userInfo } = useUserInformation();

  return (
    <Suspense fallback={<Spinner />}>
      <TrackingContextProvider trackUsage={trackUsage}>
        <ICProvider flow={flow} sdk={sdk} userInfo={userInfo}>
          <QueryClientProvider client={queryClient}>
            <SpaceProvider>
              <UserProfileProvider>
                <IndustryCanvasProvider>
                  <Routes>
                    <Route
                      path="/industrial-canvas"
                      element={<IndustryCanvasHomePage />}
                    />
                    <Route
                      path="/industrial-canvas/canvas"
                      element={<IndustryCanvasPage />}
                    />
                  </Routes>
                </IndustryCanvasProvider>
              </UserProfileProvider>
            </SpaceProvider>
          </QueryClientProvider>
        </ICProvider>
      </TrackingContextProvider>
    </Suspense>
  );
}
