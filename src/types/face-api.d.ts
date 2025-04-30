declare module 'face-api.js' {
  interface IPoint {
    x: number;
    y: number;
  }

  interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface IFaceDetection {
    score: number;
    box: IRect;
  }

  interface IFaceLandmarks {
    positions: IPoint[];
    shift(point: IPoint): IFaceLandmarks;
  }

  interface IFaceExpressions {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
  }

  interface WithFaceDetection<T> {
    detection: IFaceDetection;
  }

  interface WithFaceLandmarks<T extends WithFaceDetection<{}>> {
    landmarks: IFaceLandmarks;
    detection: IFaceDetection;
  }

  interface WithFaceExpressions<T extends WithFaceLandmarks<WithFaceDetection<{}>>> {
    expressions: IFaceExpressions;
    landmarks: IFaceLandmarks;
    detection: IFaceDetection;
  }

  interface WithAge<T extends WithFaceExpressions<WithFaceLandmarks<WithFaceDetection<{}>>>> {
    age: number;
    expressions: IFaceExpressions;
    landmarks: IFaceLandmarks;
    detection: IFaceDetection;
  }

  interface WithGender<T extends WithAge<WithFaceExpressions<WithFaceLandmarks<WithFaceDetection<{}>>>>> {
    gender: string;
    genderProbability: number;
    age: number;
    expressions: IFaceExpressions;
    landmarks: IFaceLandmarks;
    detection: IFaceDetection;
  }

  class TinyFaceDetectorOptions {
    constructor(inputSize?: number, scoreThreshold?: number);
  }

  class FaceDetection implements IFaceDetection {
    readonly score: number;
    readonly box: IRect;
    constructor(score: number, box: IRect);
  }

  const nets: {
    tinyFaceDetector: any;
    faceLandmark68Net: any;
    faceRecognitionNet: any;
    faceExpressionNet: any;
    ageGenderNet: any;
  };

  function detectAllFaces(input: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement, options?: TinyFaceDetectorOptions): Promise<WithFaceDetection<{}>[]>;

  interface DetectAllFacesTask<T> extends Promise<T[]> {
    withFaceLandmarks(): Promise<WithFaceLandmarks<WithFaceDetection<{}>>[]>;
    withFaceExpressions(): Promise<WithFaceExpressions<WithFaceLandmarks<WithFaceDetection<{}>>>[]>;
    withAgeAndGender(): Promise<WithGender<WithAge<WithFaceExpressions<WithFaceLandmarks<WithFaceDetection<{}>>>>>[]>;
  }

  namespace detectAllFaces {
    function withFaceLandmarks(): DetectAllFacesTask<WithFaceLandmarks<WithFaceDetection<{}>>>;
    function withFaceExpressions(): DetectAllFacesTask<WithFaceExpressions<WithFaceLandmarks<WithFaceDetection<{}>>>>;
    function withAgeAndGender(): DetectAllFacesTask<WithGender<WithAge<WithFaceExpressions<WithFaceLandmarks<WithFaceDetection<{}>>>>>>;
  }
}
