# ApplAI - AI-Powered Interview Coach 🤖🎤

A cutting-edge Next.js 15 application that helps you ace your interviews with AI-powered practice sessions, real-time feedback, and performance analytics.

## Features

### 🎥 Mock Interview
- **Real-time Face Tracking**: Uses MediaPipe FaceMesh via TensorFlow.js for in-browser face detection
- **Live Metrics**: Eye contact, smile detection, head pose, and speaking activity
- **HUD Gauges**: Beautiful real-time visual feedback on your performance
- **Privacy First**: All video processing happens in your browser - no video is ever uploaded

### 📝 Interview Coaching
- **Question Queue**: Role-based interview questions (Frontend, C/C++ Systems, Data Science, General)
- **Real-time Tips**: Non-blocking toast notifications with actionable feedback
- **Session Reports**: Detailed timeline charts and performance summaries
- **AI-Powered Feedback**: Personalized coaching tips based on your performance

### 📄 Resume Integration
- **Skills Extraction**: Upload or paste your resume to extract relevant skills
- **Personalized Questions**: Interview questions tailored to your role and skills
- **Keyword Detection**: Automatic identification of technical skills and keywords

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations and glow effects
- **Face Tracking**: TensorFlow.js + MediaPipe FaceMesh
- **Charts**: Recharts
- **State Management**: Zustand
- **Storage**: IndexedDB (local browser storage)
- **Animations**: Framer Motion
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd "BDPA Hackathon 2"
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up OpenAI API key for enhanced AI feedback:
```bash
# Create .env.local file
echo "OPENAI_API_KEY=sk-27713c6a939f42189c4cdb222a390bd1" > .env.local
```
*Note: The app works without an API key using mock responses*

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 60-Second Demo Script

1. **Upload Resume** (10s)
   - Navigate to `/resume`
   - Select your role (e.g., "Frontend")
   - Paste your resume text or upload a .txt file
   - Review extracted skills

2. **Start Interview** (30s)
   - Go to `/interview`
   - Click "Start Interview" and grant camera/mic permissions
   - Watch the real-time HUD gauges update
   - Select a question from the queue
   - Observe real-time tips appearing

3. **Review Session** (20s)
   - Click "Stop Interview"
   - View performance charts and timeline
   - Read AI-generated feedback and tips
   - Check average scores

## Project Structure

```
├── app/
│   ├── api/coach/          # AI coaching endpoint
│   ├── interview/          # Mock interview page
│   ├── review/             # Session review page
│   ├── resume/             # Resume upload page
│   └── page.tsx            # Landing page
├── components/
│   ├── CameraPanel.tsx     # Webcam capture and face tracking
│   ├── HudGauges.tsx       # Real-time metrics display
│   ├── QuestionQueue.tsx   # Interview questions
│   ├── TipsToasts.tsx      # Real-time coaching tips
│   ├── SummaryCharts.tsx   # Performance visualization
│   └── ConsentDialog.tsx   # Privacy consent
├── lib/
│   ├── faceTracking.ts     # Face detection and metrics
│   ├── audioAnalysis.ts    # Audio level and filler word detection
│   ├── signalProcessing.ts # Signal smoothing and normalization
│   ├── store.ts            # Zustand state management
│   └── __tests__/          # Unit tests
└── public/                 # Static assets
```

## Key Components

### CameraPanel
- Captures webcam stream using `getUserMedia`
- Renders to `<video>` and offscreen `<canvas>`
- Runs face tracking in real-time (no server upload)
- Handles camera permission errors gracefully

### Face Tracking
- Uses `@tensorflow-models/face-landmarks-detection` with MediaPipe backend
- Computes:
  - Eye openness (blink detection)
  - Head pose (yaw/pitch/roll)
  - Smile probability
- All processing happens client-side

### Audio Analysis
- Uses WebAudio API to analyze microphone input
- Detects speaking activity and filler words
- No audio recordings saved

### State Machine
Interview flow: `idle` → `prepping` → `live` → `reviewing`

## Testing

Run tests with:
```bash
npm test
```

Tests cover:
- Signal smoothing functions
- Smile detection heuristics
- Head pose normalization
- Eye contact calculations

## Building for Production

```bash
npm run build
npm start
```

## Privacy & Data

- **No Video Upload**: All video processing is client-side only
- **No Audio Recording**: Only audio levels are analyzed, no recordings saved
- **Local Storage**: Session data stored in IndexedDB (browser only)
- **Delete All Data**: Button available in review page to clear all local data

## Browser Compatibility

- **Recommended**: Latest Chrome on macOS
- **Required**: Modern browser with WebRTC, WebAudio, and IndexedDB support

## Environment Variables

- `OPENAI_API_KEY` (optional): For enhanced AI coaching feedback. If not provided, uses deterministic mock responses.

## Troubleshooting

### Camera not working
- Ensure you've granted camera/mic permissions
- Try refreshing the page
- Check browser console for errors
- App will fall back to "Demo Mode" if camera is unavailable

### Face tracking not detecting
- Ensure good lighting
- Face the camera directly
- Check browser console for TensorFlow.js loading errors

### Performance issues
- Close other browser tabs
- Reduce browser window size
- Check that WebGL is enabled (required for TensorFlow.js)

## License

MIT

## Acknowledgments

- Built with Next.js 15
- Face tracking powered by TensorFlow.js and MediaPipe
- UI components styled with Tailwind CSS
- Charts by Recharts

---

**Built for BDPA Hackathon** 🚀

