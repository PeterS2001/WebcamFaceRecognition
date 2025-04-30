import { createReducer, on } from '@ngrx/store';
import { FaceState, initialState } from './face.state';
import * as FaceActions from './face.actions';

/**
 * Reducer for managing face detection state
 */
export const faceReducer = createReducer(
  initialState,
  
  // Handle webcam state
  on(FaceActions.startWebcam, (state) => ({
    ...state,
    isWebcamActive: true,
    error: null
  })),
  
  on(FaceActions.stopWebcam, (state) => ({
    ...state,
    isWebcamActive: false,
    detectedFaces: [],
    error: null
  })),
  
  // Handle face detection results
  on(FaceActions.detectFacesSuccess, (state, { faces }) => ({
    ...state,
    detectedFaces: faces,
    error: null
  })),
  
  on(FaceActions.detectFacesFailure, (state, { error }) => ({
    ...state,
    detectedFaces: [],
    error
  })),
  
  // Handle error state
  on(FaceActions.setError, (state, { error }) => ({
    ...state,
    error
  })),
  
  // Handle face updates
  on(FaceActions.updateDetectedFaces, (state, { faces }) => ({
    ...state,
    detectedFaces: faces,
    error: null
  }))
);
