import { createReducer } from "@reduxjs/toolkit";
import { VisualizerStateInterface } from "@/UserInterface/interfaces/visualizers";
import Viewer from "@/UserInterface/info/Viewer";
import {
    EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS, SET_STATUS_PANEL_TEXT,
    SET_VISUALIZER_DATA
} from "@/UserInterface/redux/types/visualizers";

// Initial settings state
const initialState: VisualizerStateInterface = {
    toolbars: {},
    targets: {},
    statusBar: {
        text: ""
    }
};

// Redux Toolkit package includes a createReducer utility that uses Immer internally.
// Because of this, we can write reducers that appear to "mutate" state, but the updates
// are actually applied immutably.
export default createReducer(initialState, {
    [SET_VISUALIZER_DATA]: (state, action) => {
        for (const viewer of action.payload.viewers as Viewer[]) {
            const viewerName = viewer.getName();
            state.toolbars[viewerName] = viewer.getToolbar()!; 
            state.targets[viewerName] = viewer.getTarget();
        }
    },
    [EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS]: (state, action) => {
        const { visualizerId } = action.payload;
        const toolbar = state.toolbars[visualizerId];
        toolbar.map((item) => {
            const command = item.command;
            item.isChecked = command.isChecked;
            item.icon = command.getIcon();
        });
    },
    [SET_STATUS_PANEL_TEXT]: (state, action) => {
        const { text } = action.payload;
        state.statusBar.text = text;
    }

});
