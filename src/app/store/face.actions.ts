import { createAction, props } from '@ngrx/store';
import { DetectedFace } from './face.state';

/**
 * Action to start the webcam
 */
export const startWebcam = createAction('[Face] Start Webcam');

/**
 * Action to stop the webcam
 */
export const stopWebcam = createAction('[Face] Stop Webcam');

/**
 * Action to initiate face detection
 */
export const detectFaces = createAction('[Face] Detect Faces');

/**
 * Action when face detection is successful
 */
export const detectFacesSuccess = createAction(
  '[Face] Detect Faces Success',
  props<{ faces: DetectedFace[] }>()
);

/**
 * Action when face detection fails
 */
export const detectFacesFailure = createAction(
  '[Face] Detect Faces Failure',
  props<{ error: string }>()
);

/**
 * Action to set an error message
 */
export const setError = createAction(
  '[Face] Set Error',
  props<{ error: string | null }>()
);

/**
 * Action to update detected faces
 */
export const updateDetectedFaces = createAction(
  '[Face] Update Detected Faces',
  props<{ faces: DetectedFace[] }>()
);
