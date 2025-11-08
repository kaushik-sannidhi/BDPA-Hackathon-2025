# Passionfruit - AI Career Coach & Interview Assistant 🚀

A comprehensive career development platform that combines AI-powered interview practice with intelligent job matching to help you land your dream role. Built with Next.js 15 and modern web technologies.

## ✨ Key Features

### 🎯 Career Pathway Matcher
- **Smart Job Matching**: Advanced algorithm matches your skills with relevant job opportunities
- **Skill Gap Analysis**: Identifies key skills you need to develop for your target roles
- **Salary Insights**: Real-time salary range data for matched positions
- **Responsibility Preview**: Detailed breakdown of day-to-day responsibilities

### 🎤 AI Interview Coach
- **Real-time Feedback**: Instant analysis of your interview performance
- **Face & Speech Analysis**: Tracks eye contact, speech patterns, and body language
- **Practice Sessions**: Record and review mock interviews
- **Personalized Tips**: Actionable suggestions to improve your interview skills

### 📄 Resume Optimization
- **Skills Extraction**: Automatically identifies and extracts skills from your resume
- **ATS Optimization**: Helps format your resume to pass through applicant tracking systems
- **Cover Letter Generator**: AI-powered tool to create tailored cover letters
- **Portfolio Builder**: Showcase your projects and achievements

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **AI & ML**: TensorFlow.js, MediaPipe, OpenAI
- **Data Visualization**: Recharts
- **State Management**: Zustand
- **Storage**: Firebase (Authentication, Firestore), IndexedDB
- **PDF Processing**: PDF.js, React-PDF
- **Testing**: Vitest, React Testing Library

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (for authentication and database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BDPA-Hackathon-2025.git
cd BDPA-Hackathon-2025
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your Firebase and API keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
OPENAI_API_KEY=your_openai_key  # Optional for enhanced features
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Key Workflows

### 1. Career Pathway Discovery
- Navigate to `/dashboard`
- Upload your resume or manually enter your skills
- View personalized job matches with compatibility scores
- Explore skill requirements and salary expectations
- Identify skill gaps and learning opportunities

### 2. AI-Powered Interview Practice
- Go to `/interview`
- Select your target job role and difficulty level
- Complete a mock interview with real-time feedback
- Review your performance metrics and recordings
- Get personalized improvement suggestions

### 3. Resume & Profile Optimization
- Visit `/profile` to manage your skills and experience
- Upload your resume for automatic parsing
- Get suggestions for improving your resume's ATS compatibility
- Generate tailored cover letters for specific job applications

## 🗂 Project Structure

```
├── app/
│   ├── api/                # API routes
│   │   ├── career/         # Job matching endpoints
│   │   ├── coach/          # AI coaching endpoints
│   │   └── extract-skills/ # Resume parsing
│   ├── dashboard/          # User dashboard
│   ├── interview/          # Mock interview interface
│   ├── login/              # Authentication
│   └── page.tsx            # Landing page
├── components/
│   ├── auth/               # Authentication components
│   ├── ui/                 # Reusable UI components
│   ├── CameraPanel.tsx     # Webcam and face tracking
│   ├── CareerPathways.tsx  # Job matching interface
│   └── ...
├── contexts/               # React contexts
├── lib/
│   ├── firebase/           # Firebase configuration
│   ├── jobs.ts             # Job database and matching logic
│   ├── jobMatching.ts      # Skill-based matching algorithm
│   └── __tests__/          # Test files
└── public/                 # Static assets
```

## 🔍 Key Components

### CareerPathways
- Displays job matches based on user skills
- Shows compatibility scores and skill requirements
- Provides salary insights and role descriptions
- Visualizes skill gaps and learning paths

### Job Matching System
- **Skills Database**: Comprehensive collection of job roles and required skills
- **Matching Algorithm**: Weights skills by importance and relevance
- **Scoring System**: 70% match percentage + 30% skill count
- **UI Feedback**: Visual indicators for matched and missing skills

### Interview Analytics
- **Performance Metrics**: Tracks key interview metrics
- **Progress Tracking**: Monitors improvement over time
- **AI Feedback**: Generates personalized coaching tips
- **Session History**: Stores and compares past interviews

## 🧪 Testing

Run the test suite with:
```bash
npm test
# or for UI mode
npm run test:ui
```

Test coverage includes:
- Job matching algorithm
- Skill extraction and parsing
- Face tracking and analysis
- State management
- Utility functions

## 🚀 Building for Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Deploy to Vercel:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2FBDPA-Hackathon-2025)

## 🔒 Privacy & Data Security

- **Client-Side Processing**: All video/audio analysis happens in your browser
- **Optional Cloud Storage**: Choose to save progress to your account (Firebase)
- **Data Encryption**: Sensitive data is encrypted in transit and at rest
- **Transparent Controls**: Easily view and delete your data at any time
- **GDPR Compliant**: Built with privacy regulations in mind

## 🌐 Browser Support

- **Chrome**: Latest 2 versions (recommended)
- **Firefox**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Safari**: 15.4+

*For best experience, use the latest version of Chrome with WebRTC and WebAudio support*

## ⚙️ Configuration

### Required Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Optional
```env
OPENAI_API_KEY=your_openai_key  # For enhanced AI features
```

## 🛠 Troubleshooting

### Authentication Issues
- Clear browser cache and cookies
- Ensure Firebase project is properly configured
- Check browser console for any error messages

### Job Matching Problems
- Make sure your skills are up to date
- Try refreshing the job matches
- Check console for any API errors

### Performance Optimization
- Close unused browser tabs
- Disable browser extensions if experiencing slowdowns
- Ensure hardware acceleration is enabled in browser settings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

## 🙏 Acknowledgments

- Built for the BDPA Hackathon 2025
- Thanks to all contributors who have helped improve this project

## 📞 Support

For support, please [open an issue](https://github.com/yourusername/BDPA-Hackathon-2025/issues) or contact the development team.
- Built with Next.js 15
- Face tracking powered by TensorFlow.js and MediaPipe
- UI components styled with Tailwind CSS
- Charts by Recharts

---

**Built for BDPA Hackathon** 🚀

