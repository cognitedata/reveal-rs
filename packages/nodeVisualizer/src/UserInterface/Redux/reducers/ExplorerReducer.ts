import { ActionTypes } from 'UserInterface/Redux/actions/ActionTypes';
import Color from 'color';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IExplorerState,
  ITreeNodeState,
} from 'UserInterface/Redux/State/explorer';
import { BaseNode } from 'Core/Nodes/BaseNode';
import { TreeCheckState } from 'UserInterface/NodeVisualizer/Explorer/TreeCheckState';
import { ExplorerNodeUtils } from 'UserInterface/NodeVisualizer/Explorer/ExplorerNodeUtils';
import { State } from 'UserInterface/Redux/State/State';
import { ITreeNode } from 'UserInterface/Components/VirtualTree/ITreeNode';

const initialState: IExplorerState = {
  tabs: [],
  selectedTabIndex: 0,
  selectedNodeId: null,
  nodes: {
    byId: {},
    allIds: [],
  },
};

export const explorerSlice = createSlice({
  name: 'explorer',
  initialState,
  reducers: {
    generateNodeTree: {
      reducer(
        state: IExplorerState,
        action: PayloadAction<{ tabNodes: BaseNode[] }>
      ): IExplorerState {
        const { tabNodes } = action.payload;

        state.tabs = [];
        state.selectedTabIndex = 0;
        state.selectedNodeId = null;
        state.nodes = { byId: {}, allIds: [] };

        for (const tabNode of tabNodes) {
          const nodeType = tabNode.typeName;
          const tabNodeState = generateNodeState(tabNode, null, nodeType);
          const tabNodeId = tabNodeState.uniqueId;

          state.tabs.push(tabNodeId);
          state.nodes.byId[tabNodeId] = tabNodeState;
          state.nodes.allIds.push(tabNodeId);

          for (const descendent of tabNode.getDescendants()) {
            if (descendent.parent) {
              const nodeState = generateNodeState(
                descendent,
                descendent.parent.uniqueId.toString(),
                nodeType
              );
              const nodeId = nodeState.uniqueId;

              state.nodes.byId[nodeId] = nodeState;
              state.nodes.allIds.push(nodeId);
            }
          }
        }

        return state;
      },
      prepare(): { payload: { tabNodes: BaseNode[] } } {
        const tabNodes = ExplorerNodeUtils.getAllTabNodes();

        return { payload: { tabNodes } };
      },
    },
    onSelectedTabChange(
      state: IExplorerState,
      action: PayloadAction<{ selectedTabIndex: number }>
    ): IExplorerState {
      state.selectedTabIndex = action.payload.selectedTabIndex;

      return state;
    },
    onCheckboxStateChange: {
      reducer(
        state: IExplorerState,
        action: PayloadAction<{
          nodeId: string;
          checkBoxState: string;
          disabled: boolean;
        }>
      ): IExplorerState {
        const checkState = action.payload.checkBoxState;
        const uniqueId = action.payload.nodeId;
        const nodeState = state.nodes.byId[uniqueId];

        if (nodeState) {
          nodeState.disabled = action.payload.disabled;
          nodeState.checked = checkState === TreeCheckState.Checked;
          nodeState.indeterminate = checkState === TreeCheckState.Partial;
          nodeState.checkable = checkState !== TreeCheckState.CanNotBeChecked;
        }
        return state;
      },
      prepare(node: BaseNode): {
        payload: { nodeId: string; checkBoxState: string; disabled: boolean };
      } {
        return {
          payload: {
            nodeId: node.uniqueId.toString(),
            checkBoxState: ExplorerNodeUtils.getCheckBoxStateByNode(node),
            disabled: !node.getCheckBoxEnabled(),
          },
        };
      },
    },
    onNodeIsLoadingChange: {
      reducer(
        state: IExplorerState,
        action: PayloadAction<{ nodeId: string; isLoading: boolean }>
      ): IExplorerState {
        const { isLoading, nodeId } = action.payload;
        const nodeState = state.nodes.byId[nodeId];

        if (nodeState) {
          nodeState.isLoading = isLoading;
        }

        return state;
      },
      prepare(node: BaseNode): {
        payload: { nodeId: string; isLoading: boolean };
      } {
        return {
          payload: {
            nodeId: node.uniqueId.toString(),
            isLoading: node.isLoading,
          },
        };
      },
    },
    onNodeIsLoadingErrorChange: {
      reducer(
        state: IExplorerState,
        action: PayloadAction<{
          nodeId: string;
          loadingError: string | undefined;
        }>
      ): IExplorerState {
        const { loadingError, nodeId } = action.payload;
        const nodeState = state.nodes.byId[nodeId];

        if (nodeState) {
          nodeState.loadingError = loadingError;
        }

        return state;
      },
      prepare(node: BaseNode): {
        payload: { nodeId: string; loadingError: string | undefined };
      } {
        return {
          payload: {
            nodeId: node.uniqueId.toString(),
            loadingError: node.loadingError,
          },
        };
      },
    },
    onExpandStateChange: {
      reducer(
        state: IExplorerState,
        action: PayloadAction<{ nodeId: string; expandState: boolean }>
      ): IExplorerState {
        const uniqueId = action.payload.nodeId;
        const expandStatus = action.payload.expandState;
        const node = state.nodes.byId[uniqueId];

        if (node) state.nodes.byId[uniqueId].expanded = expandStatus;

        return state;
      },
      prepare(node: BaseNode): {
        payload: { nodeId: string; expandState: boolean };
      } {
        return {
          payload: {
            nodeId: node.uniqueId.toString(),
            expandState: node.isExpanded,
          },
        };
      },
    },
    onActiveStateChange: {
      reducer(
        state: IExplorerState,
        action: PayloadAction<{ nodeId: string; activeState: boolean }>
      ): IExplorerState {
        const uniqueId = action.payload.nodeId;
        const node = state.nodes.byId[uniqueId];

        if (node)
          state.nodes.byId[uniqueId].label.bold = action.payload.activeState;

        return state;
      },
      prepare(node: BaseNode): {
        payload: { nodeId: string; activeState: boolean };
      } {
        return {
          payload: {
            nodeId: node.uniqueId.toString(),
            activeState: node.isActive,
          },
        };
      },
    },
    onNodeNameChange: {
      reducer(
        state: IExplorerState,
        action: PayloadAction<{ nodeId: string; newLabel: string }>
      ): IExplorerState {
        const uniqueId = action.payload.nodeId;
        const node = state.nodes.byId[uniqueId];

        if (node) node.name = action.payload.newLabel;

        return state;
      },
      prepare(node: BaseNode): {
        payload: { nodeId: string; newLabel: string };
      } {
        return {
          payload: {
            nodeId: node.uniqueId.toString(),
            newLabel: node.displayName,
          },
        };
      },
    },
    onNodeColorChange: {
      reducer(
        state: IExplorerState,
        action: PayloadAction<{ nodeId: string; nodeColor: Color }>
      ): IExplorerState {
        const uniqueId = action.payload.nodeId;
        const node = state.nodes.byId[uniqueId];

        if (node) node.icon.color = action.payload.nodeColor;

        return state;
      },
      prepare(node: BaseNode): {
        payload: { nodeId: string; nodeColor: Color };
      } {
        return {
          payload: { nodeId: node.uniqueId.toString(), nodeColor: node.color },
        };
      },
    },
    onNodeIconChange: {
      reducer(
        state: IExplorerState,
        action: PayloadAction<{ nodeId: string; nodeIcon: string }>
      ): IExplorerState {
        const uniqueId = action.payload.nodeId;
        const node = state.nodes.byId[uniqueId];

        if (node) node.icon.path = action.payload.nodeIcon;

        return state;
      },
      prepare(node: BaseNode): {
        payload: { nodeId: string; nodeIcon: string };
      } {
        return {
          payload: {
            nodeId: node.uniqueId.toString(),
            nodeIcon: node.getIcon(),
          },
        };
      },
    },
  },
  extraReducers: {
    [ActionTypes.changeSelectState]: (
      state: IExplorerState,
      action: PayloadAction<{ node: BaseNode }>
    ): IExplorerState => {
      const { node } = action.payload;
      const uniqueId = node.uniqueId.toString();
      const selectStatus = node.isSelected();
      const nodeState = state.nodes.byId[uniqueId];

      if (nodeState) {
        state.nodes.byId[uniqueId].selected = selectStatus;

        if (selectStatus) state.selectedNodeId = uniqueId;
      }

      return state;
    },
  },
});

