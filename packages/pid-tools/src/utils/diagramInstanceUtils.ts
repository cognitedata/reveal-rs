import { PidDocument } from '../pid/PidDocument';
import {
  DiagramConnection,
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
} from '../types';

export const getDiagramInstanceId = (
  symbolInstance: DiagramSymbolInstance
): DiagramInstanceId => {
  return getDiagramInstanceIdFromPathIds(symbolInstance.pathIds);
};

export const getDiagramInstanceIdFromPathIds = (
  pathIds: string[]
): DiagramInstanceId => {
  return pathIds.sort().join('-');
};

export const getDiagramInstanceByPathId = (
  symbolInstances: DiagramSymbolInstance[],
  pathId: string
): DiagramSymbolInstance | null => {
  const symbolInstance = symbolInstances.filter((symbolInstance) =>
    symbolInstance.pathIds.includes(pathId)
  );
  if (symbolInstance.length > 0) {
    return symbolInstance[0];
  }
  return null;
};

export const isDiagramInstanceInList = (
  diagramId: DiagramInstanceId,
  symbolInstances: DiagramSymbolInstance[]
) => {
  return (
    symbolInstances.find(
      (instance) => diagramId === getDiagramInstanceId(instance)
    ) !== undefined
  );
};

export const getInstanceByDiagramInstanceId = (
  symbolInstances: DiagramSymbolInstance[],
  diagramInstanceId: DiagramInstanceId
): DiagramSymbolInstance | undefined => {
  return symbolInstances.find(
    (symbolInstance) =>
      getDiagramInstanceId(symbolInstance) === diagramInstanceId
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
  diagramSymbolInstance1: DiagramSymbolInstance,
  DiagramSymbolInstance2: DiagramSymbolInstance
) => {
  return diagramSymbolInstance1.pathIds.some((e) =>
    DiagramSymbolInstance2.pathIds.includes(e)
  );
};

const getPathSegmentLengthInSymbolInstance = (
  pidDocument: PidDocument,
  diagramSymbolInstance1: DiagramSymbolInstance
) => {
  let count = 0;
  for (let i = 0; i < diagramSymbolInstance1.pathIds.length; i++) {
    const pathId = diagramSymbolInstance1.pathIds[i];
    const segmentList = pidDocument.getPidPathById(pathId)?.segmentList;
    if (segmentList !== undefined) {
      count += segmentList.length;
    }
  }
  return count;
};

export const getLeastComplexDiagramSymbol = (
  pidDocument: PidDocument,
  diagramSymbolInstance1: DiagramSymbolInstance,
  diagramSymbolInstance2: DiagramSymbolInstance
) => {
  // Most complicated in this sense, is the element with the most pathSegments.
  // Out idea is to use this when labeling circles, and circles with square,
  // to be able to determine that circle with square is the bigger/more complicated object.

  const count1 = getPathSegmentLengthInSymbolInstance(
    pidDocument,
    diagramSymbolInstance1
  );

  const count2 = getPathSegmentLengthInSymbolInstance(
    pidDocument,
    diagramSymbolInstance2
  );

  return count1 > count2 ? diagramSymbolInstance2 : diagramSymbolInstance1;
};

export const getNoneOverlappingSymbolInstances = (
  pidDocument: PidDocument,
  symbolInstances: DiagramSymbolInstance[],
  newSymbolInstances: DiagramSymbolInstance[]
) => {
  const objectsToRemove: DiagramSymbolInstance[] = [];
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

  const prunedInstances: DiagramSymbolInstance[] = [
    ...symbolInstances,
    ...newSymbolInstances,
  ].filter((instance) => objectsToRemove.includes(instance) === false);

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
