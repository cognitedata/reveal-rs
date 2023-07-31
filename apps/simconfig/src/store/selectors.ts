import type { StoreState } from 'store/types';

export const selectIsAppInitialized = (state: StoreState) =>
  state.group.initialized;
