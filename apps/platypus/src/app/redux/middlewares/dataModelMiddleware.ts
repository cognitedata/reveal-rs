import {
  DataModelVersion,
  DataModelVersionStatus,
  StorageProviderType,
} from '@platypus/platypus-core';
import { rootInjector, TOKENS } from '@platypus-app/di';
import { SchemaEditorMode } from '@platypus-app/modules/solution/data-model/types';
import { getLocalDraftKey } from '@platypus-app/utils/local-storage-utils';
import { Action, Dispatch, MiddlewareAPI } from '@reduxjs/toolkit';

import { actions } from '../reducers/global/dataModelReducer';

const getLocalStorageProvider = () =>
  rootInjector
    .get(TOKENS.storageProviderFactory)
    .getProvider(StorageProviderType.localStorage);

export const graphQlSchemaLocalStorageMiddleware =
  (store: MiddlewareAPI) => (next: Dispatch) => (action: Action) => {
    const prevState = store.getState();
    const result = next(action);
    const state = store.getState();
    const localStorageProvider = getLocalStorageProvider();

    if (
      !actions.switchDataModelVersion.match(action) &&
      prevState.dataModel.graphQlSchema !== state.dataModel.graphQlSchema &&
      state.dataModel.editorMode === SchemaEditorMode.Edit
    ) {
      const DRAFT_KEY = getLocalDraftKey(
        state.dataModel.selectedDataModelVersion.externalId,
        state.dataModel.selectedDataModelVersion.space
      );

      // get drafts from localStorage
      const localDrafts: DataModelVersion[] =
        localStorageProvider.getItem(DRAFT_KEY) || [];

      const newLocalDraft = {
        ...state.dataModel.selectedDataModelVersion,
        schema: state.dataModel.graphQlSchema,
        status: DataModelVersionStatus.DRAFT,
      };

      // set the new draft in localStorage.
      const index = localDrafts.findIndex(
        (schema) => schema.version === newLocalDraft.version
      );
      const appendedOrReplaced =
        index === -1
          ? [newLocalDraft, ...localDrafts]
          : [
              ...localDrafts.slice(0, index),
              newLocalDraft,
              ...localDrafts.slice(index + 1),
            ];
      localStorageProvider.setItem(DRAFT_KEY, appendedOrReplaced);

      store.dispatch(actions.setIsDirty(true));
    }

    return result;
  };