export const {
  generateNodeTree,
  onSelectedTabChange,
  onCheckboxStateChange,
  onExpandStateChange,
  onActiveStateChange,
  onNodeColorChange,
  onNodeNameChange,
  onNodeIconChange,
  onNodeIsLoadingChange,
  onNodeIsLoadingErrorChange,
} = explorerSlice.actions;
export const explorerReducer = explorerSlice.reducer;

// selectors

export const getAllNodeStateMap = (
  state: State
): { [id: string]: ITreeNodeState } => state.explorer.nodes.byId;
export const getAllNodeStateIds = (state: State): string[] =>
  state.explorer.nodes.allIds;
export const getAllTabIds = (state: State): string[] => state.explorer.tabs;
export const getCurrentTabIndex = (state: State): number =>
  state.explorer.selectedTabIndex;

export const getAllNodeStates = createSelector(
  [getAllNodeStateMap, getAllNodeStateIds],
  (nodeStateMap, allNodeStateIds) => {
    return allNodeStateIds.map((id) => nodeStateMap[id]);
  }
);

export const getAllTabs = createSelector(
  [getAllTabIds, getAllNodeStateMap],
  (tabStateIds, nodeStateMap) => {
    const allTabStates = tabStateIds.map((id) => nodeStateMap[id]);

    return allTabStates.map((tabNodeState) => {
      return {
        name: tabNodeState.name,
        icon: tabNodeState.icon.path,
        type: tabNodeState.nodeType,
      };
    });
  }
);

