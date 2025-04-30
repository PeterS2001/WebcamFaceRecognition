import * as faceapi from 'face-api.js';

/**
 * Represents a detected face with its properties
 */
export interface DetectedFace {
  /**
   * Unique identifier for the detected face
   */
  id: number;
  /**
   * Detection details of the face
   */
  detection: {
    /**
     * Confidence score of the detection
     */
    score: number;
    /**
     * Bounding box of the detected face
     */
    box: {
      /**
       * X-coordinate of the top-left corner of the bounding box
       */
      x: number;
      /**
       * Y-coordinate of the top-left corner of the bounding box
       */
      y: number;
      /**
       * Width of the bounding box
       */
      width: number;
      /**
       * Height of the bounding box
       */
      height: number;
    };
  };
  /**
   * Facial landmarks (e.g. eyes, nose, mouth)
   */
  landmarks: { x: number; y: number }[];
  /**
   * Facial expressions (e.g. happy, sad, neutral)
   */
  expressions: { [key: string]: number };
  /**
   * Estimated age of the person
   */
  age: number;
  /**
   * Estimated gender of the person
   */
  gender: string;
  /**
   * Confidence score of the estimated gender
   */
  genderProbability: number;
}

/**
 * Application state for face detection
 */
export interface FaceState {
  /**
   * Whether the webcam is currently active
   */
  isWebcamActive: boolean;
  /**
   * Array of detected faces
   */
  detectedFaces: DetectedFace[];
  /**
   * Error message (if any)
   */
  error: string | null;
}

/**
 * Initial state for face detection
 */
export const initialState: FaceState = {
  isWebcamActive: false,
  detectedFaces: [],
  error: null
};
