import { saveAs } from 'file-saver';
import {
  DiagramSymbol,
  DiagramSymbolInstance,
  DiagramLineInstance,
  DiagramConnection,
  PidDocument,
  getNoneOverlappingSymbolInstances,
  PathReplacement,
  PidDocumentWithDom,
  DiagramEquipmentTagInstance,
  DiagramEquipmentTagInstanceOutputFormat,
  GraphDocument,
  DocumentMetadata,
} from '@cognite/pid-tools';

import {
  getEquipmentTagOutputFormat,
  getDiagramLineInstancesOutputFormat,
  getDiagramSymbolInstancesOutputFormat,
} from './saveGraph';

export const saveSymbolsAsJson = (symbols: DiagramSymbol[]) => {
  const jsonData = {
    symbols,
  };
  const fileToSave = new Blob([JSON.stringify(jsonData, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'Legend.json');
};

const getGraphFormat = (
  pidDocument: PidDocumentWithDom,
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[],
  pathReplacements: PathReplacement[],
  documentMetadata: DocumentMetadata,
  lineNumbers: number[],
  equipmentTags: DiagramEquipmentTagInstance[]
): GraphDocument => {
  const linesOutputFormat = getDiagramLineInstancesOutputFormat(
    pidDocument,
    lines
  );
  const symbolInstancesOutputFormat = getDiagramSymbolInstancesOutputFormat(
    pidDocument,
    symbolInstances
  );
  const equipmentTagInstancesFormat = getEquipmentTagOutputFormat(
    pidDocument,
    equipmentTags
  );

  const labels = pidDocument.pidLabels.map((label) => {
    return label.toDiagramLabelOutputFormat();
  });

  return {
    documentMetadata,
    viewBox: pidDocument.viewBox,
    symbols,
    lines: linesOutputFormat,
    symbolInstances: symbolInstancesOutputFormat,
    connections,
    pathReplacements,
    lineNumbers,
    equipmentTags: equipmentTagInstancesFormat,
    labels,
  };
};

export const saveGraphAsJson = (
  pidDocument: PidDocumentWithDom,
  symbols: DiagramSymbol[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[],
  pathReplacements: PathReplacement[],
  documentMetadata: DocumentMetadata,
  lineNumbers: number[],
  equipmentTags: DiagramEquipmentTagInstance[]
) => {
  const graphJson = getGraphFormat(
    pidDocument,
    symbols,
    lines,
    symbolInstances,
    connections,
    pathReplacements,
    documentMetadata,
    lineNumbers,
    equipmentTags
  );

  const fileToSave = new Blob([JSON.stringify(graphJson, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'Graph.json');
};

export const isValidSymbolFileSchema = (
  jsonData: any,
  svg: SVGSVGElement
): jsonData is GraphDocument => {
  const missingIds: string[] = [];

  const trackMissingId = (id: string) => {
    if (id.includes('_')) return; // comes from PathReplacements

    if (svg.getElementById(id) === null) {
      missingIds.push(id);
    }
  };

  if ('lines' in jsonData) {
    (jsonData.lines as DiagramLineInstance[]).forEach(
      (e: DiagramLineInstance) =>
        e.pathIds.forEach((pathId: string) => {
          trackMissingId(pathId);
        })
    );
  }

  if ('symbolInstances' in jsonData) {
    (jsonData.symbolInstances as DiagramSymbolInstance[]).forEach(
      (e: DiagramSymbolInstance) =>
        e.pathIds.forEach((pathId: string) => {
          trackMissingId(pathId);
        })
    );
  }

  if ('connections' in jsonData) {
    (jsonData.connections as DiagramConnection[]).forEach(
      (connection: DiagramConnection) => {
        connection.end.split('-').forEach((pathId) => {
          trackMissingId(pathId);
        });
        connection.start.split('-').forEach((pathId) => {
          trackMissingId(pathId);
        });
      }
    );
  }

  if ('equipmentTags' in jsonData) {
    (
      jsonData.equipmentTags as DiagramEquipmentTagInstanceOutputFormat[]
    ).forEach((tag: DiagramEquipmentTagInstanceOutputFormat) => {
      tag.labels.forEach((label) => {
        trackMissingId(label.id);
      });
    });
  }
  if (missingIds.length !== 0) {
    // eslint-disable-next-line no-console
    console.log(
      `Incorrect JSON file. ID${
        missingIds.length === 0 ? '' : 's'
      } ${missingIds} was not found in SVG.`
    );
    return false;
  }
  return true;
};

export const loadSymbolsFromJson = (
  jsonData: GraphDocument,
  setSymbols: (diagramSymbols: DiagramSymbol[]) => void,
  symbols: DiagramSymbol[],
  pidDocument: PidDocument,
  setSymbolInstances: (diagramSymbolInstances: DiagramSymbolInstance[]) => void,
  symbolInstances: DiagramSymbolInstance[],
  setLines: (diagramLines: DiagramLineInstance[]) => void,
  lines: DiagramLineInstance[],
  setConnections: (diagramConnections: DiagramConnection[]) => void,
  connections: DiagramConnection[],
  pathReplacements: PathReplacement[],
  setPathReplacements: (args: PathReplacement[]) => void,
  lineNumbers: number[],
  setLineNumbers: (arg: number[]) => void,
  equipmentTags: DiagramEquipmentTagInstance[],
  setEquipmentTags: (tags: DiagramEquipmentTagInstance[]) => void
) => {
  if ('symbols' in jsonData) {
    const newSymbols = jsonData.symbols as DiagramSymbol[];
    setSymbols([...symbols, ...newSymbols]);

    if (!('symbolInstances' in jsonData)) {
      let allNewSymbolInstances: DiagramSymbolInstance[] = [];
      newSymbols.forEach((newSymbol) => {
        const newSymbolInstances = (
          pidDocument as PidDocument
        ).findAllInstancesOfSymbol(newSymbol);
        allNewSymbolInstances = getNoneOverlappingSymbolInstances(
          pidDocument,
          allNewSymbolInstances,
          newSymbolInstances
        );
      });
      setSymbolInstances([...symbolInstances, ...allNewSymbolInstances]);
    }
  }
  if ('lines' in jsonData) {
    setLines([...lines, ...jsonData.lines]);
  }
  if ('symbolInstances' in jsonData) {
    setSymbolInstances([...symbolInstances, ...jsonData.symbolInstances]);
  }
  if ('connections' in jsonData) {
    setConnections([...connections, ...jsonData.connections]);
  }
  if ('pathReplacements' in jsonData) {
    setPathReplacements([...pathReplacements, ...jsonData.pathReplacements]);
  }
  if ('lineNumbers' in jsonData) {
    setLineNumbers([...lineNumbers, ...jsonData.lineNumbers]);
  }
  if ('equipmentTags' in jsonData) {
    const newEquipmentTags = (
      jsonData.equipmentTags as DiagramEquipmentTagInstanceOutputFormat[]
    ).map((tag) =>
      tag.labels.reduce<DiagramEquipmentTagInstance>(
        (prev, curr) => ({
          ...prev,
          labelIds: [...prev.labelIds, curr.id],
        }),
        {
          id: tag.id,
          equipmentTag: tag.equipmentTag,
          labelIds: [],
          type: 'EquipmentTag',
          lineNumbers: tag.lineNumbers,
          inferedLineNumbers: tag.inferedLineNumbers,
        }
      )
    );
    setEquipmentTags([...equipmentTags, ...newEquipmentTags]);
  }
};
