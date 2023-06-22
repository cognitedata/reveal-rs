import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import createRootReducer from '../reducer';

export function createStore(): any {
  const middleware = getDefaultMiddleware({
    serializableCheck: false,
    immutableCheck: false,
  });
  // const enhancers = [];
  const store = configureStore({
    reducer: createRootReducer(),
    middleware,
    devTools: false,
  });

  return store;
}
