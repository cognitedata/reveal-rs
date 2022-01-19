import { connect } from 'react-redux';
import { Explorer } from '@/UserInterface/Components/Explorer/Explorer';
import { Dispatch } from 'redux';
import { State } from '@/UserInterface/Redux/State/State';
import {
  getAllTabs,
  getCurrentTabIndex,
  getNodeTree,
  onSelectedTabChange,
} from '@/UserInterface/Redux/reducers/ExplorerReducer';
import { onSelectedNodeChange } from '@/UserInterface/Redux/reducers/SettingsReducer';
import { ExplorerNodeUtils } from '@/UserInterface/NodeVisualizer/Explorer/ExplorerNodeUtils';

function mapDispatchToExplorerPanel(dispatch: Dispatch) {
  return {
    onTabChange: (tabIndex: number): void => {
      dispatch(onSelectedTabChange({ selectedTabIndex: tabIndex }));
      const currentSelectedNode = ExplorerNodeUtils.getSelectedNodeOfCurrentTab(
        tabIndex
      );
      if (currentSelectedNode)
        dispatch(onSelectedNodeChange(currentSelectedNode));
    },
    onNodeExpandToggle: (nodeId: string, expandState: boolean): void => {
      ExplorerNodeUtils.setNodeExpandById(nodeId, expandState);
    },
    onToggleVisible: (nodeId: string): void => {
      ExplorerNodeUtils.toggleVisibleById(nodeId);
    },
    onNodeSelect: (nodeId: string, selectState: boolean): void => {
      ExplorerNodeUtils.selectNodeById(nodeId, selectState);
    },
  };
}

function mapStateToExplorerPanel(state: State) {
  const tabs = getAllTabs(state);
  const data = getNodeTree(state);
  const selectedTabIndex = getCurrentTabIndex(state);

  return { tabs, data, selectedTabIndex };
}

export const ConnectedExplorerPanel = connect(
  mapStateToExplorerPanel,
  mapDispatchToExplorerPanel
)(Explorer);
