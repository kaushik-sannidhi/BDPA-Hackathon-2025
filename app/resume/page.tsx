// app/resume/page.tsx
'use client';
import dynamic from 'next/dynamic';

const ResumeViewer = dynamic(() => import('./ResumeViewer'), { ssr: false });

export default function Page() {
  return <ResumeViewer />;
}