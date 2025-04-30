import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as FaceActions from '../../store/face.actions';
import { FaceDetectionService } from '../../services/face-detection.service';
import { FaceState } from '../../store/face.state';

@Component({
  selector: 'app-webcam',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="webcam-container">
      <div class="video-container">
        <video #video [class.active]="isWebcamActive$ | async" autoplay muted playsinline></video>
        <canvas #canvas></canvas>
        <div class="controls">
          <button mat-raised-button color="primary" (click)="toggleWebcam()" [disabled]="isLoading">
            {{ (isWebcamActive$ | async) ? 'Stop Camera' : 'Start Camera' }}
          </button>
          <input
            type="file"
            accept="image/*"
            (change)="handleImageUpload($event)"
            style="display: none"
            #fileInput
          >
          <button mat-raised-button color="accent" (click)="fileInput.click()" [disabled]="isLoading">
            Upload Image
          </button>
        </div>
        <div class="loading-overlay" *ngIf="isLoading">
          <mat-spinner diameter="40"></mat-spinner>
          <span>Loading models...</span>
        </div>
      </div>

      <div *ngIf="error$ | async as error" class="error-message">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .webcam-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem;

      .video-container {
        position: relative;
        width: 640px;
        height: 480px;
        background-color: #000;
        border-radius: 8px;
        overflow: hidden;

        video, canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        video.active {
          z-index: 0;
        }

        canvas {
          z-index: 1;
        }

        .controls {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          display: flex;
          gap: 1rem;
          
          button {
            min-width: 120px;
            &[disabled] {
              opacity: 0.7;
              cursor: not-allowed;
            }
          }
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          z-index: 3;
          
          span {
            color: white;
            font-size: 1rem;
          }
        }
      }

      .error-message {
        color: #f44336;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        background-color: rgba(244, 67, 54, 0.1);
        font-size: 0.875rem;
        max-width: 640px;
        text-align: center;
      }
    }

    @media (max-width: 768px) {
      .webcam-container {
        .video-container {
          width: 100%;
          height: 0;
          padding-bottom: 75%; // 4:3 aspect ratio
          
          .controls {
            flex-direction: column;
            align-items: center;
            left: 0;
            right: 0;
            transform: none;
            padding: 0 1rem;
            
            button {
              width: 100%;
            }
          }
        }
      }
    }
  `]
})
export class WebcamComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  isWebcamActive$: Observable<boolean>;
  error$: Observable<string | null>;
  isLoading = false;
  private stream: MediaStream | null = null;
  private detectionInterval: number | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private store: Store<{ face: FaceState }>,
    private faceDetectionService: FaceDetectionService
  ) {
    this.isWebcamActive$ = this.store.select(state => state.face.isWebcamActive);
    this.error$ = this.store.select(state => state.face.error);
  }

  ngOnInit(): void {
    this.loadModels();
    this.setupModelLoadingSubscription();
  }

  ngOnDestroy(): void {
    this.stopWebcam();
    this.destroy$.next();
    this.destroy$.complete();
    this.faceDetectionService.dispose();
  }

  private async loadModels(): Promise<void> {
    try {
      this.isLoading = true;
      await this.faceDetectionService.loadModels();
    } catch (error) {
      this.store.dispatch(FaceActions.setError({ 
        error: error instanceof Error ? error.message : 'Failed to load face detection models' 
      }));
    } finally {
      this.isLoading = false;
    }
  }

  private setupModelLoadingSubscription(): void {
    this.faceDetectionService.isModelsLoaded$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoaded => {
        this.isLoading = !isLoaded;
      });
  }

  async toggleWebcam(): Promise<void> {
    if (this.stream) {
      this.stopWebcam();
    } else {
      await this.startWebcam();
    }
  }

  async startWebcam(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      const video = this.videoElement.nativeElement;
      video.srcObject = this.stream;
      
      // Wait for video metadata to load
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });

      this.store.dispatch(FaceActions.startWebcam());
      this.store.dispatch(FaceActions.setError({ error: null }));
      
      this.detectionInterval = window.setInterval(() => {
        this.detectFaces();
      }, 1000);
    } catch (error) {
      this.store.dispatch(FaceActions.setError({ 
        error: error instanceof Error ? error.message : 'Failed to access webcam' 
      }));
    }
  }

  stopWebcam(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    
    this.store.dispatch(FaceActions.stopWebcam());
    this.store.dispatch(FaceActions.setError({ error: null }));
  }

  async detectFaces(): Promise<void> {
    if (!this.stream || !this.videoElement.nativeElement.videoWidth) {
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    try {
      const faces = await this.faceDetectionService.detectFaces(canvas);
      if (faces.length > 0) {
        this.store.dispatch(FaceActions.detectFacesSuccess({ faces }));
        
        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw the video frame
        ctx.drawImage(video, 0, 0);
        
        // Draw face detection boxes
        faces.forEach(face => {
          if (face.detection) {
            const box = face.detection.box;
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            // Draw face info
            ctx.fillStyle = '#00ff00';
            ctx.font = '12px Arial';
            ctx.fillText(
              `Age: ${face.age} | Gender: ${face.gender} (${(face.genderProbability * 100).toFixed(0)}%)`,
              box.x,
              box.y - 5
            );
          }
        });
      }
    } catch (error) {
      this.store.dispatch(FaceActions.detectFacesFailure({ 
        error: error instanceof Error ? error.message : 'Failed to detect faces' 
      }));
    }
  }

  async handleImageUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.store.dispatch(FaceActions.setError({ error: 'Please upload an image file' }));
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
      // Stop webcam if it's running
      this.stopWebcam();
      
      const canvas = this.canvasElement.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      try {
        const faces = await this.faceDetectionService.detectFaces(canvas);
        this.store.dispatch(FaceActions.detectFacesSuccess({ faces }));
        
        faces.forEach(face => {
          if (face.detection) {
            const box = face.detection.box;
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            // Draw face info
            ctx.fillStyle = '#00ff00';
            ctx.font = '12px Arial';
            ctx.fillText(
              `Age: ${face.age} | Gender: ${face.gender} (${(face.genderProbability * 100).toFixed(0)}%)`,
              box.x,
              box.y - 5
            );
          }
        });
      } catch (error) {
        this.store.dispatch(FaceActions.detectFacesFailure({ 
          error: error instanceof Error ? error.message : 'Failed to detect faces in image' 
        }));
      } finally {
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      this.store.dispatch(FaceActions.setError({ error: 'Failed to load image' }));
    };
  }
}
