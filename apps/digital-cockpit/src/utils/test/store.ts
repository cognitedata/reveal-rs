import { StoreState } from 'store/types';
import { configureStore } from 'store';

export const createMockStore = (initState: StoreState) => {
  const {
    suitesTable,
    auth,
    modal,
    groups,
    userSpace,
    form,
    notification,
    config,
  } = initState || {};
  return configureStore({
    suitesTable,
    auth,
    modal,
    groups,
    userSpace,
    form,
    notification,
    config,
  });
};
