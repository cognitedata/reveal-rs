import {
  DiagramSymbolInstanceOutputFormat,
  DiagramLabelOutputFormat,
  DiagramLineInstanceOutputFormat,
  DiagramTagOutputFormat,
} from '../types';
import { SymbolConnection } from '../graphMatching/types';
import getFileNameWithoutExtension from '../utils/getFileNameWithoutExtension';

import {
  Annotation,
  SymbolAnnotation,
  TextAnnotation,
  DocumentLink,
} from './types';
import { symbolTypeMap } from './constants';

export const diagramInstanceToAnnotation = (
  instance: DiagramSymbolInstanceOutputFormat | DiagramLineInstanceOutputFormat
): SymbolAnnotation => ({
  id: instance.id,
  type: symbolTypeMap[instance.type],
  svgPaths: instance.svgRepresentation.svgPaths,
  boundingBox: instance.svgRepresentation.boundingBox,
  nearestAssetExternalIds: [],
  labelIds: instance.labelIds,
  lineNumbers: [
    ...(instance.lineNumbers ?? []),
    ...(instance.inferedLineNumbers ?? []),
  ],
});

export const symbolTagToAnnotation = (
  tag: DiagramTagOutputFormat
): SymbolAnnotation => ({
  id: tag.id,
  type: symbolTypeMap[tag.type],
  svgPaths: [],
  boundingBox: tag.svgRepresentation.boundingBox,
  nearestAssetExternalIds: [],
  labelIds: tag.labels.map((label) => label.id),
  lineNumbers: [...tag.lineNumbers, ...tag.inferedLineNumbers],
});

export const labelToAnnotation = (
  label: DiagramLabelOutputFormat
): TextAnnotation => ({
  id: label.id,
  type: 'text',
  text: label.text,
  svgPaths: [],
  boundingBox: label.boundingBox,
  nearestAssetExternalIds: [],
  lineNumbers: [],
});

export const getExtId = (name: string) => {
  const fileNameWithoutExtension = getFileNameWithoutExtension(name);
  return `PARSED_DIAGRAM_${fileNameWithoutExtension}.json`;
};

export const mergeUnique = <T>(current: T[], additions: T[]) => {
  return additions.reduce((combined, newValue) => {
    if (!combined.includes(newValue)) {
      combined.push(newValue);
    }
    return combined;
  }, current);
};

export const inferIsoLineNumberToAnnotations = (
  lineNumber: string,
  annotations: Annotation[]
) => {
  annotations.forEach((annotation) => {
    // eslint-disable-next-line no-param-reassign
    annotation.lineNumbers = [...annotation.lineNumbers, lineNumber];
  });
};

export const connectionsToLinks = (
  connections: SymbolConnection[],
  pdfExternalId: string
) => {
  return connections.reduce((links, connection) => {
    if (
      connection.from.fileName === pdfExternalId ||
      connection.to.fileName === pdfExternalId
    ) {
      links.push({
        from: {
          documentId: getExtId(connection.from.fileName),
          annotationId: connection.from.instanceId,
        },
        to: {
          documentId: getExtId(connection.to.fileName),
          annotationId: connection.to.instanceId,
        },
      });
    }
    return links;
  }, <DocumentLink[]>[]);
};
