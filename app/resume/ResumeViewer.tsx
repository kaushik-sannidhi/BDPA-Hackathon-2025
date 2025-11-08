'use client';

import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export default function ResumeViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);

  useEffect(() => {
    // Correct worker path for Next.js + Webpack
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Upload Your Resume</h2>

      <input
        type="file"
        accept="application/pdf"
        className="border p-2 mb-4 block"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(err) => console.error('PDF Load Error:', err)}
        >
          {Array.from({ length: numPages ?? 0 }, (_, i) => (
            <Page key={i + 1} pageNumber={i + 1} width={800} />
          ))}
        </Document>
      ) : (
        <p className="text-gray-500">No PDF uploaded yet.</p>
      )}
    </div>
  );
}