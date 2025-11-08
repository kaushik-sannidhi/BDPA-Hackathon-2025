// app/resume/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Disable SSR for the PDF viewer to avoid canvas-related issues
const ResumeViewer = dynamic(
  () => import('./ResumeViewer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

export default function ResumePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ResumeViewer />
    </Suspense>
  );
}