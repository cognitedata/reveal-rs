import { Units } from '../../../Core/Primitives/Units';
import { Util } from '../../../Core/Primitives/Util';
import { WellNode } from '../../../SubSurface/Wells/Nodes/WellNode';
import { BPData } from '../BPData';

import { WellCasingCreator } from './WellCasingCreator';
import { WellLogCreator } from './WellLogCreator';
import { WellNodeCreator } from './WellNodeCreator';
import { WellTrajectoryNodeCreator } from './WellTrajectoryNodeCreator';

export class WellNodesCreator {
  static create(bpData: BPData | null): WellNode[] | null {
    if (!bpData) return null;

    const { wellMap } = bpData;

    if (!wellMap || wellMap.size === 0) return null;

    const wellNodeMap = new Map<string, WellNode>();
    const wellNodes: WellNode[] = [];

    for (const wellData of wellMap.values()) {
      const wellNode = WellNodeCreator.create(wellData);
      if (!wellNode) continue;

      wellNodeMap.set(wellData.id, wellNode);
      wellNodes.push(wellNode);
    }
    if (!wellNodes.length) return null;

    const { trajectoryMap } = bpData;
    if (!trajectoryMap || !(trajectoryMap.size > 0)) return wellNodes;

    const { wellBoreToWellMap } = bpData;
    if (!wellBoreToWellMap || !(wellBoreToWellMap.size > 0)) return wellNodes;

    const { trajectoryDataMap } = bpData;
    if (!trajectoryDataMap || !(trajectoryDataMap.size > 0)) return wellNodes;

    const { wellBoreToNDSEventsMap } = bpData;
    const { wellBoreToNPTEventsMap } = bpData;
    const { wellBoreToLogsMap } = bpData;
    const { wellBoreToCasingDataMap } = bpData;

    for (const trajectory of trajectoryMap.values()) {
      const wellBoreId = trajectory.assetId;
      const wellBoreToWell = wellBoreToWellMap.get(wellBoreId);
      if (!wellBoreToWell) continue;

      const wellNode = wellNodeMap.get(wellBoreToWell.wellId);
      if (!wellNode) continue;

      const { metadata } = wellBoreToWell.data;
      wellNode.elevationType = metadata.elevation_type; // KB
      const elevationUnit = metadata.elevation_value_unit;
      let startMd = Util.getNumberWithUnit(
        metadata.elevation_value,
        elevationUnit
      );
      if (Number.isNaN(startMd)) startMd = 0;

      const unit = Units.isFeet(elevationUnit) ? Units.Feet : 1;
      const trajectoryRows = trajectoryDataMap.get(trajectory.id);
      const trajectoryNode = WellTrajectoryNodeCreator.create(
        bpData.trajectoryDataColumnIndexes,
        trajectoryRows,
        startMd,
        unit,
        elevationUnit
      );
      if (!trajectoryNode) continue;

      if (!Util.isEmpty(wellBoreToWell.data.name))
        trajectoryNode.name = wellBoreToWell.data.name;

      wellNode.addChild(trajectoryNode);

      if (wellBoreToNDSEventsMap) {
        const events = wellBoreToNDSEventsMap.get(wellBoreId);
        const logNode = WellLogCreator.createNdsRiskLogNode(events);
        if (logNode) {
          logNode.name = 'NDS Risk Event';
          trajectoryNode.addChild(logNode);
        }
      }
      if (wellBoreToNPTEventsMap) {
        const events = wellBoreToNPTEventsMap.get(wellBoreId);
        const logNode = WellLogCreator.createNptRiskLogNode(events);
        if (logNode) {
          logNode.name = 'NPT Events';
          trajectoryNode.addChild(logNode);
        }
      }
      if (wellBoreToCasingDataMap) {
        const casingData = wellBoreToCasingDataMap.get(wellBoreId);
        const logNode = WellCasingCreator.createCasingNodeNew(casingData, unit);
        if (logNode) {
          logNode.name = 'Casing';
          trajectoryNode.addChild(logNode);
        }
      }
      if (wellBoreToLogsMap)
        WellLogCreator.addLogNodes(
          trajectoryNode,
          wellBoreToLogsMap[wellBoreId],
          unit
        );
    }
    return wellNodes;
  }
}
