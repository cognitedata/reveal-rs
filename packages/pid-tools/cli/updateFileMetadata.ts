import fsPromises from 'fs/promises';

import uniq from 'lodash/uniq';

import {
  DIAGRAM_PARSER_PDF_EXTERNAL_ID,
  DIAGRAM_PARSER_SOURCE,
  DIAGRAM_PARSER_TYPE,
  getVersionedParsedDocumentExternalId,
  lineNumberMetadataKey,
  LINEWALK_VERSION_KEY,
} from '../src';

import { DOCUMENTS_DIR } from './constants';
import getClient from './utils/getClient';

const readJsonFromFile = async (filePath: string): Promise<any> => {
  const fileContent = await fsPromises.readFile(filePath, 'utf8');
  return JSON.parse(fileContent);
};

const updateFileMetadata = async ({
  outputVersion,
}: {
  outputVersion: string;
}) => {
  const client = await getClient();
  const fileNames = await fsPromises.readdir(DOCUMENTS_DIR);
  const filteredFileNames = fileNames.filter((fileName) =>
    fileName.endsWith('.json')
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const fileName of filteredFileNames) {
    // eslint-disable-next-line no-await-in-loop
    const document = await readJsonFromFile(`${DOCUMENTS_DIR}/${fileName}`);

    if (
      document.annotations === undefined ||
      document.annotations.length === 0
    ) {
      console.log('No annotations found in document, skipping: ', fileName);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (document.pdfExternalId === undefined) {
      console.log('No pdfExternalId found in document, skipping: ', fileName);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (document.externalId === undefined) {
      console.log('No externalId found in document, skipping: ', fileName);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (
      !Array.isArray(document.lineNumbers) ||
      document.lineNumbers.length === 0
    ) {
      console.log('No line numbers found in document, skipping: ', fileName);
      // eslint-disable-next-line no-continue
      continue;
    }

    const lineNumbers: string[] = uniq(document.lineNumbers);

    if (document.type === undefined) {
      console.log('No type found in document, skipping: ', fileName);
      // eslint-disable-next-line no-continue
      continue;
    }

    const lineNumbersMetadata: Record<string, string> = lineNumbers.reduce(
      (acc, lineNumber) => {
        acc[lineNumberMetadataKey(outputVersion, lineNumber)] = 'true';
        return acc;
      },
      {}
    );

    const update = {
      metadata: {
        add: {
          [DIAGRAM_PARSER_SOURCE]: 'true',
          [DIAGRAM_PARSER_TYPE]: document.type,
          [DIAGRAM_PARSER_PDF_EXTERNAL_ID]: document.pdfExternalId,
          [getVersionedParsedDocumentExternalId(outputVersion)]:
            document.externalId,
          [LINEWALK_VERSION_KEY]: outputVersion,
          ...lineNumbersMetadata,
        },
        remove: [],
      },
    };

    // eslint-disable-next-line no-await-in-loop
    await client.files.update([
      {
        externalId: document.externalId,
        update,
      },
      {
        externalId: document.pdfExternalId,
        update,
      },
    ]);

    console.log(
      `Updated files: ${document.externalId}, ${document.pdfExternalId} with lineNumbers: ${lineNumbers}`
    );
  }
};

export default updateFileMetadata;
