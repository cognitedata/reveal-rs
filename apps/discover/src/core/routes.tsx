import * as React from 'react';
import {
  Route,
  RouteProps,
  Redirect,
  BrowserRouter,
} from 'react-router-dom-v5';

import { Location } from 'history';

import { LoadingOverlay } from 'components/Loading';

import { showErrorMessage } from '../components/Toast';

import { INSUFFICIENT_ACCESS_RIGHTS_MESSAGE } from './constants';

const PageLayout: React.FC<React.PropsWithChildren<RouteProps>> = ({
  children,
}) => <>{children}</>;

export const PageRoute = ({ ...rest }: RouteProps) => {
  return (
    <PageLayout location={rest.location as Location}>
      <Route {...rest} />
    </PageLayout>
  );
};

export type ProtectedRouteProps = {
  isAuthenticated: boolean;
  returnPath: string;
} & RouteProps;

export const ProtectedRoute = ({
  isAuthenticated,
  returnPath,
  ...routeProps
}: ProtectedRouteProps) => {
  if (isAuthenticated) {
    return <Route {...routeProps} />;
  }
  showErrorMessage(INSUFFICIENT_ACCESS_RIGHTS_MESSAGE, {
    delay: 1500,
  });

  return <Redirect to={returnPath} />;
};

const AsyncContent = React.lazy(
  () => import(/* webpackChunkName: "authorized" */ 'pages/authorized')
);

const Routes: React.FC<{ project: string }> = ({ project }) => {
  return (
    <BrowserRouter basename={project}>
      <React.Suspense fallback={<LoadingOverlay text="Loading Discover..." />}>
        <PageRoute path="/" component={AsyncContent} />
      </React.Suspense>
    </BrowserRouter>
  );
};

export default Routes;
