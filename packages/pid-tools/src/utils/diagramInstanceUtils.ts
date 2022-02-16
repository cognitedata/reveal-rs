import { EQUIPMENT_TAG_REGEX } from '../constants';
import { PidDocument } from '../pid/PidDocument';
import {
  DiagramConnection,
  DiagramInstance,
  DiagramInstanceWithPaths,
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
  DiagramEquipmentTagInstance,
} from '../types';

import { isFileConnection, isLineConnection, isEquipment } from './type';

export const getDiagramInstanceId = (
  diagramInstance: DiagramInstanceWithPaths
): DiagramInstanceId => {
  return getDiagramInstanceIdFromPathIds(diagramInstance.pathIds);
};

export const getDiagramInstanceIdFromPathIds = (
  pathIds: string[]
): DiagramInstanceId => {
  return pathIds.sort().join('-');
};

export function getDiagramInstanceByPathId<T extends DiagramInstanceWithPaths>(
  diagramInstances: T[],
  pathId: string
): T | null {
  const diagramInstance = diagramInstances.filter((diagramInstance) =>
    diagramInstance.pathIds.includes(pathId)
  );
  if (diagramInstance.length > 0) {
    return diagramInstance[0];
  }
  return null;
}

export const isDiagramInstanceInList = (
  diagramId: DiagramInstanceId,
  diagramInstances: DiagramInstanceWithPaths[]
) => {
  return (
    diagramInstances.find(
      (instance) => diagramId === getDiagramInstanceId(instance)
    ) !== undefined
  );
};

export const getInstanceByDiagramInstanceId = (
  diagramInstances: DiagramInstanceWithPaths[],
  diagramInstanceId: DiagramInstanceId
): DiagramInstanceWithPaths | undefined => {
  return diagramInstances.find(
    (diagramInstance) =>
      getDiagramInstanceId(diagramInstance) === diagramInstanceId
  );
};

export const isPathIdInInstance = (
  pathId: string,
  instanceId: DiagramInstanceId | null
) => {
  return instanceId !== null && instanceId.split('-').includes(pathId);
};

export const isConnectionUnidirectionalMatch = (
  connectionA: DiagramConnection,
  connectionB: DiagramConnection
) =>
  (connectionA.start === connectionB.start &&
    connectionA.end === connectionB.end) ||
  (connectionA.start === connectionB.end &&
    connectionA.end === connectionB.start);

export const connectionExists = (
  connections: DiagramConnection[],
  newConnection: DiagramConnection
) => {
  return connections.some((connection) =>
    isConnectionUnidirectionalMatch(connection, newConnection)
  );
};

export const hasOverlappingPathIds = (
  diagramInstance1: DiagramInstanceWithPaths,
  diagramInstance2: DiagramInstanceWithPaths
) => {
  return diagramInstance1.pathIds.some((e) =>
    diagramInstance2.pathIds.includes(e)
  );
};

export const getLeastComplexDiagramSymbol = (
  pidDocument: PidDocument,
  diagramInstance1: DiagramSymbolInstance,
  diagramInstance2: DiagramSymbolInstance
) => {
  // Most complicated in this sense, is the element with the most pathSegments.
  // Out idea is to use this when labeling circles, and circles with square,
  // to be able to determine that circle with square is the bigger/more complicated object.
  const count1 = pidDocument.getPathSegmentsToPaths(
    diagramInstance1.pathIds
  ).length;

  const count2 = pidDocument.getPathSegmentsToPaths(
    diagramInstance2.pathIds
  ).length;

  return count1 > count2 ? diagramInstance2 : diagramInstance1;
};

export const getNoneOverlappingSymbolInstances = (
  pidDocument: PidDocument,
  symbolInstances: DiagramSymbolInstance[],
  newSymbolInstances: DiagramSymbolInstance[]
): DiagramSymbolInstance[] => {
  const objectsToRemove: DiagramInstanceWithPaths[] = [];
  for (let i = 0; i < newSymbolInstances.length; i++) {
    const potentialInstance = newSymbolInstances[i];

    for (let j = 0; j < symbolInstances.length; j++) {
      const oldInstance = symbolInstances[j];

      const pathIdOverlap = hasOverlappingPathIds(
        oldInstance,
        potentialInstance
      );

      // eslint-disable-next-line no-continue
      if (!pathIdOverlap) continue;

      const objectToRemove = getLeastComplexDiagramSymbol(
        pidDocument,
        potentialInstance,
        oldInstance
      );
      objectsToRemove.push(objectToRemove);
    }
  }

  const prunedInstances = [...symbolInstances, ...newSymbolInstances].filter(
    (instance) => objectsToRemove.includes(instance) === false
  );

  return prunedInstances;
};

