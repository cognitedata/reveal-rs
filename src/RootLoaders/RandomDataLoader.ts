import { Range1 } from "../Core/Geometry/Range1";
import { Range3 } from "../Core/Geometry/Range3";
import { Vector3 } from "../Core/Geometry/Vector3";

import { RootNode } from "../Nodes/TreeNodes/RootNode";

import { WellTrajectoryNode } from "../Nodes/Wells/Wells/WellTrajectoryNode";
import { WellNode } from "../Nodes/Wells/Wells/WellNode";
import { WellTrajectory } from "../Nodes/Wells/Logs/WellTrajectory";

import { PointLogNode } from "../Nodes/Wells/Wells/PointLogNode";
import { FloatLogNode } from "../Nodes/Wells/Wells/FloatLogNode";
import { DiscreteLogNode } from "../Nodes/Wells/Wells/DiscreteLogNode";

import { PointLog } from "../Nodes/Wells/Logs/PointLog";
import { FloatLog } from "../Nodes/Wells/Logs/FloatLog";
import { DiscreteLog } from "../Nodes/Wells/Logs/DiscreteLog";
import { CasingLogNode } from "@/Nodes/Wells/Wells/CasingLogNode";
import { Random } from "@/Core/Primitives/Random";
import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { BaseRenderTargetNode } from "@/Core/Nodes/BaseRenderTargetNode";
import { BaseRootLoader } from "@/RootLoaders/BaseRootLoader";

export class RandomDataLoader extends BaseRootLoader {

  //==================================================
  // OVERRIDES of BaseRootLoader
  //==================================================

  public /*override*/ load(root: RootNode): void {
    const wellTree = root.wells;

    // Add some random wells
    for (let i = 0; i < 10; i++) {
      const well = new WellNode();
      wellTree.addChild(well);

      well.wellHead = Vector3.getRandom(Range3.newTest);
      well.wellHead.z = 0;
      well.name = `well ${i + 1}`;

      // Add some random trajectories to the well
      for (let j = 0; j < 5; j++) {
        const wellTrajectory = new WellTrajectoryNode();
        wellTrajectory.name = `Traj ${i + 1}`;

        wellTrajectory.data = WellTrajectory.createByRandom(well.wellHead);
        well.addChild(wellTrajectory);

        // Add some random float logs to the trajectory
        let n = 1//Random.getInt2(0, 1);
        n = 1;
        for (let k = 0; k < n; k++) {
          const mdRange = wellTrajectory.data.mdRange.clone();
          mdRange.expandByFraction(-0.05);
          const logNode = new CasingLogNode();
          logNode.data = FloatLog.createCasingByRandom(mdRange, 7);
          wellTrajectory.addChild(logNode);
        }
        // Add some random float logs to the trajectory
        n = Random.getInt2(2, 5);
        for (let k = 0; k < n; k++) {
          const mdRange = wellTrajectory.data.mdRange.clone();
          mdRange.min = (mdRange.center + mdRange.min) / 2;
          mdRange.expandByFraction(Random.getFloat2(-0.15, 0));

          const logNode = new FloatLogNode();
          const valueRange = new Range1(0, 3.14);
          logNode.data = FloatLog.createByRandom(mdRange, valueRange);
          wellTrajectory.addChild(logNode);
        }
        // Add some random discrete logs to the trajectory
        n = 1;//Random.getInt2(0, 1);
        for (let k = 0; k < n; k++) {
          const mdRange = wellTrajectory.data.mdRange.clone();
          mdRange.min = (mdRange.center + mdRange.min) / 2;
          mdRange.expandByFraction(Random.getFloat2(-0.25, 0));

          const logNode = new DiscreteLogNode();
          const valueRange = new Range1(0, 4);
          logNode.data = DiscreteLog.createByRandom(mdRange, valueRange);
          wellTrajectory.addChild(logNode);
        }
        // Add some random point logs to the trajectory

        n = Random.getInt2(1, 2);

        for (let k = 0; k < n; k++) {
          const mdRange = wellTrajectory.data.mdRange.clone();
          mdRange.min = (mdRange.center + mdRange.min) / 2;
          mdRange.expandByFraction(Random.getFloat2(-0.15, 0));

          const logNode = new PointLogNode();
          logNode.data = PointLog.createByRandom(mdRange, 10);
          wellTrajectory.addChild(logNode);
        }
      }
    }
  }

