import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebcamComponent } from './components/webcam/webcam.component';
import { FaceDetectionComponent } from './components/face-detection/face-detection.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WebcamComponent, FaceDetectionComponent],
  template: `
    <div class="app-container">
      <header>
        <h1>Voicera Face Detection</h1>
        <p>Real-time face detection with age, gender, and emotion recognition</p>
      </header>
      
      <main>
        <app-webcam></app-webcam>
        <app-face-detection></app-face-detection>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      
      header {
        text-align: center;
        margin-bottom: 2rem;
        
        h1 {
          font-size: 2.5rem;
          margin: 0;
          color: #1976d2;
        }
        
        p {
          font-size: 1.1rem;
          color: #666;
          margin: 0.5rem 0 0;
        }
      }
      
      main {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        align-items: center;
      }
    }
  `]
})
export class AppComponent {}
