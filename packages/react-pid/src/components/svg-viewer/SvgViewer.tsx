import {
  connectionExists,
  DiagramConnection,
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
  getDiagramInstanceId,
  SVG_ID,
  getDiagramInstanceByPathId,
  getInstanceByDiagramInstanceId,
  createEquipmentTagInstance,
  DiagramEquipmentTagInstance,
  getDiagramEquipmentTagInstanceByName,
  PathReplacement,
  applyPathReplacementInSvg,
  PidDocumentWithDom,
  getDiagramEquipmentTagInstanceByLabelId,
} from '@cognite/pid-tools';
import { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';
import { allSimplePaths } from 'graphology-simple-path';
import Graph from 'graphology';

import { deleteLineFromState } from '../../utils/symbolUtils';
import { COLORS } from '../../constants';
import { ToolType } from '../../types';
import { applyToLeafSVGElements } from '../../utils/svgDomUtils';

import {
  addOrRemoveLabelToEquipmentTag,
  addOrRemoveLabelToInstance,
  addOrRemoveLineNumberToInstance,
  applyStyleToNode,
  colorSymbol,
  isDiagramLine,
  isInAddSymbolSelection,
  isSymbolInstance,
  setStrokeWidth,
  visualizeConnections,
} from './utils';

interface SvgViewerProps {
  fileUrl: string;
  active: ToolType;
  symbolInstances: DiagramSymbolInstance[];
  setSymbolInstances: (arg: DiagramSymbolInstance[]) => void;
  lines: DiagramLineInstance[];
  setLines: (arg: DiagramLineInstance[]) => void;
  selection: SVGElement[];
  setSelection: (arg: SVGElement[]) => void;
  splitSelection: string | null;
  setSplitSelection: (args: string | null) => void;
  pathReplacements: PathReplacement[];
  setPathReplacements: (args: PathReplacement[]) => void;
  connectionSelection: DiagramInstanceId | null;
  setConnectionSelection: (arg: DiagramInstanceId | null) => void;
  connections: DiagramConnection[];
  setConnections: (arg: DiagramConnection[]) => void;
  labelSelection: DiagramInstanceId | null;
  setLabelSelection: (arg: DiagramInstanceId | null) => void;
  setPidDocument: (arg: PidDocumentWithDom) => void;
  getPidDocument: () => PidDocumentWithDom | undefined;
  activeLineNumber: string | null;
  equipmentTags: DiagramEquipmentTagInstance[];
  setEquipmentTags: (arg: DiagramEquipmentTagInstance[]) => void;
  activeTagName: string | undefined;
  setActiveTagName: (arg: string | undefined) => void;
}

export const SvgViewer: React.FC<SvgViewerProps> = ({
  fileUrl,
  active,
  symbolInstances,
  setSymbolInstances,
  lines,
  setLines,
  selection,
  setSelection,
  splitSelection,
  setSplitSelection,
  pathReplacements,
  setPathReplacements,
  connectionSelection,
  setConnectionSelection,
  connections,
  setConnections,
  setPidDocument,
  getPidDocument,
  labelSelection,
  setLabelSelection,
  activeLineNumber,
  equipmentTags,
  setEquipmentTags,
  activeTagName,
  setActiveTagName,
}) => {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [graphSelection, setGraphSelection] =
    useState<DiagramInstanceId | null>(null);
  const [graphPaths, setGraphPaths] = useState<DiagramInstanceId[][]>([]);

  /* eslint-disable no-param-reassign */
  const onMouseEnter = (node: SVGElement, mainSvg: SVGSVGElement) => {
    const boldStrokeWidth = (
      1.5 * parseInt(node.style.strokeWidth, 10)
    ).toString();
    if (active === 'connectInstances') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );
      if (symbolInstance === null) return;

      setStrokeWidth(symbolInstance, boldStrokeWidth, mainSvg);
    } else if (active === 'graphExplorer') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );

      if (symbolInstance === null) return;

      const diagramId = getDiagramInstanceId(symbolInstance);
      if (diagramId === null) return;
      const graphPathIndex = graphPaths.findIndex((pathElem) =>
        pathElem.includes(diagramId)
      );
      const graphPath = graphPaths[graphPathIndex];

      if (!graphPath) return;

      const pathToDraw = graphPath;
      for (let i = 0; i < pathToDraw.length; i++) {
        const diagramInstanceId = pathToDraw[i];
        colorSymbol(
          diagramInstanceId,
          COLORS.graphPath,
          [...symbolInstances, ...lines],
          mainSvg,
          {
            filter: `hue-rotate(${(graphPathIndex + 1) * 100}deg)`,
          }
        );
      }
    } else if (active === 'connectLabels' || active === 'setLineNumber') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );

      if (symbolInstance === null) return;
      setStrokeWidth(symbolInstance, boldStrokeWidth, mainSvg);
    }
    if (active === 'addEquipmentTag') {
      if (node instanceof SVGTSpanElement) {
        node.style.fontWeight = '600';
      }
    } else {
      node.style.strokeWidth = boldStrokeWidth;
    }
  };
  /* eslint-enable no-param-reassign */

  /* eslint-disable no-param-reassign */
  const onMouseLeave = (
    node: SVGElement,
    originalStrokeWidth: string,
    mainSvg: SVGSVGElement
  ) => {
    if (active === 'connectInstances') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );
      if (symbolInstance === null) return;

      setStrokeWidth(symbolInstance, originalStrokeWidth, mainSvg);
    } else if (active === 'graphExplorer') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );

      if (symbolInstance === null) return;

      const diagramId = getDiagramInstanceId(symbolInstance);
      if (diagramId === null) return;
      const graphPath = graphPaths.filter((pathElem) =>
        pathElem.includes(diagramId)
      );

      if (graphPath.length === 0) return;

      const pathToDraw = graphPath[0];
      for (let i = 0; i < pathToDraw.length; i++) {
        const diagramInstanceId = pathToDraw[i];
        colorSymbol(
          diagramInstanceId,
          COLORS.graphPath,
          [...symbolInstances, ...lines],
          mainSvg,
          {
            filter: 'hue-rotate(0)',
          }
        );
      }
    } else if (active === 'connectLabels' || active === 'setLineNumber') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );

      if (symbolInstance === null) return;
      setStrokeWidth(symbolInstance, originalStrokeWidth, mainSvg);
    }
    node.style.fontWeight = '';
    node.style.strokeWidth = originalStrokeWidth;
  };
  /* eslint-enable no-param-reassign */

  const onMouseClick = (node: SVGElement) => {
    const pidDocument = getPidDocument();
    if (pidDocument === undefined) return;

    if (active === 'addSymbol') {
      if (!(node instanceof SVGTSpanElement)) {
        const alreadySelected = isInAddSymbolSelection(node, selection);
        if (alreadySelected) {
          setSelection(selection.filter((e) => e.id !== node.id));
        } else {
          setSelection([...selection, node]);
        }
      }
    } else if (active === 'addLine') {
      if (isDiagramLine(node, lines)) {
        const line = getDiagramInstanceByPathId(lines, node.id);
        if (!line) {
          return;
        }
        deleteLineFromState(
          line as DiagramLineInstance,
          lines,
          connections,
          setConnections,
          setLines
        );
      } else if (!(node instanceof SVGTSpanElement)) {
        setLines([
          ...lines,
          {
            type: 'Line',
            pathIds: [node.id],
            labelIds: [],
            lineNumbers: [],
          } as DiagramLineInstance,
        ]);
      }
    } else if (active === 'splitLine') {
      if (node instanceof SVGTSpanElement) return;
      if (isSymbolInstance(node, symbolInstances) || isDiagramLine(node, lines))
        return;

      // Remove line if it was already selected
      if (splitSelection === node.id) {
        setSplitSelection(null);
        return;
      }
      if (splitSelection !== null) {
        const tJunctionPathReplacements = pidDocument
          .getPidPathById(splitSelection)
          ?.getTJunctionByIntersectionWith(
            pidDocument.getPidPathById(node.id)!
          );

        if (!tJunctionPathReplacements) {
          return;
        }
        setPathReplacements([
          ...pathReplacements,
          ...tJunctionPathReplacements,
        ]);
        setSplitSelection(null);
        return;
      }
      setSplitSelection(node.id);
    } else if (active === 'connectInstances') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );
      if (symbolInstance) {
        const instanceId = getDiagramInstanceId(symbolInstance);

        if (connectionSelection === null) {
          setConnectionSelection(instanceId);
        } else if (instanceId === connectionSelection) {
          setConnectionSelection(null);
        } else {
          const newConnection = {
            start: connectionSelection,
            end: instanceId,
            direction: 'unknown',
          } as DiagramConnection;
          if (connectionExists(connections, newConnection)) {
            return;
          }
          setConnections([...connections, newConnection]);
          setConnectionSelection(instanceId);
        }
      }
    } else if (active === 'connectLabels') {
      // selection or deselect symbol/line instance that will be used for adding labels
      if (!(node instanceof SVGTSpanElement)) {
        const diagramInstance = getDiagramInstanceByPathId(
          [...symbolInstances, ...lines],
          node.id
        );
        const diagramInstanceId = diagramInstance
          ? getDiagramInstanceId(diagramInstance)
          : node.id;

        if (diagramInstanceId === labelSelection) {
          setLabelSelection(null);
          return;
        }
        if (diagramInstance) {
          setLabelSelection(diagramInstanceId);
        }
      } else {
        // add or remove labels to symbol/line instance given `labelSelection`
        if (!labelSelection) {
          return;
        }
        const diagramInstance = getInstanceByDiagramInstanceId(
          [...symbolInstances, ...lines],
          labelSelection
        );
        if (!diagramInstance) {
          return;
        }
        if (diagramInstance.type === 'Line') {
          addOrRemoveLabelToInstance(
            node.id,
            diagramInstance as DiagramLineInstance,
            lines,
            (arg) => {
              setLines(arg as DiagramLineInstance[]);
            }
          );
        } else {
          addOrRemoveLabelToInstance(
            node.id,
            diagramInstance as DiagramSymbolInstance,
            symbolInstances,
            setSymbolInstances
          );
        }
      }
    } else if (active === 'graphExplorer') {
      if (graph === null) return;

      const symbolInstance = getDiagramInstanceByPathId(
        symbolInstances,
        node.id
      );
      if (symbolInstance) {
        const instanceId = getDiagramInstanceId(symbolInstance);
        if (!graph.hasNode(instanceId)) return;

        if (graphSelection === null) {
          setGraphSelection(instanceId);
          setGraphPaths([]);
          return;
        }

        if (instanceId === graphSelection) {
          setGraphSelection(null);
          return;
        }

        const paths = allSimplePaths(graph, graphSelection, instanceId);
        setGraphPaths(paths);
        setGraphSelection(null);
      }
    } else if (active === 'setLineNumber') {
      if (activeLineNumber === null) return;

      const diagramInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );
      if (diagramInstance === null) return;

      if (diagramInstance.type === 'Line') {
        addOrRemoveLineNumberToInstance(
          activeLineNumber,
          diagramInstance as DiagramLineInstance,
          lines,
          setLines
        );
      } else {
        addOrRemoveLineNumberToInstance(
          activeLineNumber,
          diagramInstance as DiagramSymbolInstance,
          symbolInstances,
          setSymbolInstances
        );
      }
    } else if (
      active === 'addEquipmentTag' &&
      node instanceof SVGTSpanElement
    ) {
      if (activeTagName) {
        const tag = getDiagramEquipmentTagInstanceByName(
          activeTagName,
          equipmentTags
        );
        if (tag === undefined) return;
        addOrRemoveLabelToEquipmentTag(node, tag);
        setActiveTagName(tag.name);
        setEquipmentTags(
          equipmentTags.filter((tag) => tag.labelIds.length > 0)
        );
      } else {
        const tag = getDiagramEquipmentTagInstanceByLabelId(
          node.id,
          equipmentTags
        );
        if (tag === undefined) {
          const newTag = createEquipmentTagInstance(node);
          setEquipmentTags([...equipmentTags, newTag]);
          setActiveTagName(newTag.name);
        } else {
          setActiveTagName(tag.name);
        }
      }
    }
  };

  /* eslint-disable no-param-reassign */
  const handleAfterInjection = (error: Error | null, svg?: SVGSVGElement) => {
    if (error !== null || svg === undefined) return;

    svg.id = SVG_ID;
    svg.style.width = '100%';
    svg.style.height = '100%';

    pathReplacements.forEach((pathReplacement) => {
      applyPathReplacementInSvg(svg as SVGSVGElement, pathReplacement);
    });

    const allSVGElements: SVGElement[] = [];
    applyToLeafSVGElements(svg, (node) => {
      allSVGElements.push(node);

      applyStyleToNode({
        node,
        selection,
        connectionSelection,
        labelSelection,
        splitSelection,
        symbolInstances,
        lines,
        connections,
        graphPaths,
        graphSelection,
        active,
        activeLineNumber,
        equipmentTags,
        activeTagName,
      });

      node.addEventListener('mouseenter', () => onMouseEnter(node, svg));

      const originalStrokeWidth = node.style.strokeWidth;
      node.addEventListener('mouseleave', () => {
        onMouseLeave(node, originalStrokeWidth, svg);
      });

      node.addEventListener('click', () => {
        onMouseClick(node);
      });
    });

    const pidDocument = PidDocumentWithDom.fromSVG(svg, allSVGElements);
    setPidDocument(pidDocument);

    if (pidDocument && active === 'connectInstances') {
      visualizeConnections(
        svg,
        pidDocument,
        connections,
        symbolInstances,
        lines
      );
    }
  };

  /* eslint-enable no-param-reassign */
  useEffect(() => {
    if (active !== 'graphExplorer') {
      return;
    }

    const graphInstance = new Graph();
    for (let i = 0; i < connections.length; i++) {
      graphInstance.mergeEdge(connections[i].start, connections[i].end);
      graphInstance.mergeEdge(connections[i].end, connections[i].start);
    }
    setGraph(graphInstance);
    setActiveTagName(undefined);
  }, [active]);

  return (
    <ReactSVG
      style={{ touchAction: 'none' }}
      renumerateIRIElements={false}
      src={fileUrl}
      afterInjection={handleAfterInjection}
    />
  );
};
