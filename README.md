# Voicera Face Detection App

A modern web application that demonstrates real-time face detection, age/gender estimation, and emotion recognition using Angular and face-api.js.

## Features

- Real-time webcam face detection
- Image upload support
- Age and gender estimation
- Emotion detection
- Responsive design
- State management with NgRx

## Tech Stack

- **Frontend Framework**: Angular 16+
- **Face Detection**: face-api.js (TensorFlow.js)
- **State Management**: NgRx
- **UI Components**: Angular Material
- **Styling**: SCSS

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── webcam/          # Main webcam component
│   │   └── face-detection/  # Face detection display
│   ├── services/
│   │   └── face-detection.service.ts
│   └── store/              # NgRx state management
│       ├── face.actions.ts
│       ├── face.reducer.ts
│       └── face.state.ts
└── assets/
    └── models/            # face-api.js model files
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   ng serve
   ```

3. Open your browser and navigate to `http://localhost:4200`

## Key Implementation Details

- Uses TinyFaceDetector model for optimal performance
- Implements proper cleanup of resources (webcam, models)
- Handles errors gracefully with user feedback
- Maintains clean separation of concerns (components, services, state)

## Performance Considerations

- Efficient frame processing with requestAnimationFrame
- Proper disposal of face-api.js models
- Optimized canvas operations
- Responsive UI with minimal reflows

## Future Enhancements

- Add face recognition capabilities
- Implement emotion tracking over time
- Add support for multiple face tracking
- Export detection results

## License

MIT License - Feel free to use this code for your own projects.
