import React from 'react';
import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';
import { useFusionQuery } from './hooks/useFusionQuery';
import { ConventionsPage } from './pages/ConventionsPage';
import { EditTablePage } from './pages/pasteView/EditTablePage';

const Routes = () => {
  useFusionQuery();

  return (
    <ReactRoutes>
      <Route path="/" element={<Outlet />}>
        <Route index element={<ConventionsPage />} />
        <Route path="/edit/:id" element={<EditTablePage />} />
        <Route path="/conventions/:id" element={<ConventionsPage />} />
      </Route>
    </ReactRoutes>
  );
};

export default Routes;
