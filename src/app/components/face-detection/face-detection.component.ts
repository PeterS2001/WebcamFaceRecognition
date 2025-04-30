import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DetectedFace } from '../../store/face.state';

@Component({
  selector: 'app-face-detection',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule],
  template: `
    <div class="detection-results" *ngIf="detectedFaces$ | async as faces">
      <mat-card *ngFor="let face of faces" class="face-card">
        <mat-card-header>
          <mat-card-title>Face #{{ face.id }}</mat-card-title>
          <mat-card-subtitle>
            Age: {{ face.age }} | Gender: {{ face.gender }} ({{ (face.genderProbability * 100).toFixed(0) }}%)
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <h3>Expressions:</h3>
          <mat-list>
            <mat-list-item *ngFor="let exp of getTopExpressions(face.expressions)">
              {{ exp.name }}: {{ (exp.probability * 100).toFixed(0) }}%
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
      
      <div class="no-faces" *ngIf="faces.length === 0">
        No faces detected. Try adjusting the camera or lighting.
      </div>
    </div>
  `,
  styles: [`
    .detection-results {
      width: 100%;
      max-width: 640px;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem;
      
      .face-card {
        width: calc(50% - 0.5rem);
        min-width: 250px;
        
        mat-card-title {
          font-size: 1.1rem;
        }
        
        mat-card-subtitle {
          font-size: 0.9rem;
        }
        
        h3 {
          margin: 0.5rem 0;
          font-size: 1rem;
          color: #666;
        }
        
        mat-list {
          padding: 0;
        }
        
        mat-list-item {
          font-size: 0.9rem;
          height: 32px;
        }
      }
      
      .no-faces {
        width: 100%;
        text-align: center;
        color: #666;
        padding: 2rem;
        background: #f5f5f5;
        border-radius: 8px;
      }
    }
  `]
})
export class FaceDetectionComponent {
  detectedFaces$: Observable<DetectedFace[]>;

  constructor(private store: Store<{ face: { detectedFaces: DetectedFace[] } }>) {
    this.detectedFaces$ = this.store.select(state => state.face.detectedFaces);
  }

  /**
   * Get the top 3 expressions sorted by probability
   */
  getTopExpressions(expressions: { [key: string]: number }): { name: string; probability: number }[] {
    return Object.entries(expressions)
      .map(([name, probability]) => ({ name, probability }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
  }
}