export const getVisibleNodeStates = createSelector(
  [getAllNodeStates],
  (allNodeStates) => allNodeStates.filter((nodeState) => nodeState.visible)
);

export const getCurrentNodeType = createSelector(
  [getAllTabs, getCurrentTabIndex],
  (allTabs, currentTabIndex) =>
    allTabs[currentTabIndex] ? allTabs[currentTabIndex].type : ''
);

export const getCurrentNodes = createSelector(
  [getVisibleNodeStates, getCurrentNodeType],
  (nodeStates: ITreeNodeState[], currentNodeType: string) =>
    nodeStates.filter((nodeState) => nodeState.nodeType === currentNodeType)
);

export const getNodeTree = createSelector([getCurrentNodes], (nodeStates) => {
  const nodeTree: ITreeNode[] = [];
  const nodeTreeMap: Record<string, ITreeNode> = {};

  nodeStates.forEach((nodeState) => {
    const treeNode = { ...nodeState, children: [] };

    nodeTreeMap[nodeState.uniqueId] = treeNode;

    if (nodeState.parentId) {
      const parent = nodeTreeMap[nodeState.parentId];

      if (parent)
        // if parent is not available that means it's a node in first level
        parent.children.push(treeNode);
      else nodeTree.push(treeNode);
    }
  });

  return nodeTree;
});

// Generate redux store compatible nodes data structure from root node
function generateNodeState(
  node: BaseNode,
  parentId: string | null,
  typeName: string
): ITreeNodeState {
  const checkBoxState = ExplorerNodeUtils.getCheckBoxStateByNode(node);

  return {
    nodeType: typeName,
    parentId,
    uniqueId: node.uniqueId.toString(),
    name: node.displayName,
    expanded: node.isExpanded,
    icon: {
      path: node.getIcon(),
      description: node.displayName,
      color: node.hasIconColor() ? node.getColor() : undefined,
    },
    selected: node.isSelected(),
    checked: checkBoxState === TreeCheckState.Checked,
    indeterminate: checkBoxState === TreeCheckState.Partial,
    checkable: checkBoxState !== TreeCheckState.CanNotBeChecked,
    disabled: !node.getCheckBoxEnabled(),
    isRadio: node.isRadio(null),
    isFilter: node.isFilter(null),
    checkVisible: checkBoxState !== TreeCheckState.NotVisible,
    visible: node.isVisibleInTreeControl(),
    label: {
      italic: node.isLabelInItalic(),
      bold: node.isLabelInBold(),
      color: node.getLabelColor(),
    },
    isLoading: node.isLoading,
  };
}
