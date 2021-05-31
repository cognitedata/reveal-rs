import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import UploadGCS from '@cognite/gcs-browser-upload';
import { FileUploadResponse, FileInfo, FileGeoLocation } from '@cognite/sdk';
import { Checkbox, Title } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { getHumanReadableFileSize } from 'src/modules/Common/Components/FileUploader/utils/getHumanReadableFileSize';
import {
  CogsFile,
  CogsFileInfo,
} from 'src/modules/Common/Components/FileUploader/FilePicker/types';
import exifr from 'exifr';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { getLink, workflowRoutes } from 'src/modules/Workflow/workflowRoutes';
import * as UPLODER_CONST from 'src/constants/UploderConstants';
import { sleep } from '../../FileUploader/utils';
import { getMIMEType } from '../../FileUploader/utils/FileUtils';
import { ModalFilePicker } from '../ModalFilePicker/ModalFilePicker';
import { STATUS } from '../enums';
import { getUploadControls } from './UploadControlButtons';

type GCSUploaderOptions = {
  file: Blob;
  uploadUrl: string;
  contentType: string;
  onChunkUpload: (info: any) => void;
};

const GCSUploader = ({
  file,
  uploadUrl,
  contentType,
  onChunkUpload = () => {},
}: GCSUploaderOptions) => {
  // This is what is recommended from google when uploading files.
  // https://github.com/QubitProducts/gcs-browser-upload
  /*
  From readme:
    > "At any time, the pause method can be called to delay uploading the remaining chunks.
      The current chunk will be finished.
      Unpause can then be used to continue uploading the remaining chunks."
   Meaning there is no way to cancel file upload that is lesser than chunkSize.
   Since we focus on image uploads for the vision app, chunks should be smaller.
   */
  const chunkMultiple = Math.max(
    5, // min chunk is 1.25 MB
    Math.ceil(file.size / 20 / 262144) // for big files divide into 20 segments and take multiplier
  );

  return new UploadGCS({
    id: 'cognite-data-fusion-upload',
    url: uploadUrl,
    contentType,
    file,
    chunkSize: 262144 * chunkMultiple,
    onChunkUpload,
  });
};

const { confirm } = Modal;

export type ModalFileUploaderProps = {
  initialUploadedFiles?: FileInfo[]; // feels a bit lame, but not sure about other way to keep uploaded items in the list between remounts
  assetIds?: number[];
  enableProcessAfter?: boolean;
  onUploadSuccess?: (file: FileInfo) => void;
  onFileListChange?: (fileList: CogsFileInfo[]) => void;
  onUploadFailure?: (error: string) => void;
  onCancel?: () => void;
  beforeUploadStart?: (fileList: CogsFileInfo[]) => void;
};

// vaguely described from console output
type GCSUploadItem = {
  opts: {
    chunkSize: number;
    storage: any;
    contentType: string;
    id: string;
    url: string;
    file: CogsFile;
  };
  meta: {
    id: string;
    fileSize: number;
    chunkSize: number;
    storage: any;
    addChecksum(index: any, checksum: string): unknown;
    getChecksum(index: any): string;
    getFileSize(): number;
    getMeta(): any;
    getResumeIndex(): any;
    isResumable(): boolean;
    reset(): unknown;
    setMeta(meta: any): unknown;
  };
  processor: {
    paused: boolean;
    file: CogsFile;
    chunkSize: number;
    unpauseHandlers: Array<any>;
  };
  lastResult: {
    data: {
      kind: string;
      id: string;
      selfLink: string;
      mediaLink: string;
      name: string;
      bucket: string;
      generation: string;
      metageneration: string;
      contentType: string;
      storageClass: string;
      size: string;
      md5Hash: string;
      crc32c: string;
      etag: string;
      timeCreated: string;
      updated: string;
      timeStorageClassUpdated: string;
    };
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request: any;
  };
  finished: boolean;
  cancel(): unknown;
  pause(): unknown;
  start(): Promise<unknown>;
  unpause(): unknown;
};

const currentUploads: { [key: string]: GCSUploadItem } = {};

const updateUploadStatus = (fileList: CogsFileInfo[]) => {
  if (fileList.find(({ status }) => status === 'uploading')) {
    return STATUS.STARTED;
  }
  if (fileList.find(({ status }) => status === 'idle')) {
    return STATUS.READY_TO_START;
  }
  if (fileList.length && fileList.every(({ status }) => status === 'done')) {
    return STATUS.DONE;
  }
  return STATUS.NO_FILES;
};

