import "reset-css";
import "./styles/scss/index.scss";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SplitPane from "react-split-pane";
import _ from "lodash";

import RightPanel from "./components/Panels/RightPanel";
import LeftPanel from "./components/Panels/LeftPanel";

import RootManager from "./managers/rootManager";
import { generateNodeTree } from "./redux/actions/explorer";
import { BaseRootLoader } from "@/RootLoaders/BaseRootLoader";
import { RandomDataLoader } from "@/RootLoaders/RandomDataLoader";
import { ReduxStore } from "./interfaces/common";
import { setVisualizerData } from "./redux/actions/visualizers";

import NotificationsToActionsAdaptor from "./adaptors/NotificationToAction";
import { VirtualUserInterface } from "@/Core/States/VirtualUserInterface";
import UserInterfaceListener from "./adaptors/UserInterfaceListener";
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";

/**
 * Root component
 */
export default () => {
  const dispatch = useDispatch();
  const explorer = useSelector((state: ReduxStore) => state.explorer);
  const visualizers = useSelector((state: ReduxStore) => state.visualizers);
  const root = explorer.root;

  // Setup root and generate domain nodes
  useEffect(() => {
    const notificationAdaptor: NotificationsToActionsAdaptor = new NotificationsToActionsAdaptor(
      dispatch
    );
    VirtualUserInterface.install(new UserInterfaceListener(notificationAdaptor));

    // Targets and Toolbars
    const targets = RootManager.targets(root, "visualizer-3d");
    const toolBars = RootManager.toolbars(root);
    dispatch(setVisualizerData({ targets, toolBars }));

    RootManager.appendDOM(root, "visualizer-3d", "3d");
    const loader: BaseRootLoader = new RandomDataLoader();
    loader.load(root);
    dispatch(generateNodeTree({ root }));
    RootManager.initializeWhenPopulated(root);
  }, [root]);

  return (
    <div className="root-container">
      <SplitPane
        split="vertical"
        minSize={290}
        onChange={() => {
          // TODO: Add all targets to resize event handler
          visualizers.targets["3d"].onResize();
        }}
      >
        <LeftPanel />
        <RightPanel />
      </SplitPane>
    </div>
  );
};