export const pruneSymbolOverlappingPathsFromLines = (
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[]
) => {
  const symbolIds = symbolInstances.flatMap((symbol) => symbol.pathIds);

  const prunedLines = [];
  const linesToDelete = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const nonSymbolPaths = line.pathIds.filter(
      (pathId) => symbolIds.includes(pathId) === false
    );

    if (nonSymbolPaths.length) {
      prunedLines.push({ ...line, pathIds: nonSymbolPaths });
    } else {
      linesToDelete.push(line);
    }
  }

  return { prunedLines, linesToDelete };
};

/* eslint-disable no-param-reassign */
export function addOrRemoveLabelToInstance(
  labelId: string,
  labelText: string,
  instance: DiagramInstanceWithPaths
): void {
  if (instance.labelIds.includes(labelId)) {
    instance.labelIds = instance.labelIds.filter((li) => li !== labelId);
  } else {
    instance.labelIds = [...instance.labelIds, labelId];
    if (isFileConnection(instance)) {
      const labelTextWithoutWhiteSpace = labelText.replace(/\s/g, '');
      const documentNumber = labelTextWithoutWhiteSpace.match(/MF_[0-9]{1,}/g);

      if (documentNumber) {
        instance.documentNumber = parseInt(documentNumber[0].substring(3), 10);
      }

      const toPositionRegex =
        labelTextWithoutWhiteSpace.match(/^[A-Z][0-9]{0,}$/);
      if (toPositionRegex) {
        [instance.toPosition] = toPositionRegex;
      }

      const unit = labelText.match(/G[0-9]{4}/);
      if (unit) {
        [instance.unit] = unit;
      }
    } else if (isEquipment(instance)) {
      if (EQUIPMENT_TAG_REGEX.test(labelText)) {
        instance.equipmentTag = labelText;
      }
    }
    if (isLineConnection(instance)) {
      const character = labelText.match(/'[A-Z]'/);
      if (character) {
        instance.letterIndex = character[0].slice(1, -1);
      }

      const isSameFile = labelText === 'SAME';
      if (isSameFile) {
        instance.pointsToFileName = 'SAME';
      }

      const fileName = labelText.match(EQUIPMENT_TAG_REGEX);
      if (fileName) {
        [instance.pointsToFileName] = fileName;
      }
    }
  }
}
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
export function addOrRemoveLabelToEquipmentTag(
  label: SVGTSpanElement,
  tag: DiagramEquipmentTagInstance
): void {
  const isTag = EQUIPMENT_TAG_REGEX.test(label.innerHTML);

  tag.equipmentTag = isTag ? label.innerHTML : tag.equipmentTag;

  if (tag.labelIds.includes(label.id)) {
    tag.labelIds = tag.labelIds.filter((li) => li !== label.id);
  } else {
    tag.labelIds = [...tag.labelIds, label.id];
  }
}
/* eslint-enable no-param-reassign */

/* eslint-disable no-param-reassign */
export function addOrRemoveLineNumberToInstance<Type extends DiagramInstance>(
  lineNumber: number,
  instance: Type
) {
  if (instance.lineNumbers.includes(lineNumber)) {
    instance.lineNumbers = instance.lineNumbers.filter(
      (ln) => ln !== lineNumber
    );
  } else {
    instance.lineNumbers = [...instance.lineNumbers, lineNumber];
  }
}
/* eslint-enable no-param-reassign */

export const createEquipmentTagInstance = (
  node: SVGTSpanElement
): DiagramEquipmentTagInstance => {
  return {
    id: node.id,
    equipmentTag: node.innerHTML,
    labelIds: [node.id],
    type: 'EquipmentTag',
    lineNumbers: [],
    inferedLineNumbers: [],
  };
};

export const getDiagramEquipmentTagInstanceByTagId = (
  id: string,
  equipmentTags: DiagramEquipmentTagInstance[]
) => {
  return equipmentTags.find((tag) => tag.id === id);
};

export const getDiagramEquipmentTagInstanceByLabelId = (
  labelId: string,
  equipmentTags: DiagramEquipmentTagInstance[]
) => {
  return equipmentTags.find((tag) => tag.labelIds.includes(labelId));
};
