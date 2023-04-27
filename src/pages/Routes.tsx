import * as React from 'react';
import { Route, Routes as ReactRoutes } from 'react-router-dom';
import { Loader, toast } from '@cognite/cogs.js';
import PageLayout from 'components/Layout/PageLayout';
import { useFirebaseInit } from 'hooks/firebase';
import * as Sentry from '@sentry/react';
import ErrorToast from 'components/ErrorToast/ErrorToast';
import SecondaryTopBar from 'components/SecondaryTopBar/SecondaryTopBar';
import { getProject, getCluster } from '@cognite/cdf-utilities';
import { getFlow } from '@cognite/auth-utils';
import { useUserInfo } from 'hooks/useUserInfo';
import { identifyUserForMetrics } from 'services/metrics';
import { parseEnvFromCluster } from '@cognite/login-utils';
import TenantSelectorView from './TenantSelector/TenantSelector';
import UserProfile from './UserProfile/UserProfile';
import ChartListPage from './ChartListPage/ChartListPage';
import ChartViewPage from './ChartViewPage/ChartViewPage';
import FileViewPage from './FileViewPage/FileViewPage';

/**
 * Fusion and Legacy Charts have slightly different paths.
 * Fusion includes :subAppPath because it needs to be aware which subapp is active.
 * Legacy Charts is only Charts so it does not have this param.
 */
const getPath = (basePath: string = '') => {
  const newPath = `/:project/:subAppPath/${basePath}`;
  return newPath;
};

type PropsRouteWithFirebase = {
  element: () => JSX.Element;
  enableSecondaryNavBar?: boolean;
};
const RouteWithFirebase = ({
  element,
  enableSecondaryNavBar,
}: PropsRouteWithFirebase): JSX.Element => {
  const { isFetched: firebaseDone, isError: isFirebaseError } =
    useFirebaseInit(true);
  const project = getProject();
  const cluster = getCluster();
  const env = parseEnvFromCluster(cluster);
  const { options } = getFlow(project, env);
  const { data: user } = useUserInfo();
  const Component = element;

  React.useEffect(() => {
    // options.directory tells if it is AAD tenant
    identifyUserForMetrics(user, project, cluster, options?.directory);
  }, [project, cluster, user]);

  if (!firebaseDone) {
    return <Loader />;
  }

  if (isFirebaseError) {
    toast.error(
      <ErrorToast
        title="Failed to load Firebase"
        text="Please reload the page"
      />,
      {
        autoClose: false,
        closeOnClick: false,
      }
    );
    return <></>;
  }
  return (
    <PageLayout className="PageLayout">
      {enableSecondaryNavBar && <SecondaryTopBar />}
      <main>
        <Component />
      </main>
    </PageLayout>
  );
};

const RouteWithSentry = Sentry.withSentryReactRouterV6Routing(Route);

const Routes = () => {
  return (
    <ReactRoutes>
      <RouteWithSentry path="/" element={<TenantSelectorView />} />
      <RouteWithSentry
        path={getPath()}
        element={<RouteWithFirebase element={ChartListPage} />}
      />
      <RouteWithSentry
        path={getPath('user')}
        element={<RouteWithFirebase element={UserProfile} />}
      />
      <RouteWithSentry
        path={getPath(':chartId')}
        element={
          <RouteWithFirebase element={ChartViewPage} enableSecondaryNavBar />
        }
      />
      <RouteWithSentry
        path={getPath(':chartId/files/:assetId')}
        element={<RouteWithFirebase element={FileViewPage} />}
      />
    </ReactRoutes>
  );
};

export default Routes;
