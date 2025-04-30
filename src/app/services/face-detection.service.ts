import { Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';
import { DetectedFace } from '../store/face.state';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaceDetectionService {
  private modelsLoaded = false;
  private readonly detectorOptions = new faceapi.TinyFaceDetectorOptions(320);
  private readonly MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
  private modelLoadingStatus = new BehaviorSubject<boolean>(false);

  get isModelsLoaded$() {
    return this.modelLoadingStatus.asObservable();
  }

  async loadModels(): Promise<void> {
    if (this.modelsLoaded) {
      this.modelLoadingStatus.next(true);
      return;
    }

    try {
      this.modelLoadingStatus.next(false);
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(this.MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(this.MODEL_URL)
      ]);
      this.modelsLoaded = true;
      this.modelLoadingStatus.next(true);
    } catch (error) {
      this.modelsLoaded = false;
      this.modelLoadingStatus.next(false);
      console.error('Error loading face-api.js models:', error);
      throw new Error('Failed to load face detection models. Please check your internet connection and try again.');
    }
  }

  async detectFaces(input: HTMLCanvasElement | HTMLVideoElement): Promise<DetectedFace[]> {
    if (!input) {
      throw new Error('No input provided for face detection');
    }

    if (!this.modelsLoaded) {
      await this.loadModels();
    }

    try {
      if (input instanceof HTMLVideoElement && (!input.videoWidth || !input.videoHeight)) {
        throw new Error('Video element is not ready');
      }

      const detections = await (faceapi as any)
        .detectAllFaces(input, this.detectorOptions)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      if (!detections?.length) return [];

      return detections.map((detection: any, index: number) => ({
        id: index + 1,
        detection: {
          score: detection.detection.score,
          box: {
            x: detection.detection.box.x,
            y: detection.detection.box.y,
            width: detection.detection.box.width,
            height: detection.detection.box.height
          }
        },
        landmarks: detection.landmarks.positions.map((pos: { x: number; y: number }) => ({
          x: pos.x,
          y: pos.y
        })),
        expressions: Object.entries(detection.expressions).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: Number(value)
        }), {}),
        age: Math.round(detection.age),
        gender: detection.gender,
        genderProbability: Number(detection.genderProbability.toFixed(2))
      }));
    } catch (error) {
      console.error('Error detecting faces:', error);
      throw new Error(error instanceof Error ? error.message : 'Face detection failed');
    }
  }

  dispose(): void {
    try {
      // Clean up face-api models
      faceapi.nets.tinyFaceDetector.dispose();
      faceapi.nets.faceLandmark68Net.dispose();
      faceapi.nets.faceExpressionNet.dispose();
      faceapi.nets.ageGenderNet.dispose();
      this.modelsLoaded = false;
      this.modelLoadingStatus.next(false);
    } catch (error) {
      console.error('Error disposing face detection models:', error);
    }
  }
}