  public /*override*/  updatedVisible(root: RootNode): void {
    // Set all wells ands logs visible
    for (const well of root.getDescendantsByType(WellNode)) {
      for (const wellTrajectory of well.getDescendantsByType(WellTrajectoryNode)) {
        wellTrajectory.setVisibleInteractive(true);
        for (const node of wellTrajectory.getDescendantsByType(BaseLogNode))
          node.setVisibleInteractive(true);
        break;
      }
    }
  }

  public /*override*/  startAnimate(root: RootNode) {
    setInterval(() => RandomDataLoader.animate(root), 100);
  }

  //==================================================
  // STATIC METHODS
  //==================================================

  private static animate(root: RootNode) {

    return;
    const target = root.activeTarget as BaseRenderTargetNode;
    if (!target)
      return;

    let n = 0;
    for (const node of root.wells.getDescendantsByType(WellTrajectoryNode)) {

      if (node.isVisible())
        continue;

      n++;
      if (Random.isTrue(0.025))
        node.setVisibleInteractive(true);
    }
    if (n > 0) {
      target.invalidate();
      return;
    }
    for (const node of root.wells.getDescendantsByType(BaseLogNode)) {

      const trajectoryNode = node.trajectoryNode;
      if (!trajectoryNode)
        continue;

      if (Random.isTrue(0.025))
        node.setVisibleInteractive(true);
    }
    // for (const node of root.wells.getDescendantsByType(WellTrajectoryNode)) {

    //   if (Random.isTrue(0.025))
    //     node.toogleVisibleInteractive();
    // }
    if (target)
      target.invalidate();
  }
}



// Old test code:
//===============

//import { PolylinesNode } from './src/Nodes/PolylinesNode';
//import { PotreeNode } from './src/Nodes/PotreeNode';
//import { SurfaceNode } from './src/Nodes/SurfaceNode';
//import { PointsNode } from './src/Nodes/PointsNode';
//import { Points } from './src/Core/Geometry/Points';
//import { ColorType } from './src/Core/Enums/ColorType';
//import { Colors } from './src/Core/Primitives/Colors';
//{
//  const range = Range3.createByMinAndMax(0, 0.5, 1, 1);
//  const target = new ThreeRenderTargetNode(range);
//  root.targets.addChild(target);
//}
// Add data
//for (let i = 0; i < 1; i++)
//{
//  const range = Range3.newTest;
//  range.expandByFraction(-0.3);
//  const node = new PointsNode();
//  node.data = Points.createByRandom(2_000_000, range);
//  root.dataFolder.addChild(node);
//}
//for (let i = 0; i < 1; i++)
//{
//  const range = Range3.newTest;
//  range.expandByFraction(-0.2);
//  const node = new PolylinesNode();
//  node.data = Polylines.createByRandom(20, 10, range);
//  root.dataFolder.addChild(node);
//}
//for (let i = 0; i < 1; i++)
//{
//  const node = new SurfaceNode();
//  node.data = RegularGrid2.createFractal(Range3.newTest, 8, 0.8, 2);
//  root.dataFolder.addChild(node);
//}
//{
//  const node = new PotreeNode();
//  //node.url = 'https://betaserver.icgc.cat/potree12/resources/pointclouds/barcelonasagradafamilia/cloud.js';
//  //node.name = 'Barcelona';
//  node.url = '/Real/ept.json';
//  node.name = 'Aerfugl';
//  root.dataFolder.addChild(node);
//}
//for (const node of root.getDescendantsByType(PotreeNode))
//  node.setVisible(true);
// Set some visible in target 1
// root.targets.children[0].setActiveInteractive();
//for (const node of root.getDescendantsByType(PointsNode))
//{
//  const style = node.renderStyle;
//  if (style)
//  {
//    style.colorType = ColorType.DepthColor;
//    style.size = 1;
//  }
//  node.setVisible(true);
//}
//for (const node of root.getDescendantsByType(PolylinesNode))
//{
//  const style = node.renderStyle;
//  if (style)
//    style.lineWidth = 10;
//  node.setVisible(true);
//}
//
//for (const node of root.getDescendantsByType(SurfaceNode))
//{
//  const style = node.renderStyle;
//  if (style)
//  {
//    style.colorType = ColorType.DepthColor;
//  }
//  node.setVisible(true);
//}
