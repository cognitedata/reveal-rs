import { SerializedError } from '@reduxjs/toolkit';
import reducer, {
  initialState,
} from '@vision/modules/Common/store/common/slice';
import { DeleteAnnotations } from '@vision/store/thunks/Annotation/DeleteAnnotations';
import { RetrieveAnnotations } from '@vision/store/thunks/Annotation/RetrieveAnnotations';
import { SaveAnnotations } from '@vision/store/thunks/Annotation/SaveAnnotations';
import { SaveAnnotationTemplates } from '@vision/store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotations } from '@vision/store/thunks/Annotation/UpdateAnnotations';
import { UpdateFiles } from '@vision/store/thunks/Files/UpdateFiles';

jest.mock('@vision/utils/extractErrorMessage', () => ({
  extractErrorMessage: (rawMessage: SerializedError) => rawMessage,
}));

describe('Test common reducer', () => {
  const fulfilledActionTypes = [
    SaveAnnotations.fulfilled.type,
    DeleteAnnotations.fulfilled.type,
    UpdateAnnotations.fulfilled.type,
    UpdateFiles.fulfilled.type,
  ];

  const rejectedActionTypes = [
    SaveAnnotations.rejected.type,
    RetrieveAnnotations.rejected.type,
    DeleteAnnotations.rejected.type,
    UpdateAnnotations.rejected.type,
    UpdateFiles.rejected.type,
    SaveAnnotationTemplates.rejected.type,
  ];

  test('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should set saveState on SaveAnnotations', () => {
    fulfilledActionTypes.forEach((actionType) => {
      const action = {
        type: actionType,
      };
      const state = reducer(initialState, action).saveState;
      expect(state.mode).toEqual('timestamp');
      expect(typeof state.time).toBe('number');
    });
  });

  test('should not change saveState if error is not given', () => {
    rejectedActionTypes.forEach((actionType) => {
      const action = {
        type: actionType,
      };
      const state = reducer(initialState, action).saveState;
      expect(state.mode).toEqual(initialState.saveState.mode);
      expect(typeof state.time).toBe('number');
    });
  });

  test('should set saveState to error when error is provided', () => {
    rejectedActionTypes.forEach((actionType) => {
      const action = {
        type: actionType,
        error: {
          message: 'unsucessful',
        },
      };
      const state = reducer(initialState, action).saveState;
      expect(state.mode).toEqual('error');
      expect(typeof state.time).toBe('number');
    });
  });
});
