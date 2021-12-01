import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import Home from 'pages/Home';
import ClassifierPage from 'pages/Classifier/Classifier';
import { createBrowserHistory } from 'history';
import { ToastContainer } from '@cognite/cogs.js';
import { ClassifierContext } from 'machines/classifier/contexts/ClassifierContext';
import { PermissionWrapper } from 'components/PermissionWrapper';
import LabelPage from './Labels/pages/Label/Label';
import { LabelsPage } from './Labels/Labels';

export const MainRouter = () => {
  const history = createBrowserHistory();

  return (
    <>
      <ToastContainer />

      <Router history={history}>
        <PermissionWrapper>
          <Switch>
            <Route path="/:project/documents/classifier/:classifierName">
              <ClassifierContext>
                <ClassifierPage />
              </ClassifierContext>
            </Route>
            <Route
              path="/:project/documents/labels/:externalId"
              component={LabelPage}
            />
            <Route path="/:project/documents/labels" component={LabelsPage} />
            <Route path="/:project/documents" component={Home} />
          </Switch>
        </PermissionWrapper>
      </Router>
    </>
  );
};