export const ModalFileUploader = ({
  initialUploadedFiles,
  assetIds,
  enableProcessAfter = false,
  onUploadSuccess = () => {},
  onUploadFailure = alert,
  onCancel = () => {},
  beforeUploadStart = () => {},
  onFileListChange = () => {},
  ...props
}: ModalFileUploaderProps) => {
  const sdk = useSDK();
  const { dataSetIds, extractExif } = useSelector(
    (state: RootState) => state.filesSlice
  );
  const [fileList, setFileList] = useState<Array<CogsFileInfo | CogsFile>>([]);
  const [uploadStatus, setUploadStatus] = useState(STATUS.NO_FILES);
  const [processAfter, setProcessAfter] = useState<boolean>(false);

  const history = useHistory();

  useEffect(() => {
    setFileList(
      (initialUploadedFiles || []).map((file) => {
        const f: CogsFileInfo = {
          name: file.name,
          percent: 100,
          type: file.mimeType || '',
          status: 'done',
          lastModified: Number(file.lastUpdatedTime),
          uid: String(file.id),
          relativePath: '',
          // we don't know the size after file is uploaded ¯\_(ツ)_/¯
          // that also means duplicates check won't work without size
          size: 0,
        };
        return f;
      })
    );
  }, [initialUploadedFiles]);

  useEffect(() => {
    onFileListChange(fileList);
    setUploadStatus(updateUploadStatus(fileList));
  }, [fileList]);

  const startUpload = async () => {
    message.info('Starting Upload...');

    try {
      beforeUploadStart(fileList);
    } catch (e) {
      onUploadFailure(`Unable to start upload.${e ? ` ${e.message}` : ''}`);
      return;
    }

    startOrResumeAllUploads();
  };

  const clearLocalUploadMetadata = (file: CogsFileInfo) => {
    const currentUpload = currentUploads[file.uid];
    if (currentUpload) {
      currentUpload.cancel();
      currentUpload.meta.reset();
      delete currentUploads[file.uid];
    }
  };

  const startOrResumeAllUploads = () => {
    if (fileList.length > UPLODER_CONST.MAX_FILE_COUNT) {
      onUploadFailure(
        `You exceeded the upload limit for number of files by ${
          fileList.length - UPLODER_CONST.MAX_FILE_COUNT
        }. Please remove some files for uploading.`
      );
      return;
    }
    if (UPLODER_CONST.MAX_TOTAL_SIZE_IN_BYTES) {
      const totalSize = fileList.reduce((totalSizeAcc, file) => {
        return totalSizeAcc + file.size;
      }, 0);
      if (totalSize > UPLODER_CONST.MAX_TOTAL_SIZE_IN_BYTES) {
        onUploadFailure(
          `You exceeded the upload limit by ${getHumanReadableFileSize(
            totalSize - UPLODER_CONST.MAX_TOTAL_SIZE_IN_BYTES
          )}. Please remove some files for uploading.`
        );
        return;
      }
    }

    setFileList((list) =>
      list.map((file) => {
        if (file.status === 'idle' || file.status === 'paused') {
          if (file.status === 'idle' && file instanceof File) {
            uploadFile(file);
          } else if (file.status === 'paused' && file instanceof File) {
            resumeFileUpload(file);
          }
          // eslint-disable-next-line no-param-reassign
          file.status = 'uploading';
        }

        return file;
      })
    );
  };

  const parseExif = async (file: File) => {
    const coordinates = await exifr.gps(file);
    const exifTags = await exifr.parse(file, [
      'Orientation',
      'FocalLength',
      'FocalLengthIn35mmFormat',
      'GPSVersionID',
      'GPSImgDirection',
      'GPSImgDirectionRef',
      'GPSDateStamp',
    ]);

    const geoLocation =
      coordinates &&
      ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            Number(coordinates.longitude.toFixed(6)),
            Number(coordinates.latitude.toFixed(6)),
          ],
        },
      } as FileGeoLocation);

    return { geoLocation, exifTags };
  };

  const uploadFile = async (file: CogsFile) => {
    // eslint-disable-next-line no-param-reassign
    file.status = 'uploading';

    // since we patch files we trigger list updates to have things rendered with new info
    setFileList((list) => [...list]);

    const mimeType = getMIMEType(file.name);
    try {
      const fileMetadata = (await sdk.files.upload({
        name: file.name,
        mimeType,
        source: 'CDF Vision',
        dataSetId: dataSetIds ? dataSetIds[0] : undefined,
        // I can see directory in api docs, but looks like SDK misses it
        // https://docs.cognite.com/api/v1/#operation/initFileUpload
        ...(assetIds && { assetIds }),
      })) as FileUploadResponse;

      // Add exif data async to the file if selected, after the file is uploaded
      if (extractExif) {
        parseExif(file).then((data) => {
          if (data.exifTags || data.geoLocation) {
            sdk.files.update([
              {
                id: fileMetadata.id,
                update: {
                  geoLocation: { set: data.geoLocation },
                  metadata: { set: data.exifTags },
                },
              },
            ]);
          }
        });
      }

      if (!fileMetadata || !fileMetadata.uploadUrl || !fileMetadata.id) {
        onUploadFailure('Unable to create file');
        // eslint-disable-next-line no-param-reassign
        file.status = 'error';
        return;
      }

      const { uploadUrl, id } = fileMetadata;

      currentUploads[file.uid] = await GCSUploader({
        file,
        uploadUrl,
        contentType: mimeType,
        onChunkUpload: (info: {
          uploadedBytes: number;
          totalBytes: number;
        }) => {
          // console.log(
          //   'file chunk response',
          //   file.name,
          //   `${(info.uploadedBytes / info.totalBytes) * 100}%`
          // );

          // eslint-disable-next-line no-param-reassign
          file.percent = (info.uploadedBytes / info.totalBytes) * 100;

          setFileList((list) => [...list]);
        },
      });

      await currentUploads[file.uid].start();

      // Files are not available through the files API immediately after upload. Wait up 10
      // seconds.
      let fileInfo: FileInfo = await sdk.files
        .retrieve([{ id: fileMetadata.id }])
        .then((r) => r[0]);

      let retries = 0;
      while (!fileInfo.uploaded && retries <= 10) {
        retries += 1;
        /* eslint-disable no-await-in-loop */
        await sleep(retries * 1500);
        fileInfo = await sdk.files.retrieve([{ id }]).then((r) => r[0]);
        /* eslint-enable no-await-in-loop */
      }
      onUploadSuccess(fileInfo || fileMetadata);
    } catch (e) {
      if (e.code === 401) {
        // eslint-disable-next-line no-alert
        alert('Authorization is expired. The page will be reloaded');
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      } else {
        console.error(e);
        message.error(`Unable to upload ${file.name} on server.`);
      }
    }

    // eslint-disable-next-line no-param-reassign
    file.status = 'done';
    setFileList([...fileList]);

    clearLocalUploadMetadata(file);
  };

  const resumeFileUpload = (file: CogsFile) => {
    if (currentUploads[file.uid]) {
      currentUploads[file.uid].unpause();
    }
  };

  const stopUpload = () => {
    confirm({
      title: 'Do you want to cancel the file upload?',
      content: 'If you cancel, the file upload will be cancelled!',
      onOk: () => {
        setFileList((list) =>
          list.map((file) => {
            if (file.status === 'uploading' || file.status === 'paused') {
              clearLocalUploadMetadata(file);
              // eslint-disable-next-line no-param-reassign
              file.status = 'idle';
              // eslint-disable-next-line no-param-reassign
              file.percent = 0;
            }
            return file;
          })
        );

        onCancel();
      },
    });
  };

  const removeFiles = () => {
    setFileList((list) => list.filter((el) => el.status === 'done'));
  };

  const removeFile = (file: CogsFileInfo) => {
    clearLocalUploadMetadata(file);
    setFileList((list) => list.filter((el) => el.uid !== file.uid));
  };

  const onCloseModal = () => {
    removeFiles();
    onCancel();
  };

  const onFinish = () => {
    onCloseModal();
    if (processAfter) history.push(getLink(workflowRoutes.process));
  };

  const [UploadButton, CancelButton, RemoveAllButton] = getUploadControls(
    uploadStatus,
    startUpload,
    stopUpload,
    removeFiles,
    onCloseModal,
    onFinish
  );
  return (
    <div>
      <Title level={3} as="p">
        Upload files
      </Title>
      <ModalFilePicker
        onRemove={removeFile}
        files={fileList}
        optionDisabled={fileList.some(({ status }) => status === 'uploading')}
        onChange={(files) => {
          setFileList(files);
        }}
        onError={(err) => message.error(err.message)}
        clearButton={RemoveAllButton}
        {...props}
      />
      <Footer>
        {enableProcessAfter && (
          <Checkbox
            name="example2"
            value={processAfter}
            onChange={(nextState: boolean) => {
              setProcessAfter(nextState);
            }}
          >
            Process files after uploading
          </Checkbox>
        )}
        {CancelButton}
        {UploadButton}
      </Footer>
    </div>
  );
};

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: flex-end;
  margin: 39px 0px 0px 0px;
`;
