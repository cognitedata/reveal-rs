import { ComponentStory } from '@storybook/react';
import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { ocrResults, response } from '../resources';
import { FilePreviewUFV } from './FilePreviewUFV';
// @ts-ignore
import pdfFileUrl from '../pnid.pdf';
// @ts-ignore
import longPdfFileUrl from '../multipageExample.pdf';
import testImageUrl from './test-image.png';

const pdfFile = {
  id: 111,
  externalId: 'PH-ME-P-0153-001.pdf',
  lastUpdatedTime: new Date(),
  uploaded: false,
  createdTime: new Date(),
  name: 'Random File',
  mimeType: 'application/pdf',
};

const longPDF = {
  id: 222,
  externalId: 'PH-ME-P-0153-002.pdf',
  lastUpdatedTime: new Date(),
  uploaded: false,
  createdTime: new Date(),
  name: 'Random File',
  mimeType: 'application/pdf',
};

const testImage = {
  id: 333,
  lastUpdatedTime: new Date(),
  uploaded: false,
  createdTime: new Date(),
  name: 'Factory workers',
  mimeType: 'image/png',
};

const pdfSdkMock = {
  post: async (query: string, { data }: any) => {
    if (query.includes('aggregate')) {
      return { data: { items: [{ count: 1 }] } };
    }
    if (query.includes('files')) {
      if (data?.items.length) {
        return {
          data: {
            items: [pdfFile, longPDF, testImage].filter(
              item => item.id === data.items[0].id
            ),
          },
        };
      } else {
        return [];
      }
    }
    if (query.includes('events')) {
      return { data: { items: response } };
    }
    if (query.includes('ocr')) {
      return { data: { items: [{ annotations: ocrResults }] } };
    }
    return { data: { items: [] } };
  },
  files: {
    retrieve: async (fileIds: { id: string }[]) => {
      return fileIds.map(({ id }) =>
        [pdfFile, longPDF, testImage].find(item => item.id === +id)
      );
    },
    getDownloadUrls: async (files: { id: number }[]) => {
      return files.map(({ id }) => {
        let fileUrl = testImageUrl;
        if (id === 111) {
          fileUrl = pdfFileUrl;
        } else if (id === 222) {
          fileUrl = longPdfFileUrl;
        }
        return { downloadUrl: fileUrl };
      });
    },
  },
} as unknown as CogniteClient;

export default {
  title: 'Files/FilePreviewUFV',
  component: FilePreviewUFV,
  parameters: {
    explorerConfig: { sdkMockOverride: pdfSdkMock },
  },
};

export const WithZoomControls: ComponentStory<typeof FilePreviewUFV> = args => (
  <FilePreviewUFV {...args} />
);
WithZoomControls.args = {
  fileId: pdfFile.id,
};

export const WithPagination: ComponentStory<typeof FilePreviewUFV> = args => (
  <FilePreviewUFV {...args} />
);
WithPagination.args = {
  fileId: longPDF.id,
};

export const Images: ComponentStory<typeof FilePreviewUFV> = args => (
  <FilePreviewUFV {...args} />
);
Images.args = {
  fileId: 333,
};
