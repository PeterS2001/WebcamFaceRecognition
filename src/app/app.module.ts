import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AppComponent } from './app.component';
import { WebcamComponent } from './components/webcam/webcam.component';
import { FaceDetectionComponent } from './components/face-detection/face-detection.component';
import { FaceDetectionService } from './services/face-detection.service';
import { faceReducer } from './store/face.reducer';

@NgModule({
  declarations: [
    AppComponent,
    WebcamComponent,
    FaceDetectionComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({ face: faceReducer }),
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  providers: [FaceDetectionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
