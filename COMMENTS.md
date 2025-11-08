# Implementation Notes & Decisions

## Library Choices & Next.js 15 Compatibility

### TensorFlow.js Face Landmarks Detection
- **Choice**: `@tensorflow-models/face-landmarks-detection` with MediaPipe backend
- **Reason**: Provides accurate face mesh detection with good browser performance
- **Next.js 15 Compatibility**: Works with Next.js 15. Requires webpack configuration to handle Node.js polyfills (already configured in `next.config.mjs`)

### MediaPipe Integration
- **Choice**: Using MediaPipe via TensorFlow.js wrapper rather than direct `@mediapipe/tasks-vision`
- **Reason**: Better integration with TensorFlow.js ecosystem and easier model loading
- **Note**: MediaPipe models are loaded from CDN at runtime, so no build-time issues

### Recharts
- **Choice**: Recharts for data visualization
- **Reason**: Lightweight, React-friendly, and works seamlessly with Next.js 15
- **Alternative Considered**: Chart.js (more features but heavier)

### Zustand
- **Choice**: Zustand for state management
- **Reason**: Lightweight, simple API, perfect for this use case
- **Next.js 15**: Fully compatible, no issues

### IndexedDB
- **Choice**: Using `idb` library for IndexedDB operations
- **Reason**: Cleaner API than raw IndexedDB, better TypeScript support
- **Note**: All session data stored locally, never sent to server

## Architecture Decisions

### Client-Side Only Processing
- All face tracking and video processing happens in the browser
- No video frames are ever uploaded to the server
- This ensures privacy and reduces server costs

### WebWorker Consideration
- **Decision**: Face tracking runs on main thread (not in WebWorker)
- **Reason**: TensorFlow.js with MediaPipe performs well on main thread for this use case
- **Note**: If performance becomes an issue, face detection can be moved to a WebWorker, but initial testing shows 30-60fps is achievable on modern hardware

### State Machine Implementation
- Simple string-based state machine in Zustand store
- States: `idle` → `prepping` → `live` → `reviewing`
- Transitions handled in component logic

### AI Provider Abstraction
- `/api/coach` endpoint uses provider-agnostic interface
- Currently supports OpenAI (if API key provided) or mock responses
- Easy to add other providers (Anthropic, local LLM, etc.)

## Performance Optimizations

1. **Face Detection Throttling**: Face detection runs at ~30fps, not every frame
2. **Signal Smoothing**: Metrics are smoothed to reduce jitter
3. **Canvas Optimization**: Offscreen canvas used for processing, only video element rendered
4. **Lazy Loading**: TensorFlow.js models loaded only when needed

## Known Limitations

1. **Browser Support**: Requires modern browser with WebRTC, WebAudio, and WebGL
2. **Camera Permissions**: Requires user consent for camera/microphone access
3. **Model Loading**: First face detection may take 2-3 seconds to load models
4. **Accuracy**: Face tracking accuracy depends on lighting and camera quality

## Future Enhancements

- WebWorker for face tracking (if performance needed)
- More sophisticated filler word detection (NLP-based)
- Video recording option (client-side only)
- Export session reports as PDF
- Multiple language support
- More role-specific question sets

