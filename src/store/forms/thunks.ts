import { GCSUploader, getExternalFileInfo } from 'utils/files';
import {
  CogniteExternalId,
  ExternalFileInfo,
  FileInfo,
  FileUploadResponse,
} from '@cognite/sdk';
import { RootDispatcher } from 'store/types';
import { ApiClient, CdfClient } from 'utils';

import { insertSuite } from 'store/suites/thunks';
import { Board, Suite } from 'store/suites/types';
import { setHttpError } from 'store/notification/thunks';
import * as Sentry from '@sentry/browser';
import * as actions from './actions';
import { BoardState } from './types';

export function setBoardState(client: CdfClient, board: BoardState) {
  return async (dispatch: RootDispatcher) => {
    const { imageFileId } = board as Board;
    if (imageFileId) {
      dispatch(retrieveFileInfo(client, imageFileId));
    } else {
      dispatch(actions.clearFile());
    }
    dispatch(actions.setBoard(board));
  };
}

export function saveForm(
  client: CdfClient,
  apiClient: ApiClient,
  suite: Suite,
  filesUploadQueue: Map<string, File>,
  filesDeleteQueue: CogniteExternalId[]
) {
  return async (dispatch: RootDispatcher) => {
    dispatch(actions.formSaving());
    if (filesUploadQueue.size) {
      await dispatch(uploadFiles(client, filesUploadQueue));
    }
    if (filesDeleteQueue?.length) {
      await dispatch(deleteFiles(client, filesDeleteQueue));
    }
    await dispatch(insertSuite(client, apiClient, suite));
    dispatch(actions.formSaved());
  };
}

export function uploadFiles(
  client: CdfClient,
  filesUploadQueue: Map<string, File>
) {
  return async (dispatch: RootDispatcher) => {
    dispatch(actions.filesUpload());
    // eslint-disable-next-line no-restricted-syntax
    for await (const [boardKey, file] of filesUploadQueue.entries()) {
      const fileInfo = getExternalFileInfo(file as File, boardKey);
      const { externalId } = fileInfo;
      try {
        await uploadFile(client, fileInfo, file);
        dispatch(
          actions.fileUploaded({
            boardKey,
            fileExternalId: externalId as string,
          })
        );
      } catch (e) {
        dispatch(actions.fileUploadError({ boardKey, error: e?.message }));
        dispatch(setHttpError(`Failed to upload file ${externalId}`, e));
        Sentry.captureException(e);
      }
    }
    dispatch(actions.filesUploaded());
  };
}

async function uploadFile(
  client: CdfClient,
  fileInfo: ExternalFileInfo,
  fileToUpload: File
) {
  const fileMetadata = (await client.uploadFile(
    fileInfo
  )) as FileUploadResponse;
  const { uploadUrl } = fileMetadata;
  if (!uploadUrl) {
    throw new Error('Unable to create file. Failed to get Upload URL.');
  }
  const currentUpload = await GCSUploader(fileToUpload, uploadUrl);
  return currentUpload.start();
}

export function deleteFiles(
  client: CdfClient,
  fileExternalIds: CogniteExternalId[]
) {
  return async (dispatch: RootDispatcher) => {
    try {
      await client.deleteFiles(fileExternalIds);
      dispatch(actions.filesDeleted());
    } catch (e) {
      Sentry.captureException(e);
      dispatch(
        setHttpError(
          `Failed to image preview(s): ${fileExternalIds.join(', ')}`,
          e
        )
      );
    }
  };
}

export function retrieveFileInfo(
  client: CdfClient,
  fileExternalId: CogniteExternalId
) {
  return async (dispatch: RootDispatcher) => {
    dispatch(actions.retrieveFile());
    try {
      const fileInfo = (
        await client.retrieveFilesMetadata([fileExternalId])
      )[0] as FileInfo;
      dispatch(actions.retrievedFile(fileInfo));
    } catch (e) {
      dispatch(actions.fileRetrieveError(e));
      dispatch(
        setHttpError(`Failed to fetch file name for ${fileExternalId}`, e)
      );
      Sentry.captureException(e);
    }
  };
}
