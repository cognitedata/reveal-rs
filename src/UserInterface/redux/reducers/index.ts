import { combineReducers } from "redux";
import settingsReducer from "./settings";

/**
 * The combineReducers helper function turns an object whose values
 * are different reducing functions into a single reducing function
 * that can pass to createStore.
 */
export default combineReducers({
  settings: settingsReducer,
});
